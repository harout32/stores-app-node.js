const { User } = require('../models/User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  //have this mothods from the (express-validator) middleware we apllied preveusly
  req.sanitizeBody('name');
  req.checkBody('name', 'you Must supply a name!!').notEmpty();
  req.checkBody('email', 'That email is not valid').notEmpty()
  .isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extention: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Empty!!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password can not be Empty!! ').notEmpty();
  req.checkBody('password-confirm', 'Ooops!! your passwords does not match').equals(req.body.password);
  const errors = req.validationErrors();// returns an array of the validation errors that specified above
  if (errors) {
    req.flash('error', errors.map((err) => err.msg));
    res.render('register',
      { title: 'Register',
      body: req.body,
      flashes: req.flash()
      });
  return;// stop excuting the function if there is an error
  }
  //if there is no errors call next
  next();
};

exports.register = async(req, res, next) => {
const user = new User({ email: req.body.email, name: req.body.name }); 
const register = promisify(User.register, User);
await register(user, req.body.password);
next();
}

exports.account = (req, res) => {
  res.render('account', {title: 'Edit your Acount'});
}
exports.updateAccount = async(req, res) => {
  const updates = {
    name: req.body.name,
    email:req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id},
    { $set: updates},
    {new: true, runValidators: true, context: 'query'}
  )
  req.flash('success', 'Updated the profile')
  res.redirect('back');
};