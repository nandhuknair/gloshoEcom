const { adminPanel } = require("../controller/adminController");

module.exports = {
  userSession: (req, res, next) => {
    if (req.session.userLoggedIn) {
      res.redirect("/");
    } else {
      next();
    }
  },

adminSession: (req, res, next) => {
    if (req.session.admin) {
       res.redirect("/admin_panel");
    } else {
      next()
    }
  },

  adminActivity: (req, res, next) => {
    if (req.session.admin) {
       next()
    } else {
      res.redirect('/admin_login')
    }
  },


};


