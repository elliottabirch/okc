const mongoose = require('mongoose');


const mongoUri = 'mongodb://localhost:27017/okc';


mongoose.connect(mongoUri);
mongoose.connection.on('error', (err) => {
  console.log(err);
});
mongoose.connection.once('open', () => {
  console.log(`Connected to ${mongoUri}`);
});

const User = require('./UserSchema');
const Question = require('./QuestionSchema');
const Setting = require('./SettingSchema');

module.exports = {
  User,
  Question,
  Setting,
};
