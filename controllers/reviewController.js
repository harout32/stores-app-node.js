const { Review } = require('../models/Review');

exports.addReview = async (req, res) => {
  console.log('hahahah');
  req.body.author = req.user._id;
  req.body.store  = req.params.id;
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review Saved!');
  res.redirect('back');
}