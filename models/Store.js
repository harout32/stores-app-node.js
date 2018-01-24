const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const  slug = require('slugs');
const storeSchema = new mongoose.Schema({ 
name:{
  type: String,
  trim:true,
  //instead of useing true if any thing 
  //went wrong this error message gonna show up
  required: 'please enter a store name!',
},
slug:String,
description:{
  type:String,
  trim:true
},
tags:[String],
created:{
  type: Date,
  default: Date.now
},
location: {
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: [{
    type: Number,
    required: 'You Must Suplly Coordinates!'
  }],
  address: {
    type: String,
    required: 'You Must Supply an Address'
  }
},
photo: String,
author: {
  type: mongoose.Schema.ObjectId,
  ref: 'User',
  required: ' You Must supply an author'
}
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

//define the indexes
storeSchema.index({
  name: 'text',
  description: 'text'

})
//
storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
  }
  this.slug = slug(this.name);
 const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
 const storesWithSlug = await this.constructor.find({slug: slugRegEx});
 if(storesWithSlug.length){
   this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
 }
 next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group : {_id:'$tags', count:{ $sum:1 } }},
    { $sort: {count: -1} }
  ])
}
// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});
// Virtual propereties is hidden by default
//  toJSON: {virtual: true},
// toObject: {virtual: true}
const Store = mongoose.model('Store', storeSchema);
module.exports = { Store };
