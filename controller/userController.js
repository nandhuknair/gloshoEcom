const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')

//----------get home paage----------

exports.getHome = async function (req, res) {
  res.render("user/index",{userLoggedIn: req.session.userLoggedIn});
};

//----------get login paage----------

exports.getLogin = async (req, res) => {
  res.render("user/login", { data: "" , passwordChanged:" "});
};

//----------get signup paage----------

exports.getSignup = async (req, res) => {
  res.render("user/signup", { data: "" });
};

//----------get otp paage----------

exports.getOTP = async (req,res) => {
  res.render('user/otpVerification',{data:""})
}

//declaring those things outside to transfer the req.body to the otp page 

let reqBody ;
let userMail ;
let hasedPassword ;
let hasedconfirmPassword ;
let OTPData = {
  otp:null,
  expirationTime : null
}
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gloshoecom@gmail.com',
    pass: 'xhde utfz jfib kmlw',
  },
});
let resendForgetOTP;
  
//----------signup action----------

exports.signupAction = async (req, res) => {
 
  try {
    reqBody = req.body ;
    const {email , password , confirmPassword} = reqBody ;
    req.session.userMail = email ;
    console.log(reqBody);
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      res.render("user/signup", {
        data: "You are already a user please Login",
      });
    } else {
       hasedPassword = await bcrypt.hash(password, 10);
       hasedconfirmPassword = await bcrypt.hash(confirmPassword, 10);
      
    // Generate otp

   OTPData.otp = Math.floor(100000 + Math.random() * 900000);
   OTPData.expirationTime = Date.now() + 60000

   // Send otp via email
   const mailOptions = {
    from: 'gloshoecom@gmail.com',
    to: email,
    subject: 'otp Verification',
    text: `Your otp for registration is ${OTPData.otp}. Please use this for registration.`,
  };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.render('user/signup', { data: "Error sending otp. Please try again." });
    } else {
      res.render('user/otpVerification',{data:""});
    }
  });
    }
  } catch (error) {
    console.log(error);
    res.render('user/signup', { data: "Error processing registration. Please try again." });
  }
};

//----------otp action----------

exports.otpAction = async (req, res) => {
  const { userName, email, number } = reqBody;
  console.log("reqbody is ", reqBody);
  try {
    const { otp } = req.body;
    if (
      OTPData.otp &&
      Date.now() < OTPData.expirationTime &&
      otp === OTPData.otp.toString()
    ) {
      const newUser = new User({
        userName: userName,
        email: email,
        number: number,
        password: hasedPassword,
        confirmPassword: hasedconfirmPassword,
      });
      await newUser.save();
      // req.session.userLoggedIn = true
      console.log(req.session.userLoggedIn);
      res.redirect("/login");
    } else {
      res.render("user/otpVerification", { data: "Incorrect or Expired otp" });
    }
  } catch (error) {
    console.log(error);
  }
};



//----------login action----------

exports.loginAction = async (req, res) => {
  console.log("This is req.body of the login", req.body);
  const { email, password } = req.body;
  const userExist = await User.findOne({ email: email });
  if (userExist.email !== email) {
    res.render("user/login", { data: "You are not a User Please SignUp", passwordChanged:""});
  } else {
    const passwordMatch = await bcrypt.compare(password, userExist.password );
      if (!passwordMatch) {
      res.render("user/login", { data: "Wrong Password" , passwordChanged:""});
    } else {
      req.session.userLoggedIn = true;
      res.redirect("/");
    }
  }
};

//---------- logout action ----------

exports.userLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

//---------- get forget password page ----------

exports.getForgotPass = (req,res)=> {
  res.render('user/forgotPassword',{data:""})
}

//---------- forgot password action  ----------

exports.sendOTP = async (req,res)=> {
  try {
  OTPData.otp = Math.floor(100000 + Math.random() * 900000);
  OTPData.expirationTime = Date.now() + 60000;
  userMail = req.body.email;
  console.log('User mail is',userMail)
  // Send otp via email
  const mailOptions = {
    from: "gloshoecom@gmail.com",
    to: userMail,
    subject: "otp Verification",
    text: `Your otp for registration is ${OTPData.otp}. To reset your password type this .`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.render("user/forgotPassword", {
        data: "Error sending otp. Please try again.",
      });
    } else {
      // resendForgetOTP = true
      res.redirect("/forgot_password/otp");
    }
  });
  } catch (error) {
    console.log(error)
  }
}

//---------- forget password otp page  ----------

exports.getForgetPassOtp = (req,res)=> {
  res.render('user/forgetPassOtp',{data:""})
}

//---------- forget password otp action  ----------

exports.postForgetPassOtp = (req,res)=> {
  try {
    const { otp } = req.body;
    if (
      OTPData.otp &&
      Date.now() < OTPData.expirationTime &&
      otp === OTPData.otp.toString()
    ) {
      res.redirect("/reset_password");
    } else {
      res.render("user/forgetPassOtp", { data: "Incorrect or Expired otp" });
    }
  } catch (error) {
    console.log(error);
  } 
  }

  //---------- get reset password page  ----------
 
  exports.resetPassword = (req,res)=>{
    res.render('user/resetPassword',{data:""}) 
  }

   //---------- reset password action  ----------

  exports.newPassword = async(req,res)=> {
    try {
    
      const {password , confirmPassword} = req.body
      const hashedPassword = await bcrypt.hash(password,10)
      const hashedconfirmPassword = await bcrypt.hash(confirmPassword,10)
      console.log('User mail is',userMail)
      const userExist =await User.findOneAndUpdate({email:userMail},{$set:{password:hashedPassword,confirmPassword:hashedconfirmPassword}},{new:true})
      
      if(userExist){
        res.render('user/login',{data: "",passwordChanged:"Successfully changed the password"})
      }else{
        res.render('user/resetPassword',{data:"Error occur while changing password please try again"}) 
      }
      
      }
    catch (error) {
        console.log(error)
    }
    

  }

//----------resend otp----------

// Add a parameter to the resendOTP route
exports.resendOTP = async (req, res) => {
  try {
    const { type } = req.query; // Get the type parameter from the query string
    console.log('7846782634812634827364]][][]][]]]]]]]]]]]]]]]]]]41237846123417826347  HERE IS THIS REQ QUERY USED============', type)

    OTPData.otp = Math.floor(100000 + Math.random() * 900000);
    OTPData.expirationTime = Date.now() + 60000;

    // Use the type parameter to determine the email address
    const USERMAIL = type === 'forgot' ? userMail : req.session.userMail;

    // Send otp via email
    const mailOptions = {
      from: 'gloshoecom@gmail.com',
      to: USERMAIL,
      subject: 'otp Verification',
      text: `Your otp for registration is ${OTPData.otp}. Please use this for registration.`,
    };
   console.log("Resend mail sended")
    transporter.sendMail(mailOptions, (error, info) => {
      console.log('Entered to transporter')
      if (error) {
        console.log('This is the error occur while forget resend =============================', error);
        if (type === 'forgot') {
          res.render('user/forgotPassword', { data: 'Error sending otp. Please try again.' });
          console.log('ERROR OCCURRED AND REDIRECT TO THE RED PAGE')
        } else {
          res.render('user/otp_Verification', { data: 'Error sending otp. Please try again.' });
        }
      } else {
        if (type === 'forgot') {
          res.redirect('/forgot_password/otp');
        } else {
          res.redirect('/otp_Verification');
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
