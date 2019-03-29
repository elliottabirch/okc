const rx = require('rxjs');
const Promise = require('bluebird');
const _ = require('lodash');
const hl = require('highland');
const async = require('async');
const { User, Question } = require('../index');
const AsyncCache = require('async-cache');

const { Observable } = require('rxjs');

// Adapted from https://github.com/Reactive-Extensions/rx-node/blob/87589c07be626c32c842bdafa782fca5924e749c/index.js#L52
function fromStream(stream, finishEventName = 'end', dataEventName = 'data') {
  stream.pause();

  return Observable.create((observer) => {
    // This is the "next" event
    const data$ = Observable.fromEvent(stream, dataEventName);

    // Map this into an error event
    const error$ = Observable.fromEvent(stream, 'error')
      .flatMap(err => Observable.throw(err));

    // Shut down the stream
    const complete$ = Observable.fromEvent(stream, finishEventName);

    // Put it all together and subscribe
    const sub = data$
      .merge(error$)
      .takeUntil(complete$)
      .subscribe(observer);

    // Start the underlying node stream
    stream.resume();

    // Return a handle to destroy the stream
    return sub;
  })

  // Avoid recreating the stream on duplicate subscriptions
    .share();
}


function createNewQuestion({ author, staff, submits, genre, lang_code, language, qans1, qans2, qans3, qans4, qid, qtext, raciness }) {
  return new Promise((resolve, reject) => {
    Question.create({ author, staff, submits, genre, lang_code, language, qans1, qans2, qans3, qans4, qid, qtext, raciness }, (err, newUser) => {
      if (err) {
        return reject(err);
      }
      return resolve(newUser);
    });
  });
}

function saveUser(user) {
  return new Promise((resolve, reject) => {
    user.save((err, updatedUser) => {
      if (err) {
        return reject(err);
      }
      return resolve(updatedUser);
    });
  });
}
const questionCache = new AsyncCache({
  maxAge: 600000,
  load: (qid, cb) => Question.findOne(
    { qid }).exec(cb),
});

function findQuestion(qid) {
  return new Promise((resolve, reject) => {
    questionCache.get(qid, (err, question) => {
      if (err) { return reject(err); }
      return resolve(question);
    });
  });
}

const processOrder = (user, cb) => {
  if (!user.questions[0].qid) {
    console.log('skipping user');
    return cb();
  }
  console.log(`starting user ${user._id}`);
  async.mapLimit(user.questions, 1, (question, mCb) => {
    question.qid ? questionCache.get(question.qid, mCb) : mCb(null, {});
  }, (err, dbQuestions) => {
    if (err) { return cb(err); }
    const updatedQuestions = _.zipWith(user.questions, dbQuestions, (oq, nq) => {
      oq.questionId = nq._id || oq.questionId;
      return oq;
    })
      .map(({ questionId, adjustment, autoscore, axes, noskip, score, status, target, username, viewer }) => ({ questionId, adjustment, autoscore, axes, noskip, score, status, target, username, viewer }));

    user.questions = updatedQuestions;
    user.save((err, newUser) => {
      if (err) { return cb(err); }
      console.log(`saved new user${newUser._id}`);
      return cb();
    });
  });
};


const stream = User.find().stream();
hl(stream).map(hl.wrapCallback(processOrder)).parallel(2).done((err) => {
  if (err) { console.log(err); }
  console.log('done');
},
);

// const stream = User.find().stream();
// fromStream(stream)
//   .map((user) => {
//     console.log();
//     return rx.Observable
//       .from(user.questions)
//       .map(question => rx.Observable
//         .of(question.qid)
//         .map(qid => (qid ? rx.Observable.fromPromise(findQuestion(qid)) : rx.Observable.of({ _id: question.questionId })))
//         .mergeAll(1)
//         .map((dbQuestion) => {
//           question.questionId = dbQuestion._id;
//           return question;
//         })
//         .map(({ questionId, adjustment, autoscore, axes, noskip, score, status, target, username, viewer }) => ({ questionId, adjustment, autoscore, axes, noskip, score, status, target, username, viewer })))
//       .mergeAll(1)
//       .scan((allQuestions, formattedQuestion) => allQuestions.concat([formattedQuestion]), [])
//       .last()
//       .map((questions) => {
//         console.log();
//         return Object.assign(user, { questions });
//       })
//       .map((updatedUser) => {
//         console.log();
//         return rx.Observable.fromPromise(saveUser(updatedUser));
//       })
//       .mergeAll(1);
//   })
//   .mergeAll(1)

//   .subscribe(user => console.log(`updated ${user._id}`), (err) => {
//     console.error(err.stack);
//   }, () => console.log('done'));

// const str = User.find({}).stream();
// fromStream(str)
//   .map(user => rx.Observable
//     .from(user.questions)
//     .map(question => rx.Observable.of(question.qid)
//       .skipWhile(qid => !qid)
//       .map(qid => rx.Observable.fromPromise(findQuestion(qid)))
//       .mergeAll()
//       .skipWhile(dbQuestion => !!dbQuestion)
//       .map(() => question))
//     .mergeAll())
//   .mergeAll()
//   .distinct(question => question.qid)
//   .mergeMap(question => rx.Observable.fromPromise(createNewQuestion(question)), null, 1)
//   .subscribe(user => console.log(`updated ${user.qid}`), (err) => {
//     console.error(err.stack);
//   }, () => console.log('done'));
