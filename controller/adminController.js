const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const Order = require("../model/orderModel");
const Banner = require("../model/bannerModel");
const PDFDocument = require("pdfkit");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, ".././public/assets/uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

//to upload multiple
exports.upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Custom file filter logic (if needed)
    cb(null, true);
  },
  onError: function (err, next) {
    console.error("Multer error:", err);
    next(err);
  },
}).array("images", 12);

//to upload single
exports.uploadSingle = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Custom file filter logic (if needed)
    cb(null, true);
  },
  onError: function (err, next) {
    console.error("Multer error:", err);
    next(err);
  },
}).single("images");

//--------------------get login page of the admin------------------------

exports.getLogin = (req, res) => {
  res.render("admin/adminLogin", { data: "" });
};

//--------------------get admin panel------------------------

exports.adminPanel = (req, res) => {
  if (req.session.admin) res.render("admin/adminPanel", { data: "" });
  else res.redirect("/admin_login");
};

//--------------------admin login action------------------------

exports.loginAction = async (req, res) => {
  try {
    const { email, password } = req.body;
    let adminExist = await User.findOne({ email: email });
    const passwordMatch = await bcrypt.compare(password, adminExist.password);
    if (adminExist && adminExist.is_admin === 1) {
      if (!passwordMatch) {
        res.render("admin/adminLogin", { data: "Wrong Password" });
      } else {
        req.session.admin = true;
        res.redirect("/admin_panel");
      }
    } else {
      res.render("admin/adminLogin", { data: "You are not an Admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

//--------------------get forgot Password------------------------

exports.forgotPassword = (req, res) => {
  res.render("admin/adminForgotPass", { data: "" });
};

//--------------------Forgot password action------------------------

let OTPData = {
  otp: null,
  expirationTime: null,
};
let userMail;

exports.sendOTP = async (req, res) => {
  try {
    const adminExist = await User.findOne({ email: req.body.email });
    if (adminExist && adminExist.is_admin === 1) {
      userMail = adminExist.email;
      console.log("User mail is", userMail);
      OTPData.otp = Math.floor(100000 + Math.random() * 900000);
      OTPData.expirationTime = Date.now() + 60000;
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
          res.render("admin/adminForgotPass", {
            data: "Error sending otp. Please try again.",
          });
        } else {
          res.render("admin/adminOtpVerification", { data: "" });
        }
      });
    } else {
      res.render("admin/adminForgotPass", {
        data: "You are not an admin",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//--------------------get reset page------------------------

exports.resetPage = (req, res) => {
  try {
    const { otp } = req.body;

    // Check if OTP is correct and not expired
    if (
      OTPData.otp &&
      Date.now() < OTPData.expirationTime &&
      otp === OTPData.otp.toString()
    ) {
      res.render("admin/adminPassReset", { data: "" });
    } else {
      res.render("admin/adminOtpVerification", {
        data: "Incorrect or Expired otp",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("admin/adminForgotPass", {
      data: "Error sending OTP. Please try again.",
    });
  }
};

//--------------------Resend otp------------------------

exports.resendOtp = (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      res.redirect("/admin_login");
    } else {
      if (!userMail) {
        // If userMail is not set, handle the scenario (e.g., redirect to a proper page)
        res.redirect("/admin_login");
        return;
      }
      OTPData.otp = Math.floor(100000 + Math.random() * 900000);
      OTPData.expirationTime = Date.now() + 60000;
      const mailOptions = {
        from: "gloshoecom@gmail.com",
        to: userMail,
        subject: "otp Verification",
        text: `Your otp for registration is ${OTPData.otp}. To reset your password type this .`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.render("admin/adminOtpVerification", {
            data: "Error sending otp. Please try again.",
          });
        } else {
          res.render("admin/adminOtpVerification", { data: "" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.render("admin/adminOtpVerification", {
      data: "Error resending OTP. Please try again.",
    });
  }
};

//--------------------get reset page------------------------

exports.resetPassword = async (req, res) => {
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
      res.render("admin/adminLogin", {
        data: "",
        passwordChanged: "Successfully changed the password",
      });
    } else {
      res.render("admin/adminPassReset", {
        data: "Error occur while changing password please try again",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//--------------------adminLogout------------------------

exports.adminLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/admin_login");
};

//--------------------get admin usermanagement------------------------

exports.userManagemnt = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: { $ne: 1 } });
    res.render("admin/userManagement", { userData });
  } catch (error) {
    console.log(error);
  }
};

//--------------------block user------------------------

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.query;
    await User.findOneAndUpdate(
      { _id: id },
      { $set: { active: false } },
      { new: true }
    );
    res.redirect("/admin_usermanagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//--------------------unblock user------------------------

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.query;
    await User.findOneAndUpdate(
      { _id: id },
      { $set: { active: true } },
      { new: true }
    );
    res.redirect("/admin_usermanagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//--------------------get category ------------------------

exports.getCategory = async (req, res) => {
  const data = await Category.find({});
  res.render("admin/categoryManagement", { message: "", data });
};

//--------------------edit and add category------------------------

exports.editCategory = async (req, res) => {
  try {
    const { oldCategory } = req.query;
    const { category } = req.body;
    const categoryExist = await Category.findOne({ category: category });
    if (categoryExist) {
      return res.redirect("/admin_category");
    } else {
      await Category.findOneAndUpdate(
        { category: oldCategory },
        { $set: { category: category } },
        { new: true }
      );

      res.redirect("/admin_category");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const categoryExist = await Category.findOne({ category: category });
    if (categoryExist) {
      res.redirect("/admin_category");
    } else {
      const newCategory = new Category({
        category: category,
      });
      await newCategory.save();
      res.redirect("/admin_category");
    }
  } catch (error) {
    console.log(error);
  }
};

//--------------------list and unlist category------------------------

exports.listCategory = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.findByIdAndUpdate({ _id: id }, { $set: { active: true } });
    res.redirect("/admin_category");
  } catch (error) {
    console.log(error);
  }
};

exports.unlistCategory = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.findByIdAndUpdate({ _id: id }, { $set: { active: false } });
    res.redirect("/admin_category");
  } catch (error) {
    console.log(error);
  }
};

//--------------------product management------------------------

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page parameter is provided
    const perPage = 10; // Number of products per page
    const skip = (page - 1) * perPage; // Calculate the number of products to skip

    const productCount = await Product.countDocuments();
    const totalPages = Math.ceil(productCount / perPage);

    const product = await Product.find({})
      .populate("category")
      .skip(skip)
      .limit(perPage);

    const categories = await Category.find({ active: true });

    res.render("admin/productManagement", {
      product,
      errMessage: "",
      categories,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addProducts = async function (req, res, next) {
  try {
    console.log("Entered to the add product page");
    const arrImages = req.files.map((value) => value.filename);
    console.log(arrImages); // Ensure you see all filenames here

    if (req.body.price <= 0) {
      return res.redirect("/admin_products");
    }
    const enteredPrice = req.body.price;
    const price = parseFloat(enteredPrice).toFixed(2);
    const newProduct = new Product({
      productName: req.body.productName,
      image: arrImages, // Use arrImages directly here
      price: price,
      size: req.body.size,
      category: req.body.category,
      collection: req.body.collection,
      description: req.body.description,
      stock: req.body.stock,
    });

    await newProduct.save();
    res.redirect("/admin_products");
  } catch (error) {
    console.log(error);
  }
};

exports.editProducts = async function (req, res, next) {
  try {
    const { id } = req.query;

    if (req.body.price <= 0) {
      return res.redirect("/admin_products");
    }

    const updateFields = {};

    if (req.body.productName) {
      updateFields.productName = req.body.productName;
    }

    if (req.files && req.files.length > 0) {
      const arrImages = req.files.map((value) => value.filename);
      updateFields.image = arrImages;
    }

    if (req.body.price) {
      updateFields.price = req.body.price;
    }

    if (req.body.size) {
      updateFields.size = req.body.size;
    }

    if (req.body.category) {
      updateFields.category = req.body.category;
    }

    if (req.body.collection) {
      updateFields.collection = req.body.collection;
    }

    if (req.body.description) {
      updateFields.description = req.body.description;
    }

    if (req.body.stock) {
      updateFields.stock = req.body.stock;
    }

    await Product.findOneAndUpdate({ _id: id }, { $set: updateFields });

    res.redirect("/admin_products");
  } catch (error) {
    console.log(error);
  }
};

exports.listProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { isAvailable: true } }
    );
    res.redirect("/admin_products");
  } catch (error) {
    console.log(error);
  }
};
exports.unListProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { isAvailable: false } }
    );
    res.redirect("/admin_products");
  } catch (error) {
    console.log(error);
  }
};

// --------------------------------------------------Order Management--------------------------------------------------------------

exports.orderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page parameter is provided
    const perPage = 10; // Number of products per page
    const skip = (page - 1) * perPage; // Calculate the number of products to skip

    const orderCount = await Order.countDocuments();
    const totalPages = Math.ceil(orderCount / perPage);

    const orders = await Order.find({})
      .populate("userId")
      .populate({
        path: "items.product",
        populate: { path: "category", model: "Category" },
      })
      .skip(skip)
      .limit(perPage);

    res.render("admin/adminOrderManagement", {
      orderDetails: orders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, productId, orderStatus } = req.body;

    console.log("orderId:", orderId);
    console.log("productId:", productId);

    const order = await Order.findById(orderId);
    const user = await User.findById(order.userId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const item = order.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).send("Item not found in the order");
    }

    if (orderStatus === "CancelledByAdmin") {
      if (order.paymentType === "RAZORPAY") {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).send("Product not found");
        }
        product.stock += item.quantity;
        await product.save();
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
        item.orderStatus = orderStatus;
        await order.save();
      }
    } else {
      item.orderStatus = orderStatus;
      await order.save();
    }

    res.redirect("/admin_orders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("items.product")
      .populate("userId");
    if (!orders) {
      throw new Error("Orders not found in database");
    }

    let totalAmount = 0;

    const formattedOrders = orders.map((order) => {
      const formattedOrder = {
        ...order.toObject(),
        createdAt: order.createdAt.toLocaleString(),
        orderTotal: order.totalAmount,
      };

      // Calculate total amount for the order
      totalAmount += order.totalAmount;
      req.session.totalAmount = totalAmount
      return formattedOrder;
    });

    res.render("admin/salesReport", { order: formattedOrders, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.downloadSalesReport = async (req, res) => {
  try {
    // Fetch sales report data
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("items.product")
      .populate("userId");

    if (!orders || orders.length === 0) {
      throw new Error("Orders not found in database");
    }

    // Set response headers for downloading the HTML file
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.html');
    let totalAmount = req.session.totalAmount
    // Generate the HTML content for the sales report
    const html = generateSalesReportHTML(orders,totalAmount);

    // Send the HTML content in the response
    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Function to generate HTML content for the sales report
function generateSalesReportHTML(orders,totalAmount) {
  let totalPrice = totalAmount
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sales Report</title>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>Sales Report</h1>
      <table>
        <thead>
          <tr>
            <th>Order Date</th>
            <th>Username</th>
            <th>Product Name</th>
            <th>Product Price</th>
            <th>Product Offer</th>
            <th>Category Offer</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>`;

  // Initialize total price
  

  // Populate table rows
  orders.forEach(order => {
    order.items.forEach(item => {
      html += `
        <tr>
          <td>${order.createdAt.toLocaleString()}</td>
          <td>${order.userId.userName}</td>
          <td>${item.product.productName}</td>
          <td>$${item.product.price}</td>
          <td>${item.productOfferPrice > 0 ? item.productOfferName : 'No offer'}</td>
          <td>${item.categoryOfferPrice > 0 ? item.categoryOfferName : 'No offer'}</td>
          <td>$${order.totalAmount}</td>
        </tr>`;
      
  
    });
  });

  // Add total price row
  html += `
        <tr>
          <td colspan="6"><strong>Total Price</strong></td>
          <td><strong>$${totalPrice}</strong></td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>`;

  return html;
}


exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.find({});
    const categories = await Category.find({});
    res.render("admin/adminBanner", { banner, categories });
  } catch (error) {
    console.log(error);
  }
};

exports.addBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ bannerName: req.body.bannerName });
    if (banner) {
      return res.redirect("/admin_banner");
    }
    const brand = await Category.findOne({ _id: req.body.brandId });
    const brandName = brand.category;
    const newBanner = new Banner({
      bannerName: req.body.bannerName,
      heading: req.body.bannerHeading,
      subheading: req.body.bannerSubHeading,
      image: req.file ? req.file.filename : null,
      brandName: brandName,
      brandId: req.body.brandId,
    });
    await newBanner.save();
    res.redirect("/admin_banner");
  } catch (error) {
    console.log(error);
  }
};

exports.deleteBanner = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
