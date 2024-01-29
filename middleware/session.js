module.exports = {
  userSession :(req,res,next)=> {
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        next()
    }
  }
};


