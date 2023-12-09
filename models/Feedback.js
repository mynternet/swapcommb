const { Schema, model } = require("mongoose");

const feedbackSchema = new Schema({
  rating: Number,
  comment: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  item: { type: Schema.Types.ObjectId, ref: 'Item' },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = model("Feedback", feedbackSchema);
module.exports = Feedback;
