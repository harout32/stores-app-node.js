const passport = require('passport');
const crypto = require('crypto');
const {User} = require('../models/User');
const mail = require('../handlers/mail');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Faild Login',
  successRedirect: '/',
  successFlash: 'You are Logied in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'you are successfullt loged out');
  res.redirect('/');
};

exports.islogedIn = (req, res, next) => {
  //first check if the user is authenticated 
if(req.isAuthenticated()) {
  next(); // carry on you are logged in
  return;
}
req.flash('error', 'OOps you must be logged In !!');
res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // see if that user exist
  const user = await User.findOne({email: req.body.email});
  if(!user){
    req.flash('error', 'No account with that email exists')
    return resize.redirect('/login');
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); //gerandom string and conver it to hex
  user.resetPasswordExpires = Date.now() + 3600000; // 1 houre from now
  await user.save();
  //reset token and exipre date on the account
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'password reset',
    resetURL
  });
  req.flash('success', `you have emailed a password reset Link`);
  // send them email with the token
  res.redirect('/login');
  // reset password and redirect
}

exports.reset = async (req, res) => {
  //$gt  greater that than the existing resetPasswordExpires > Date.now()
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  });
  if(!user){
    req.flash('error', 'Password reset is invalid')
    return res.redirect('/login');
  }
  res.render('reset', {title: 'Reset your Password'});
  //if there is a user show the reset form
}

//check  if the two passwords are the same
exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm']){
    return next();
  }
  req.flash('error', 'password do nt match');
  res.redirect('back');
}

//update the user password
exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  });
  if(!user){
    req.flash('error', 'Password reset is invalid')
    return res.redirect('/login');
  }
// setPassword availble because of the plug in used in the userSchema
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  //get rid of the two field in MongoDB with assiging theme to undefined
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updateUser = await user.save();
  await req.login(updateUser);
  req.flash('success', ' Nice your Password has been updated!!')
  res.redirect('/');
}