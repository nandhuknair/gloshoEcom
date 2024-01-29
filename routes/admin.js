const express = require('express')
const router = express.Router()

router.get('/admin_login',(req,res)=> {
    res.render('admin/adminLogin')
})
module.exports = router