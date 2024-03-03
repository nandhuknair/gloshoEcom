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
router.get('/wallet',sessionCheck.userActivity,userController.getWallet)
router.get('/wallet_history',sessionCheck.userActivity,userController.getWalletHistory)



//-------------------User Cart Management---------------------------

router.get('/cart',sessionCheck.userActivity,userController.viewCart)
router.post('/cart',sessionCheck.userActivity,userController.addToCart)
router.get('/remove_cart_products',sessionCheck.userActivity,userController.removeCartProducts)
router.post('/edit_cart',sessionCheck.userActivity,userController.editCart)
router.get('/cart/count',userController.cartCount)

//-------------------Checkout page Management---------------------------

router.get('/checkout',sessionCheck.userActivity,userController.getCheckoutPage)
router.post('/confirmOrder',sessionCheck.userActivity,userController.confirmOrder)
router.post('/add_address_checkout',sessionCheck.userActivity,userController.addAddressFromCheckout)
router.post('/placeorderafterpayment',sessionCheck.userActivity,userController.placeOrder)
  

//-------------------Order Management---------------------------

router.get('/my_order',sessionCheck.userActivity,userController.myOrder)
router.get('/my_order_details',sessionCheck.userActivity,userController.myOrderDetails)
router.post('/cancel_order',sessionCheck.userActivity,userController.cancelOrder)
router.post('/return_order',sessionCheck.userActivity,userController.returnItem)
router.get('/wallethistory',sessionCheck.userActivity,userController.getWalletHistory)


 
//-------------------Search And Sort Management---------------------------

router.get('/search',userController.searchAction)
router.get('/men_collections',userController.menCollection)
router.get('/women_collections',userController.womenCollection)
router.get('/products',userController.getProductsByCategory)

//-------------------WishList Management---------------------------

router.get('/wishlist',sessionCheck.userActivity,userController.getWishlist)
router.post('/wishlist',sessionCheck.userActivity,userController.addToWishlist)
router.get('/remove_wishlist_products',sessionCheck.userActivity,userController.removeWishItem)
router.get('/wishlist/count',userController.wishlistCount)

router.post('/check_coupon',sessionCheck.userActivity,userController.checkCoupon)


























module.exports = router;
