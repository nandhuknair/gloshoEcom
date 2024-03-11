const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const moment = require("moment");
const Wishlist = require("../model/wishlistModel");
const Offer = require("../model/offerModel");
const Coupon = require("../model/couponModel");
const Razorpay = require("razorpay");
const fs = require("fs");
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//----------get home paage----------

exports.getHome = async function (req, res) {
  const products = await Product.find({}).limit(8);

  res.render("user/index", {
    userLoggedIn: req.session.userLoggedIn,
    products,
  });
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
    return res.redirect("/error");
  }
};

exports.getWallet = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const user = await User.findById(userId);
    res.render("user/wallet", { userLoggedIn: userId, user });
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
    return res.redirect("/error");
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
    return res.redirect("/error");
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
    return res.redirect("/error");
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
    return res.redirect("/error");
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
    return res.redirect("/error");
  }
};

// --------------------------------Cart Management ----------------------------------

exports.addToCart = async (req, res) => {
  try {
    req.session.stockLimitError = null;
    console.log("Entered to post of cart");
    const { quantity, productId } = req.body;
    console.log(req.body);
    const userId = req.session.userLoggedIn;
    const product = await Product.findById(productId);
    const existingCartItem = await Cart.findOne({
      userId: userId,
      productId: productId,
    });
    if (existingCartItem) {
      res.status(400).json({ message: "Already In Cart" });
    } else {
      if (parseInt(quantity) > product.stock) {
        req.session.stockLimitError =
          "Requested quantity exceeds available stock";
        res.redirect("/cart");
        return;
      }

      const totalPrice = product.price * parseInt(quantity);
      const cartItem = new Cart({
        userId: req.session.userLoggedIn,
        productId: productId,
        quantity: parseInt(quantity),
        totalPrice: totalPrice,
      });
      await cartItem.save();
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.viewCart = async (req, res) => {
  try {
    console.log("Entered to get cart page");
    const userId = req.session.userLoggedIn;
    let cartItem = await Cart.find({ userId: userId }).populate("productId");

    cartItem = await Promise.all(
      cartItem.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product || product.stock <= 0 || item.quantity > product.stock) {
          await Cart.findByIdAndDelete(item._id);
          return null;
        }
        return item;
      })
    );

    cartItem = cartItem.filter((item) => item !== null);

    let totalPrice = 0;
    cartItem.forEach((item) => {
      totalPrice += item.totalPrice;
    });

    const { stockLimitError } = req.session;

    const cartItemJSON = JSON.stringify(cartItem);

    res.render("user/cart", {
      cartItem,
      totalPrice,
      stockLimitError,
      cartItemJSON: cartItemJSON,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.cartCount = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const cartItemCount = await Cart.countDocuments({ userId: userId });
    res.json({ cartItemCount });
  } catch (error) {
    console.error("Error fetching cart item count:", error);
    return res.redirect("/error");
  }
};

exports.removeCartProducts = async (req, res) => {
  try {
    const { cartItemId } = req.query;
    await Cart.findByIdAndDelete(cartItemId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.editCart = async (req, res) => {
  try {
    req.session.stockLimitError = null;
    const { cartItemId } = req.query;
    const { quantity } = req.body;

    const cartItem = await Cart.findById(cartItemId).populate("productId");
    const product = cartItem.productId;
    if (parseInt(quantity) > product.stock) {
      req.session.stockLimitError =
        "Requested quantity exceeds available stock";
      res.redirect("/cart");
      return;
    }
    const newTotalPrice = product.price * parseInt(quantity);

    await Cart.findByIdAndUpdate(
      cartItemId,
      { $set: { quantity: parseInt(quantity), totalPrice: newTotalPrice } },
      { new: true }
    );

    res.redirect("/cart");
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

//----------Product Management---------------------------------------------

exports.listProducts = async (req, res) => {
  try {
    let products;
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case "priceLowToHigh":
          products = await Product.find({ isAvailable: true }).sort({
            price: 1,
          });
          break;

        case "priceHighToLow":
          products = await Product.find({ isAvailable: true }).sort({
            price: -1,
          });
          break;

        case "A-Z":
          products = await Product.find({ isAvailable: true }).sort({
            productName: 1,
          });
          break;

        case "Z-A":
          products = await Product.find({ isAvailable: true }).sort({
            productName: -1,
          });
          break;

        default:
          products = await Product.find({ isAvailable: true });
          break;
      }
    } else {
      products = await Product.find({ isAvailable: true });
    }

    const categories = await Category.find({ active: true });
    let userLoggedIn = req.session.userLoggedIn;
    res.render("user/allProducts", { products, userLoggedIn, categories });
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.productDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({ _id: id });
    if (!product) {
      return res.redirect("/error");
    }

    const category = await Category.findById(product.category);
    let userLoggedIn = req.session.userLoggedIn;

    const existingCartItem = await Cart.findOne({
      userId: userLoggedIn,
      productId: id,
    });

    const productOffer = await Offer.findOne({ product: id });
    const categoryOffer = await Offer.findOne({ category: product.category });
    if (existingCartItem) {
      res.render("user/productDetails", {
        product,
        userLoggedIn,
        category,
        isInCart: true,
        productOffer,
        categoryOffer,
      });
    } else {
      res.render("user/productDetails", {
        product,
        userLoggedIn,
        category,
        isInCart: false,
        productOffer,
        categoryOffer,
      });
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

//----------Order Management---------------------------------------------

exports.getCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const cartItems = await Cart.find({ userId: userId }).populate("productId");
    const { type } = req.body;
    const singleProduct = await Product.findById(req.body.productId);
    if (req.session.userLoggedIn && cartItems.length > 0) {
      let totalPrice = 0;
      const user = await User.findOne({ _id: userId });
      cartItems.forEach((item) => {
        totalPrice += item.productId.price * item.quantity;
        const product = item.productId;
        if (product.stock <= 0 || item.quantity > product.stock) {
          res.redirect("/cart");
        }
      });
      const coupons = await Coupon.find({ isActive: true });
      const formattedCoupons = coupons.map((coupon) => ({
        ...coupon.toObject(),
        validity: coupon.validity.toLocaleString(),
      }));
      res.render("user/checkout", {
        user: user,
        cartItems: cartItems,
        totalPrice,
        type: type,
        product: singleProduct,
        coupons: formattedCoupons,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.confirmOrder = async (req, res) => {
  const { selectedaddress, selectedpayment, cartdocs, totalPrice } = req.body;

  try {
    const userData = await User.findById(req.session.userLoggedIn);
    const address = userData.address[selectedaddress];
    const orderedItems = [];

    async function placeOrder() {
      for (const cartItem of cartdocs) {
        const { productId, quantity } = cartItem;
        const product = await Product.findById(productId);

        if (!product || cartItem.quantity > product.stock) {
          throw new Error(
            `Product stock limit exceeded for item ${cartItem.productId}`
          );
        }
        let currentPrice = product.price * quantity;
        if (product.productOfferPrice > 0 && product.categoryOfferPrice > 0) {
          orderedItems.push({
            product: product._id,
            quantity: quantity,
            price: currentPrice,
            productOfferPrice: product.productOfferPrice,
            productOfferName: product.productOfferName,
            categoryOfferPrice: product.categoryOfferPrice,
            categoryOfferName: product.categoryOfferName,
          });
        } else if (product.productOfferPrice > 0) {
          orderedItems.push({
            product: product._id,
            quantity: quantity,
            price: currentPrice,
            productOfferPrice: product.productOfferPrice,
            productOfferName: product.productOfferName,
          });
        } else if (product.categoryOfferPrice > 0) {
          orderedItems.push({
            product: product._id,
            quantity: quantity,
            price: currentPrice,
            categoryOfferPrice: product.categoryOfferPrice,
            categoryOfferName: product.categoryOfferName,
          });
        }

        product.stock -= quantity;
        await product.save();
        await Cart.findByIdAndDelete(cartItem._id);
      }

      const order = new Order({
        userId: req.session.userLoggedIn,
        items: orderedItems,
        totalAmount: totalPrice,
        address: address,
        paymentType: selectedpayment,
        couponApplied: req.session.couponApplied,
      });
      req.session.appliedCoupons = [];
      await order.save();
    }

    if (selectedpayment === "COD") {
      await placeOrder();
      res.status(200).json({ message: "Order confirmed successfully" });
    } else if (selectedpayment === "RAZORPAY") {
      const orderOptions = {
        amount: totalPrice * 100, // Razorpay amount is in paisa (multiply by 100)
        currency: "INR",
        receipt: "order_receipt",
        payment_capture: 1, // Automatically capture the payment
      };
      const razorpayOrder = await razorpay.orders.create(orderOptions);
      console.log("Starting to create an order");
      if (!razorpayOrder) {
        res.status(400).json({
          message:
            "Something went wrong while placing order on Razorpay try again",
        });
      } else {
        // Return the Razorpay order details as a response
        res.status(200).json({
          razorpayOrderId: razorpayOrder.id,
          razorpayKey: process.env.KEY_ID,
        });
      }
    } else if (selectedpayment === "WALLET") {
      if (userData.walletAmount >= totalPrice) {
        await placeOrder();
        const refundAmount = {
          amount: totalPrice,
          type: "debit",
          createdAt: new Date(),
        };
        userData.wallet.push(refundAmount);
        userData.walletAmount -= totalPrice;
        userData.save();
        res.status(200).json({ message: "Order placed successfully!" });
      } else {
        res
          .status(400)
          .json({
            message:
              "Insufficient funds in wallet. Please add funds or try another Payment option",
          });
      }
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.redirect("/error");
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { selectedaddress, selectedpayment, cartdocs, totalPrice } = req.body;
    const userData = await User.findById(req.session.userLoggedIn);
    const address = userData.address[selectedaddress];
    const orderedItems = [];
    for (const cartItem of cartdocs) {
      const { productId, quantity } = cartItem;
      const product = await Product.findById(productId);

      if (!product || cartItem.quantity > product.stock) {
        throw new Error(
          `Product stock limit exceeded for item ${cartItem.productId}`
        );
      }

      let currentPrice = product.price * quantity;
      console.log(currentPrice);

      orderedItems.push({
        product: product._id,
        quantity: quantity,
        price: currentPrice,
      });
      product.stock -= quantity;
      await product.save();
      await Cart.findByIdAndDelete(cartItem._id);
    }

    const order = new Order({
      userId: req.session.userLoggedIn,
      items: orderedItems,
      totalAmount: totalPrice,
      address: address,
      paymentType: selectedpayment,
      couponApplied: req.session.couponApplied,
    });
    req.session.appliedCoupons = [];
    await order.save();
    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
  }
};

exports.myOrder = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 10;
    const page = parseInt(req.query.page) || 1;

    const totalOrders = await Order.countDocuments({
      userId: req.session.userLoggedIn,
    });

    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const orders = await Order.find({ userId: req.session.userLoggedIn })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    const formattedOrders = orders.map((order) => {
      const orderPlacedDate = moment(order.createdAt).format("ddd MMM DD YYYY");
      const estimateDeliveryDate = moment(order.createdAt)
        .add(7, "days")
        .format("ddd MMM DD YYYY");

      return {
        ...order.toObject(),
        orderPlacedDate,
        estimateDeliveryDate,
      };
    });

    res.render("user/myOrder", {
      orderDetails: formattedOrders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.myOrderItemDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    const orderDetails = await Order.findById(orderId).populate(
      "couponApplied"
    );
    const item = orderDetails.items.find(
      (item) => item.product.toString() === productId
    );
    const product = await Product.findById(productId);
    const formattedDate = moment(orderDetails.createdAt).format(
      "ddd MMM DD YYYY, hh:mm A"
    );

    res.render("user/myOrderItemDetails", {
      orderDetails: orderDetails,
      item: item,
      product: product,
      formattedDate: formattedDate,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/error");
  }
};

exports.myOrderItems = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.render("user/myOrderDetail", { orderDetails: [order] });
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/error");
  }
};

// Define a function to generate HTML content for the invoice
function generateInvoiceHTML(
  order,
  customerName,
  customerPhone,
  customerEmail,
  subtotal
) {
  // Get order details
  const orderId = order._id;
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const paymentType = order.paymentType;
  const addressObj = order.address;
  const address = ` ${addressObj.address} ${addressObj.state} ${addressObj.pincode} ${addressObj.landmark}`;
  // Initialize HTML content for products
  let productHTML = "";

  // Loop through each item in the order
  order.items.forEach((item, index) => {
    // Get product details
    const productName = item.product.productName;
    const productPrice = item.product.price;
    const quantity = item.quantity;
    const subtotal = productPrice * quantity;

    // Add product details to HTML content
    productHTML += `
          <tr>
              <td>${index + 1}</td>
              <td>${productName}</td>
              <td>${quantity}</td>
              <td>$${productPrice.toFixed(2)}</td>
              <td>$${subtotal.toFixed(2)}</td>
          </tr>
      `;
  });

  // Generate HTML content for the invoice
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice | Glosho</title>
      <link rel="icon" href="/images/icon/title logo.png" type="image/icon type">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
        crossorigin="anonymous"/>
  
    </head>
    <style>
      body {
        background: #eee;
        margin-top: 20px;
      }
      .text-danger strong {
        color: #9f181c;
      }
      .receipt-main {
        background: #ffffff none repeat scroll 0 0;
        border-bottom: 12px solid #333333;
        border-top: 12px solid #9f181c;
        margin-top: 50px;
        margin-bottom: 50px;
        padding: 40px 30px !important;
        position: relative;
        box-shadow: 0 1px 21px #acacac;
        color: #333333;
        font-family: open sans;
      }
      .receipt-main p {
        color: #333333;
        font-family: open sans;
        line-height: 1.42857;
      }
      .receipt-footer h1 {
        font-size: 15px;
        font-weight: 400 !important;
        margin: 0 !important;
      }
      .receipt-main::after {
        background: #414143 none repeat scroll 0 0;
        content: "";
        height: 5px;
        left: 0;
        position: absolute;
        right: 0;
        top: -13px;
      }
      .receipt-main thead {
        background: #414143 none repeat scroll 0 0;
      }
      .receipt-main thead th {
        color: #fff;
      }
      .receipt-right h5 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 7px 0;
      }
      .receipt-right p {
        font-size: 12px;
        margin: 0px;
      }
      .receipt-right p i {
        text-align: center;
        width: 18px;
      }
      .receipt-main td {
        padding: 9px 20px !important;
      }
      .receipt-main th {
        padding: 13px 20px !important;
      }
      .receipt-main td {
        font-size: 13px;
        font-weight: initial !important;
      }
      .receipt-main td p:last-child {
        margin: 0;
        padding: 0;
      }
      .receipt-main td h2 {
        font-size: 20px;
        font-weight: 900;
        margin: 0;
        text-transform: uppercase;
      }
      .receipt-header-mid .receipt-left h1 {
        font-weight: 100;
        margin: 34px 0 0;
        text-align: right;
        text-transform: uppercase;
      }
      .receipt-header-mid {
        margin: 24px 0;
        overflow: hidden;
      }
  
      #container {
        background-color: #dcdcdc;
      }
    </style>
    <body>
      <div class="col-md-12">
        <div class="row">
          <div
            class="receipt-main col-xs-10 col-sm-10 col-md-6 col-xs-offset-1 col-sm-offset-1 col-md-offset-3"
          >
            <div class="row">
              <div class="receipt-header">
                <div class="col-xs-6 col-sm-6 col-md-6">
                  <div class="receipt-left">
                      <h6>ORDER ID #${orderId}</h6>
                  </div>
                </div>
                <div class="col-xs-6 col-sm-6 col-md-6 text-right">
                  <div class="receipt-right">
                    <h5 style="font-weight: 1000">
                      <Span style="color: rgb(46, 202, 88)">Glosho</Span>
                    </h5>
                    <p>+91 1234567890<i class="fa fa-phone"></i></p>
                    <p>gloshohandler@gmail.com<i class="fa fa-envelope-o"></i></p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="row">
              <div class="receipt-header receipt-header-mid">
                <div class="col-xs-8 col-sm-8 col-md-8 text-left">
                  <div class="receipt-right">
                      <h5> ${customerName}</h5>
                      <p><b>Mobile :</b> ${customerPhone}</p>
                      <p><b>Email :</b> ${customerEmail}</p>
                      
                    <p>
                      <b>Order Date :</b>${orderDate}
                    </p>
                    <p><b>Payment Method :</b>${paymentType}</p>
                    <p><b>Address :</b>${address}</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div>
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  
                  ${productHTML}
                  
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="text-right col-md-9">
                      <h4>Coupon discount:</h4>
                      <h2><strong>Sub Total: </strong></h2>
                    </td>
                    <td class="text-left text-danger">
                      <h4>$ 0</h4>
                      <h2><strong>${subtotal.toFixed(2)}</strong></h2>
                      
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div class="row">
              <div class="receipt-header receipt-header-mid receipt-footer">
                <div class="col-xs-8 col-sm-8 col-md-8 text-left">
                  <div class="receipt-right">
                    <p>
                      <b>Date :</b>${orderDate}
                    </p>
                    <h5 style="color: rgb(140, 140, 140)">
                      Thanks for shopping.!
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <script>
        window.onload = function () {
            print();
        };
  
        document.getElementById('downloadButton').addEventListener('click', function () {
           
            const pdf = new jsPDF();
            
            pdf.save('order_invoice.pdf');
        });
    </script>
  
    </body>
  
  </html>

  `;
  return html;
}

exports.downloadInvoice = async (req, res) => {
  try {
    let orderId = req.params.orderId;
    // Remove any additional characters like ":" from orderId
    orderId = orderId.replace(":", "");

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("userId");

    // Replace placeholders with actual customer details
    const customerName = order.userId.userName;
    const customerPhone = order.userId.number;
    const customerEmail = order.userId.email;
    const subtotal = order.totalAmount;

    // Generate the HTML content for the invoice
    const invoiceHTML = generateInvoiceHTML(
      order,
      customerName,
      customerPhone,
      customerEmail,
      subtotal
    );

    // Set headers to make the browser download the file
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice_${orderId}.html"`
    );
    res.send(invoiceHTML);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const user = await User.findById(req.session.userLoggedIn);
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("No Order Found");
    }
    const item = order.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).send("Item not found in the order");
    }

    if (order.paymentType === "COD") {
      await cancelProductOrder(order, item);
    } else if (
      order.paymentType === "RAZORPAY" ||
      order.paymentType === "WALLET"
    ) {
      await cancelProductOrder(order, item);
      await addToWallet(user, item);
    }
    res.redirect("/my_order");
  } catch (error) {
    console.error("Error Cancellign order:", error);
    return res.status(500).redirect("/error");
  }
};

async function cancelProductOrder(order, item) {
  item.orderStatus = "Cancelled By User";
  await order.save();

  const product = await Product.findById(item.product);
  if (!product) {
    throw new Error("Product not found");
  }
  product.stock += item.quantity;
  await product.save();
}

async function addToWallet(user, item) {
  const refundAmount = item.price * item.quantity;
  console.log(refundAmount);
  const refundEntry = {
    amount: refundAmount,
    type: "credit",
    createdAt: new Date(),
  };
  user.wallet.push(refundEntry);
  user.walletAmount += refundAmount;
  await user.save();
}

exports.returnItem = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const item = order.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).send("Item not found in the order");
    }

    item.orderStatus = "Returned";
    await order.save();

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    product.stock += item.quantity;
    await product.save();

    res.redirect("/my_order");
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/error");
  }
};

exports.getWalletHistory = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const user = await User.findById(userId);
    res.render("user/walletHistory", { user });
  } catch (error) {
    console.error("Error fetching wallet history:", error);
    return res.status(500).redirect("/error");
  }
};

exports.addAddressFromCheckout = async (req, res) => {
  try {
    const { name, number, address, city, state, pincode, landmark } = req.body;

    const user = await User.findById(req.session.userLoggedIn);
    if (user.address.length >= 5) {
      res.redirect("/checkout");
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

      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).redirect("/error");
  }
};

// ----------------------------------------Sort management------------------------------------------------

exports.searchAction = async (req, res) => {
  const userLoggedIn = req.session.userLoggedIn;
  const searchItem = req.query.searchItem;
  if (!searchItem) {
    return res.status(500).redirect("/error");
  }

  try {
    const trimmedSearchItem = searchItem.trim();
    if (!trimmedSearchItem) {
      return res.status(500).redirect("/error");
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(trimmedSearchItem, "i") } }, // Search in product name
        { "category.category": { $regex: new RegExp(trimmedSearchItem, "i") } }, // Search in category
      ],
    });

    const categories = await Category.find({ active: true });
    res.render("user/allProducts", {
      products,
      userLoggedIn: userLoggedIn,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/error");
  }
};

exports.womenCollection = async (req, res) => {
  try {
    const userLoggedIn = req.session.userLoggedIn;
    const collectionName = "Women";
    const products = await Product.find({ collection: collectionName });
    res.render("user/womenProducts", { products, userLoggedIn: userLoggedIn });
  } catch (error) {
    return res.status(500).redirect("/error");
  }
};

exports.menCollection = async (req, res) => {
  try {
    const userLoggedIn = req.session.userLoggedIn;
    const collectionName = "Men";
    const products = await Product.find({ collection: collectionName });

    res.render("user/menProducts", { products, userLoggedIn: userLoggedIn });
  } catch (error) {
    return res.status(500).redirect("/error");
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const userLoggedIn = req.session.userLoggedIn;
    const { categoryId } = req.query;
    console.log(categoryId);

    let products;
    if (categoryId) {
      products = await Product.find({
        category: categoryId,
        isAvailable: true,
      });
      console.log(products);
    } else {
      products = await Product.find({ isAvailable: true });
    }

    const categories = await Category.find({ active: true });
    res.render("user/allProducts", {
      products,
      userLoggedIn: userLoggedIn,
      categories,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).redirect("/error");
  }
};

// ----------------------------------------Whish list Management------------------------------------------------

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const wishlistItem = await Wishlist.find({ userId: userId }).populate(
      "productId"
    );
    res.render("user/wishlist", { wishlistItem });
  } catch (error) {
    console.log(error);
    return res.status(500).redirect("/error");
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existingItem = await Wishlist.findOne({
      userId: req.session.userLoggedIn,
      productId,
    });
    if (existingItem) {
      res.status(400).json({ message: "Item already added to the wishlist" });
    } else {
      const wishlistItem = new Wishlist({
        userId: req.session.userLoggedIn,
        productId: productId,
      });

      await wishlistItem.save();
      res.redirect("/wishlist");
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).redirect("/error");
  }
};

exports.removeWishItem = async (req, res) => {
  try {
    const wishItemId = req.query.wishItemId;
    await Wishlist.findByIdAndDelete(wishItemId);
    res.redirect("/wishlist");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).redirect("/error");
  }
};

exports.wishlistCount = async (req, res) => {
  try {
    const userId = req.session.userLoggedIn;
    const wishItemCount = await Wishlist.countDocuments({ userId: userId });
    res.json({ wishItemCount });
  } catch (error) {
    console.error("Error fetching wishlist item count:", error);
    return res.redirect("/error");
  }
};

exports.checkCoupon = async (req, res) => {
  try {
    const { couponCode, date, totalPrice } = req.body;
    const couponExist = await Coupon.findOne({ couponCode: couponCode });

    if (!couponExist) {
      console.log(date, "User enter date");
      return res.status(400).json({ message: "Invalid coupon code" });
    } else {
      // Check if coupon has already been applied
      const appliedCoupons = req.session.appliedCoupons || [];
      if (appliedCoupons.includes(couponCode)) {
        return res.status(400).json({ message: "Coupon already applied" });
      }

      if (new Date(date) > new Date(couponExist.validity)) {
        return res.status(400).json({ message: "Coupon Expired" });
      }
      if (totalPrice < couponExist.limit) {
        return res
          .status(400)
          .json({ message: `Purchase more than ${couponExist.limit}` });
      }
      req.session.appliedCoupons = [...appliedCoupons, couponCode];
      const discountedPrice = totalPrice - couponExist.discount;
      res.status(200).json({
        message: "Coupon Applied",
        discountedPrice: discountedPrice,
      });
    }
  } catch (error) {
    console.error("Error while checking the coupon", error);
    return res.redirect("/error");
  }
};
