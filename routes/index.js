const express         = require('express');
const router          = express.Router();
const storeController = require('../controllers/storeController');
const userController  = require('../controllers/userController');
const authController  = require('../controllers/authController');
const reviewController  = require('../controllers/reviewController');

const { catchErrors } = require('../handlers/errorHandlers');
// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.islogedIn, storeController.addStore);

router.post(
'/add',
//uplaod controller has its own error handler with callbacks
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore)
);
router.post(
'/add/:id',
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore)
);

router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/tags', catchErrors(storeController.getStoreByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login); 
router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
  );
router.get('/logout', authController.logout);
router.get('/account', authController.islogedIn, userController.account);
router.post('/account', authController.islogedIn, catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmedPasswords, catchErrors(authController.update));
router.get('/map', storeController.mapPage);
router.get('/heart', authController.islogedIn, catchErrors(storeController.getHearts));
router.post('/reviews/:id', authController.islogedIn, catchErrors(reviewController.addReview));

// API
//you can do it with versions /api/v1/search

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
