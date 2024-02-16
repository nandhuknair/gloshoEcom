const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const Cart = require("../model/cartModel");
let checkoutAccess = false

//----------get home paage----------

exports.getHome = async function (req, res) {
  res.render("user/index", { userLoggedIn: req.session.userLoggedIn });
  console.log(req.session.userLoggedIn);
};

//----------get login paage----------

exports.getLogin = async (req, res) => {
  res.render("user/login", { data: "", passwordChanged: " " });
};

//----------get signup paage----------

exports.getSignup = async (req, res) => {
  res.render("user/signup", { data: "" });
};

//declaring those things outside to transfer the req.body to the otp page

let reqBody;
let userMail;
let hasedPassword;
let hasedconfirmPassword;
let OTPData = {
  otp: null,
  expirationTime: null,
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

//----------signup action----------

exports.signupAction = async (req, res) => {
  try {
    reqBody = req.body;
    const { email, password, confirmPassword } = req.body;
    req.session.userMail = email;
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
      OTPData.expirationTime = Date.now() + 60000;

      // Send otp via email
      const mailOptions = {
        from: "gloshoecom@gmail.com",
        to: email,
        subject: "otp Verification",
        text: `Your otp for registration is ${OTPData.otp}. Please use this for registration.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.render("user/signup", {
            data: "Error sending otp. Please try again.",
          });
        } else {
          res.render("user/otpVerification", { data: "" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.render("user/signup", {
      data: "Error processing registration. Please try again.",
    });
  }
};

//----------otp action----------

exports.otpAction = async (req, res) => {
  console.log(
    "==================asdfar2q35arte5===========================",
    OTPData.otp
  );
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
  const { email, password } = req.body;
  const userExist = await User.findOne({ email: email });
  if (!userExist) {
    res.render("user/login", {
      data: "You are not a User Please Signup",
      passwordChanged: "",
    });
  } else {
    if (!userExist.active) {
      res.render("user/login", {
        data: "You are blocked by admin connect gloshoecom@gmail.com for furthur update",
        passwordChanged: "",
      });
      req.session.userLoggedIn = false;
    } else {
      const passwordMatch = await bcrypt.compare(password, userExist.password);
      if (!passwordMatch) {
        res.render("user/login", {
          data: "Wrong Password",
          passwordChanged: "",
        });
      } else {
        req.session.userLoggedIn = userExist._id;
        res.redirect("/");
      }
    }
  }
};

//---------- logout action ----------

exports.userLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

//---------- get forget password page ----------

exports.getForgotPass = (req, res) => {
  res.render("user/forgotPassword", { data: "" });
};

//---------- forgot password action  ----------

exports.sendOTP = async (req, res) => {
  try {
    OTPData.otp = Math.floor(100000 + Math.random() * 900000);
    OTPData.expirationTime = Date.now() + 60000;
    userMail = req.body.email;
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      console.log("User mail is", userMail);
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
          res.render("user/forgetPassOtp", { data: "" });
        }
      });
    } else {
      res.render("user/forgotPassword", {
        data: "You are not a User please Login.",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//---------- forget password otp action  ----------

exports.postForgetPassOtp = (req, res) => {
  try {
    const { otp } = req.body;
    if (
      OTPData.otp &&
      Date.now() < OTPData.expirationTime &&
      otp === OTPData.otp.toString()
    ) {
      res.render("user/resetPassword", { data: "" });
    } else {
      res.render("user/forgetPassOtp", { data: "Incorrect or Expired otp" });
    }
  } catch (error) {
    console.log(error);
  }
};

//---------- reset password action  ----------

exports.newPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedconfirmPassword = await bcrypt.hash(confirmPassword, 10);
    console.log("User mail is", userMail);
    const userExist = await User.findOneAndUpdate(
      { email: userMail },
      {
        $set: {
          password: hashedPassword,
          confirmPassword: hashedconfirmPassword,
        },
      },
      { new: true }
    );

    if (userExist) {
      res.render("user/login", {
        data: "",
        passwordChanged: "Successfully changed the password",
      });
    } else {
      res.render("user/resetPassword", {
        data: "Error occur while changing password please try again",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//----------resend otp----------

// Add a parameter to the resendOTP route
exports.resendOTP = async (req, res) => {
  try {
    const { type } = req.query; // Get the type parameter from the query string
    if (!type) {
      res.redirect("/login");
    } else {
      OTPData.otp = Math.floor(100000 + Math.random() * 900000);
      OTPData.expirationTime = Date.now() + 60000;

      const USERMAIL = type === "forgot" ? userMail : req.session.userMail;

      const mailOptions = {
        from: "gloshoecom@gmail.com",
        to: USERMAIL,
        subject: "otp Verification",
        text: `Your otp for registration is ${OTPData.otp}. Please use this for registration.`,
      };
      console.log("Resend mail sended");
      transporter.sendMail(mailOptions, (error, info) => {
        console.log("Entered to transporter");
        if (error) {
          console.log(
            "This is the error occur while forget resend =============================",
            error
          );
          if (type === "forgot") {
            res.render("user/forgotPassword", {
              data: "Error sending otp. Please try again.",
            });
            console.log("ERROR OCCURRED AND REDIRECT TO THE RED PAGE");
          } else {
            res.render("user/otp_verification", {
              data: "Error sending otp. Please try again.",
            });
          }
        } else {
          if (type === "forgot") {
            res.render("user/forgetPassOtp", { data: "" });
          } else {
            res.render("user/otpVerification", { data: "" });
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};



//----------Profile Management---------------------------------------------

let userMessage = false;
let userError = false;
let addressMessage = false;
let addressError = false;
let passMessage = false;
let passError = false;
let editAddressMessage = false;
let editAddressError = false;
let deleteAdressMessage = false;
let deleteAddressError = true;
function resetMessageVariables() {
  userMessage = false;
  userError = false;
  addressMessage = false;
  addressError = false;
  passMessage = false;
  passError = false;
  editAddressMessage = false;
  editAddressError = false;
  deleteAdressMessage = false;
  deleteAddressError = false;
}

exports.getProfile = async (req, res) => {
  try {
    let userId = req.session.userLoggedIn;
    const user = await User.findOne({ _id: userId });
    res.render("user/profile", {
      user: user,
      userMessage,
      userError,
      addressError,
      addressMessage,
      passMessage,
      passError,
      editAddressMessage,
      editAddressError,
      deleteAddressError,
      deleteAdressMessage,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.changeUserName = async (req, res) => {
  try {
    resetMessageVariables();
    const { userName } = req.body;

    const user = await User.findOne({ _id: req.session.userLoggedIn });

    if (userName !== user.userName) {
      await User.findOneAndUpdate(
        { _id: req.session.userLoggedIn },
        { $set: { userName: userName } },
        { new: true }
      );
      userError = false;
      userMessage = true;
      res.redirect("/profile");
    } else {
      userMessage = false;
      userError = true;
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.addAddress = async (req, res) => {
  try {
    resetMessageVariables();
    const { name, number, address, city, state, pincode, landmark } = req.body;

    const user = await User.findById(req.session.userLoggedIn);
    if (user.address.length >= 5) {
      addressMessage = false;
      addressError = true;
      res.redirect("/profile");
    } else {
      const newAddress = {
        name,
        number,
        address,
        city,
        state,
        pincode,
        landmark,
      };
      user.address.push(newAddress);

      await user.save();
      addressError = false;
      addressMessage = true;

      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    resetMessageVariables();
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.userLoggedIn);
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (passwordMatch && newPassword === confirmPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const hashedconfirmPassword = await bcrypt.hash(confirmPassword, 10);
      await User.findOneAndUpdate(
        { _id: req.session.userLoggedIn },
        {
          $set: {
            password: hashedPassword,
            confirmPassword: hashedconfirmPassword,
          },
        },
        { new: true }
      );
      passError = false;
      passMessage = true;
      res.redirect("/profile");
    } else {
      passMessage = false;
      passError = true;
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.editAddress = async (req, res) => {
  try {
    resetMessageVariables();
    const { userName, number, address, city, state, pincode, landmark } =
      req.body;
    const { addressId } = req.params;

    const user = await User.findById(req.session.userLoggedIn);

    // Find the index of the address in the user's address array
    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      console.log("Address index not found:", addressId);
      editAddressError = true;
      res.redirect("/profile");
    } else {
      user.address[addressIndex].name = userName;
      user.address[addressIndex].number = number;
      user.address[addressIndex].address = address;
      user.address[addressIndex].city = city;
      user.address[addressIndex].state = state;
      user.address[addressIndex].pincode = pincode;
      user.address[addressIndex].landmark = landmark;

      await user.save();
      editAddressMessage = true;

      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    resetMessageVariables();
    const { addressId } = req.params;
    console.log("Entered to delete addres");
    const user = await User.findById(req.session.userLoggedIn);
    const addressIndex = user.address.findIndex(
      (addr) => addr._id === addressId
    );
    if (!addressIndex) {
      deleteAdressMessage = false;
      deleteAddressError = true;
      res.redirect("/profile");
    } else {
      user.address.splice(addressIndex, 1);
      await user.save();
      deleteAdressMessage = true;
      deleteAddressError = false;
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.resetMessage = async (req, res) => {
  try {
    resetMessageVariables();
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};

exports.myOrder = async (req, res) => {
  try {
    res.render("user/myOrder");
  } catch (error) {
    console.log(error);
  }
};

// --------------------------------Cart Management ----------------------------------


exports.addToCart = async (req, res) => {
  try {
    console.log('Entered to post of cart');
    const { quantity, productId } = req.body;
    console.log(req.body);
    const userId = req.session.userLoggedIn
    const product = await Product.findById(productId);
    const existingCartItem = await Cart.findOne({ userId: userId, productId: productId });
 

    if (existingCartItem) {
      
      res.redirect('/cart')
  
    } else {
      const totalPrice = product.price * parseInt(quantity);
      const cartItem = new Cart({
        userId: req.session.userLoggedIn,
        productId: productId,
        quantity: parseInt(quantity),
        totalPrice: totalPrice,
      });
      await cartItem.save();
    }

    res.redirect('/cart');
  } catch (error) {
    console.log(error);
  }
};




exports.viewCart = async (req, res) => {
  try {
    console.log('Entered to get cart page');
    const userId = req.session.userLoggedIn;
    const cartItem = await Cart.find({ userId: userId }).populate("productId");
    if (!cartItem) {
      res.redirect('/login');
      return; 
    }

    let totalPrice = 0;
    cartItem.forEach((item) => {
      totalPrice += item.totalPrice; 
    });

    const { quantityLimitError, stockLimitError } = req.session;
    req.session.quantityLimitError = null;
    req.session.stockLimitError = null;
    const cartItemJSON = JSON.stringify(cartItem);

    res.render('user/cart', { cartItem, totalPrice, quantityLimitError, stockLimitError , cartItemJSON: cartItemJSON });

  } catch (error) {
    console.log(error);
  }
};



exports.removeCartProducts = async (req,res)=> {
  try {
    const {cartItemId} = req.query
    await Cart.findByIdAndDelete(cartItemId)
    res.redirect('/cart')
} catch (error) {
    console.log(error);
  }
}

exports.editCart = async (req, res) => {
  try {
    const { cartItemId } = req.query;
    const { quantity } = req.body;
    
    const cartItem = await Cart.findById(cartItemId).populate("productId");
    const product = cartItem.productId; 
    
    const newTotalPrice = product.price * parseInt(quantity);

    await Cart.findByIdAndUpdate(
      cartItemId,
      { $set: { quantity: parseInt(quantity), totalPrice: newTotalPrice } },
      { new: true }
    );
    
    res.redirect("/cart");
  } catch (error) {
    console.log(error);
  }
};


//----------Product Management---------------------------------------------

exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true });
    let userLoggedIn = req.session.userLoggedIn;
    res.render("user/allProducts", { products, userLoggedIn });
  } catch (error) {
    console.log(error);
  }
};

exports.productDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({ _id: id });
    const category = await Category.findById(product.category);
    let userLoggedIn = req.session.userLoggedIn;

    const existingCartItem = await Cart.findOne({ userId: userLoggedIn, productId: id });

    if (existingCartItem) {
      res.render("user/productDetails", { product, userLoggedIn, category ,isInCart:true});
    } else {
      res.render("user/productDetails", { product, userLoggedIn, category ,isInCart:false});
    }
      
  } catch (error) {
    console.log(error);
  }
};



//----------Order Management---------------------------------------------


exports.getCheckoutPage = async (req, res) => {
  try {

    if(req.session.userLoggedIn){
    let totalPrice = 0; 
    const userId = req.session.userLoggedIn
    const user = await User.findOne({_id:userId})
    const cartItems = await Cart.find({ userId: userId }).populate("productId");
    cartItems.forEach(item => {
        totalPrice += item.productId.price * item.quantity;
    });

    res.render("user/checkout",{user:user, cartItems:cartItems , totalPrice});  
    }else{
      res.redirect('/login')
    }
                                                                                                                                                                                                                                            
  } catch (error) {
    console.log(error);
  }
};



exports.confirmOrder = async function confirmOrder(req, res) {
  const { selectedaddressIndex, selectedpayment, cartdocs, totalPrice } = req.body;

  try {
      // Get the user's address based on the selected index
      const userdata = await User.findById(req.session.user);
      const selectedAddress = userdata.address[selectedaddressIndex];

      // Process each cart item and create ordered items array
      const orderedItems = [];
      for (const cartItem of cartdocs) {
          const { productId, quantity } = cartItem;

          // Create ordered item object
          const orderedItem = {
              product: productId,
              price: cartItem.price, // Assuming price is already calculated
              deliveryTime: 3, // Example delivery time, you may adjust as needed
          };

          // Push ordered item to the orderedItems array
          orderedItems.push(orderedItem);
      }

      // Create an order document
      const order = new Order({
          userId: req.session.user,
          items: orderedItems,
          start_date: Date.now(),
          totalAmount: totalPrice,
          address: selectedAddress,
          paymentType: selectedpayment,
      });

      // Save the order document
      await order.save();

      // Send success response
      res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (error) {
      // Handle errors
      console.error('Error confirming order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

