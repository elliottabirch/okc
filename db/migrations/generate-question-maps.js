const { User, Question, Setting } = require('../index');
const async = require('async');
const _ = require('lodash');
const log4js = require('log4js');

log4js.configure({
  appenders: { questionMap: { type: 'file', filename: 'question-map.log' } },
  categories: { default: { appenders: ['questionMap'], level: 'debug' } },
});

const log = log4js.getLogger('questionMap');

// const questionCache = new AsyncCache({
//   maxAge: 600000,
//   load: (_id, cb) => Question.findOne(
//     { _id }).exec(cb),
// });
log.info('-------STARTING--------');
Setting.findOneAndUpdate({ name: 'report' }, { $inc: { value: 1 } }, { upsert: true, new: true }, (err, setting) => {
  if (err) { return log.error(err); }
  return Question.aggregate([
    {
      $match: { seen: { $gt: 500 } },
    },
    {
      $project: { answersArray: ['$qans1', '$qans2', '$qans3', '$qans4'] },
    },
    {
      $unwind: {
        path: '$answersArray',
        includeArrayIndex: 'index',
      },
    },
    {
      $match: { answersArray: { $ne: '' } },
    },
    {
      $project: { index: 1 },
    },
  ]).exec((err, questions) => {
    if (err) { return log.error(err); }
    const questionsById = _.keyBy(questions, '_id');
    return async.eachLimit(questions, 1, (question, eCb) => {
      User.aggregate([
        {
          $match: {
            questions: {
              $elemMatch: {
                questionId: question._id,
                'target.answer': question.index + 1,
              },
            },
          },
        },
        {
          $unwind: '$questions',
        },
        {
          $project:
          {
            questionId: '$questions.questionId',
            answer: '$questions.target.answer',
          },
        },
        {
          $match: {
            questionId: { $ne: question._id },
          },
        },
        {
          $group:
          {
            _id:
              {
                questionId: '$questionId',
                answer: '$answer',
              },
            count: { $sum: 1 },

          },
        },
      ]).exec((err, groups) => {
        if (err) { return eCb(err); }
        const data = {};
        groups.forEach(({ _id: { questionId, answer }, count }) => {
          if (questionsById[questionId]) {
            data[questionId] = data[questionId] || {};
            data[questionId][answer] = count;
          }
        });
        return Question.findOne({ _id: question._id }).exec((err, dbQuestion) => {
          if (err) { return eCb(err); }
          dbQuestion.data = dbQuestion.updatedBy === setting.value ? dbQuestion.data : {};
          dbQuestion.updatedBy = setting.value;
          dbQuestion.data[question.index + 1] = data;
          dbQuestion.markModified('data');
          return dbQuestion.save((err, res) => {
            if (err) { eCb(err); } else {
              log.info(`Updated question: ${res.qid}, index ${question.index + 1}`);
              eCb();
            }
          });
        });
      });
    }, (err) => {
      if (err) { return log.error(err); }
      return log.info('done');
    });
  });
});
