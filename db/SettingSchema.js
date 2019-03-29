const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Setting = new Schema({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  name: { type: String, required: true },
  value: Number,
  data: Schema.Types.Mixed,
});

module.exports = mongoose.model('Setting', Setting);
