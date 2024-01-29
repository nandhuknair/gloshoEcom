let express = require("express");
let router = express.Router();
let userController = require("../controller/userController");
let sessionCheck = require('../middleware/session')



/* GET home page. */
router.get("/",userController.getHome);

router.get("/login",sessionCheck.userSession,userController.getLogin);
router.get("/signup",sessionCheck.userSession,userController.getSignup);
router.get('/otp_verification',sessionCheck.userSession, userController.getOTP)
router.get('/resend_otp',sessionCheck.userSession,userController.resendOTP) 
router.get("/logout",userController.userLogout);

router.post("/signup",userController.signupAction);
router.post('/otp_verification',userController.otpAction)
router.post("/login",userController.loginAction);

router.get('/forgot_password',sessionCheck.userSession,userController.getForgotPass)
router.post('/forgot_password',userController.sendOTP)
router.get('/forgot_password/otp',sessionCheck.userSession,userController.getForgetPassOtp)
router.post('/forgot_password/otp',userController.postForgetPassOtp)
router.get('/reset_password',sessionCheck.userSession,userController.resetPassword)
router.post('/reset_password',userController.newPassword)









module.exports = router;
