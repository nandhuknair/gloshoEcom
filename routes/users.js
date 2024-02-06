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








module.exports = router;
