let express = require('express')
let router = express.Router()
let adminController = require('../controller/adminController')
let session = require('../middleware/session')

router.get('/admin_login',session.adminSession,adminController.getLogin)
router.get('/admin_panel',adminController.adminPanel)
router.get('/admin/forgot_password',session.adminSession,adminController.forgotPassword)
router.get('/admin/resend_otp',session.adminSession,adminController.resendOtp)
router.get('/admin_logout',adminController.adminLogout)


router.post('/admin/forgot_password',adminController.sendOTP)
router.post('/admin_login',adminController.loginAction)
router.post('/admin/forgot_password/otp',adminController.resetPage)
router.post('/admin/reset_password',adminController.resetPassword)
     
                           
router.get('/admin_usermanagement',session.adminActivity,adminController.userManagemnt)
router.get('/admin/block_user',session.adminActivity,adminController.blockUser)
router.get('/admin/unblock_user',session.adminActivity,adminController.unblockUser)


router.get('/admin_category',session.adminActivity,adminController.getCategory)
router.post('/admin_edit_category',session.adminActivity,adminController.editCategory)
router.post('/admin_add_category',session.adminActivity,adminController.addCategory)
router.get('/admin_list_category',session.adminActivity,adminController.listCategory)
router.get('/admin_unlist_category',session.adminActivity,adminController.unlistCategory)
   

router.get('/admin_products',session.adminActivity,adminController.getProducts)
router.post('/admin_add_product',session.adminActivity,adminController.upload,adminController.addProducts)
router.post('/admin_edit_product',session.adminActivity,adminController.upload,adminController.editProducts)
router.get('/admin_list_product',session.adminActivity,adminController.listProduct)
router.get('/admin_unlist_product',session.adminActivity,adminController.unListProduct)


router.get('/admin_orders',session.adminActivity,adminController.orderDetails)
router.post('/update_orderStatus',session.adminActivity,adminController.updateOrderStatus)















 












module.exports = router