let express = require('express')
let router = express.Router()
let adminController = require('../controller/adminController')
let session = require('../middleware/session')
let offerController = require('../controller/offerController')


router.get('/admin_login',session.adminSession,adminController.getLogin)
router.get('/admin_panel',adminController.adminPanel)
router.get('/admin/forgot_password',session.adminSession,adminController.forgotPassword)
router.get('/admin/resend_otp',session.adminSession,adminController.resendOtp)
router.get('/admin_logout',adminController.adminLogout)
router.get('/sales_data', adminController.getSalesData);

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
router.delete('/delete_product_image',session.adminActivity,adminController.deleteImageFromEdit)
  

router.get('/admin_orders',session.adminActivity,adminController.orderDetails)
router.post('/update_orderStatus',session.adminActivity,adminController.updateOrderStatus)

router.get('/admin_offers',session.adminActivity,offerController.getOffer)
router.get('/add_product_offer',session.adminActivity,offerController.getProductOffer)
router.get('/add_category_offer',session.adminActivity,offerController.getCategoryOffer)
router.post('/add_product_offer',session.adminActivity,offerController.addProductOffer)
router.post('/add_category_offer',session.adminActivity,offerController.addCategoryOffer)

router.post('/admin_delete_product_offer',session.adminActivity,offerController.deleteProductOffer)
router.post('/admin_delete_category_offer',session.adminActivity,offerController.deleteCategoryOffer)

router.get('/admin_coupon',session.adminActivity,offerController.getCoupon)
router.post('/admin_add_coupon',session.adminActivity,offerController.addCoupon)
router.post('/admin_edit_coupon',session.adminActivity,offerController.editCoupon)
router.post('/admin_deactive_coupon',session.adminActivity,offerController.deactiveCoupon)
router.post('/admin_activate_coupon',session.adminActivity,offerController.activateCoupon)

router.get('/admin_salesreport',session.adminActivity,adminController.getSalesReport)
router.get('/admin_salesreport/download',session.adminActivity,adminController.downloadSalesReport)


router.get('/admin_banner',session.adminActivity,adminController.getBanner)
router.post('/admin_banner_add',session.adminActivity,adminController.uploadSingle,adminController.addBanner)
router.post('/admin_banner_edit',session.adminActivity,adminController.uploadSingle,adminController.editBanner)
router.get('/admin_banner_delete',session.adminActivity,adminController.deleteBanner)


module.exports = router
























 











