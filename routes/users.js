let express = require("express");
let router = express.Router();
let userController = require("../controller/userController");
let sessionCheck = require('../middleware/session')


/* GET home page. */
router.get("/",userController.getHome);

router.get("/login",sessionCheck.userSession,userController.getLogin);
router.get("/signup",sessionCheck.userSession,userController.getSignup);
router.get('/resend_otp',sessionCheck.userSession,userController.resendOTP) 
router.get("/logout",userController.userLogout);

router.post("/signup",userController.signupAction);
router.post('/otp_verification',userController.otpAction)
router.post("/login",userController.loginAction);

router.get('/forgot_password',sessionCheck.userSession,userController.getForgotPass)
router.post('/forgot_password',userController.sendOTP)
router.post('/forgot_password/otp',userController.postForgetPassOtp)
router.post('/reset_password',userController.newPassword)


//-------------------Product Management---------------------------

router.get('/all_products',userController.listProducts)
router.get('/product',userController.productDetails)


//-------------------User Account Management---------------------------

router.get('/profile',sessionCheck.userActivity,userController.getProfile)
router.post('/change_userName',sessionCheck.userActivity,userController.changeUserName)
router.post('/add_address',sessionCheck.userActivity,userController.addAddress)
router.post('/change_password',sessionCheck.userActivity,userController.changePassword)
router.get('/delete_address/:addressId',sessionCheck.userActivity,userController.deleteAddress)
router.post('/edit_address/:addressId',sessionCheck.userActivity,userController.editAddress)
router.get('/resetMessage',sessionCheck.userActivity,userController.resetMessage)
router.get('/my_order',sessionCheck.userActivity,userController.myOrder)


//-------------------User Cart Management---------------------------

router.get('/cart',sessionCheck.userActivity,userController.viewCart)
router.post('/cart',sessionCheck.userActivity,userController.addToCart)
router.get('/remove_cart_products',sessionCheck.userActivity,userController.removeCartProducts)
router.post('/edit_cart',sessionCheck.userActivity,userController.editCart)

//-------------------Checkout page Management---------------------------

router.get('/checkout',userController.getCheckoutPage)






























module.exports = router;
