const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  created: {
    type:Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'you must supply an author'
  },
  store: {
    type:mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store'
  },
  text: {
    type: String,
    required: 'Your review must have a text !'
  },
  rating: {
    type:Number,
    min: 1,
    max: 5
  }
});
function autoPopulate(next) {
  this.populate('author');
  next();
}
reviewSchema.pre('find', autoPopulate);
reviewSchema.pre('findOne', autoPopulate);

const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };