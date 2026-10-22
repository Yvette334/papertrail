const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, required: true, trim: true, lowercase: true },
    year: { type: Number, required: true },
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (opts) => opts.length >= 2,
        message: 'A question needs at least 2 options',
      },
    },
    // Index of the correct option in the `options` array.
    // select: false keeps it OUT of normal query results so the API never
    // leaks answers to students. The scoring service must opt in explicitly
    // with .select('+correctAnswerIndex').
    correctAnswerIndex: {
      type: Number,
      required: true,
      select: false,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value >= 0 && value < this.options.length;
        },
        message: 'correctAnswerIndex must point to one of the options',
      },
    },
    explanation: { type: String, trim: true },
  },
  { timestamps: true }
);

// Questions are mostly looked up by subject and year, so index them.
questionSchema.index({ subject: 1, year: 1, topic: 1 });

module.exports = mongoose.model('Question', questionSchema);
