const mongoose = require('mongoose');

const schema = mongoose.Schema;

const md5 = require('md5');
const validator = require('validator');
const mongooseErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply email address'
  },
  name: {
    type: String,
    required: 'Please Supply a name',
    trim: true
  },
  resetPasswordExpires: Date,
  resetPasswordToken: String,

  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Store' }
  ]
});
//virtual field generated on a fly not stored in the DB
userSchema.virtual('gravatar').get( function() {
  const hash = md5(this.email);
return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongooseErrorHandler);

const User = mongoose.model('User', userSchema);
module.exports = { User };
