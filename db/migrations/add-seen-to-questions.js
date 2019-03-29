const hl = require('highland');
const { User, Question, Setting } = require('../index');
const AsyncCache = require('async-cache');
const async = require('async');
const _ = require('lodash');

// const questionCache = new AsyncCache({
//   maxAge: 600000,
//   load: (_id, cb) => Question.findOne(
//     { _id }).exec(cb),
// });

Setting.findOneAndUpdate({ name: 'report' }, { $inc: { value: 1 } }, { upsert: true, new: true }, (err, setting) => {
  const processUsers = (user, cb) => {
    // if (user.questions.length > 50 && user.questions.length < 1000) {
    console.log(`starting user: ${user._id} with ${user.questions.length} questions`);
    async.eachSeries(user.questions, (userOriginalQuestion, eCb) => {
      // console.log(`getting question: ${userOriginalQuestion.questionId}`);
      Question.findOne({ _id: userOriginalQuestion.questionId }).exec((err, originalQuestion) => {
        if (err) { return eCb(err); }
        originalQuestion.data = originalQuestion.data || {};
        // const questionBank = originalQuestion.updatedBy === setting.value ? originalQuestion.data : {};
        originalQuestion.seen = originalQuestion.updatedBy === setting.value ? originalQuestion.seen : 0;
        originalQuestion.updatedBy = setting.value;
        originalQuestion.seen++;
        // if (originalQuestion.submits > 1000000) {
        //   return async.eachLimit(user.questions, 100, (userComparedQuestion, ieCb) => {

        // Question.findOne(
        //   { _id: userComparedQuestion.questionId }).exec((err, comparedQuestion) => {
        //   if (err) { return ieCb(err); }
        //   if (comparedQuestion.submits > 1000000 && userComparedQuestion.questionId !== userOriginalQuestion.questionId) {
        //     questionBank[userOriginalQuestion.target.answer] = questionBank[userOriginalQuestion.target.answer] || {};
        //     questionBank[userOriginalQuestion.target.answer][comparedQuestion.qid] = questionBank[userOriginalQuestion.target.answer][comparedQuestion.qid] || {};
        //     questionBank[userOriginalQuestion.target.answer][comparedQuestion.qid][userComparedQuestion.target.answer] = questionBank[userOriginalQuestion.target.answer][comparedQuestion.qid][userComparedQuestion.target.answer] || 0;
        //     questionBank[userOriginalQuestion.target.answer][comparedQuestion.qid][userComparedQuestion.target.answer] += 1;
        //   }
        //   return ieCb();
        // });
        // }, (err) => {
        //   if (err) { return eCb(err); }
        // originalQuestion.data = questionBank;
        // originalQuestion.markModified('data');
        return originalQuestion.save((err, savedQuestiopns) => {
          if (err) { return eCb(err); }
          return eCb();
        });
        // });
        // }
        // return eCb();
      });
    }, (err) => {
      if (err) { return cb(err); }
      console.log(`finished user with id: ${user.id}`);
      return cb(null);
    });
    // } else { cb(); }
  };


  const stream = User.find().stream();
  hl(stream).map(hl.wrapCallback(processUsers)).parallel(1).done((err) => {
    if (err) { console.log(err); }
    console.log('done');
  });
});
