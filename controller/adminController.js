const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const Order = require("../model/orderModel");
const Banner = require("../model/bannerModel");
const puppeteer = require('puppeteer')
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

//====================================== LOGIN PAGE OF ADMIN  =========================================

exports.getLogin = (req, res) => {
  res.render("admin/adminLogin", { data: "" });
};

//======================================  GET ADMIN PANEL  =========================================

exports.adminPanel = async (req, res) => {
  try {
    if (req.session.admin) {
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      const pendingOrders = await Order.find({
        paymentType: "Pending",
      }).countDocuments();
      const totalOrders = await Order.countDocuments();

      // Fetch top selling products with product details
      const topSellingProducts = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: "$product._id",
            productName: "$product.productName",
            totalQuantity: 1,
            lastImage: { $arrayElemAt: ["$product.image", -1] },
          },
        },
      ]);

      // Fetch top selling categories with category details
      const topSellingCategories = await Order.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $project: {
            _id: "$category._id",
            categoryName: "$category.category",
            totalQuantity: 1,
          },
        },
      ]);


      res.render("admin/adminPanel", {
        data: "",
        totalUsers: userCount,
        totalProducts: productCount,
        pendingOrders: pendingOrders,
        totalOrders: totalOrders,
        topSellingProducts,
        topSellingCategories,
      });
    } else res.redirect("/admin_login");
  } catch (error) {
    console.log(error);
  }
};

// Controller to fetch sales data
exports.getSalesData = async (req, res) => {
  try {
    const { filter } = req.query;

    let salesData = {};
    if (filter === "yearly") {
      salesData = await getYearlySalesData();
    } else if (filter === "monthly") {
      salesData = await getMonthlySalesData();
    } else if (filter === "daily") {
      salesData = await getDailySalesData(); // New function for daily sales data
    } else {
      throw new Error("Invalid filter parameter");
    }

    res.json(salesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getDailySalesData() {
  // Logic to fetch daily sales data
  // Example: Aggregate orders by day and calculate total sales for each day
  const dailySalesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by date
    },
    {
      $project: {
        date: "$_id",
        totalSales: 1,
        _id: 0,
      },
    },
  ]);

  // Format data for chart
  const labels = dailySalesData.map((item) => item.date);
  const sales = dailySalesData.map((item) => item.totalSales);

  return { labels, sales };
}

// Helper function to fetch yearly sales data
async function getYearlySalesData() {
  // Your logic to fetch yearly sales data
  // Example: Aggregate orders by year and calculate total sales for each year
  const yearlySalesData = await Order.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        year: "$_id",
        totalSales: 1,
        _id: 0,
      },
    },
  ]);

  // Format data for chart
  const labels = yearlySalesData.map((item) => item.year);
  const sales = yearlySalesData.map((item) => item.totalSales);

  return { labels, sales };
}

// Helper function to fetch monthly sales data
async function getMonthlySalesData() {
  // Your logic to fetch monthly sales data
  // Example: Aggregate orders by month and year and calculate total sales for each month
  const monthlySalesData = await Order.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        totalSales: 1,
        _id: 0,
      },
    },
  ]);

  // Format data for chart
  const labels = monthlySalesData.map((item) => `${item.year}-${item.month}`);
  const sales = monthlySalesData.map((item) => item.totalSales);

  return { labels, sales };
}

//======================================  ADMIN LOGIN ACTION  =========================================

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

//======================================  FORGOT ADMIN PASSWORD MANAGEMENT  =========================================

exports.forgotPassword = (req, res) => {
  res.render("admin/adminForgotPass", { data: "" });
};


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

//======================================  RESET ADMIN PASSWORD MANAGEMENT  =========================================

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

//======================================  ADMIN LOGOUT MANAGEMENT  =========================================

exports.adminLogout = (req, res) => {
  req.session.admin = null;
  res.redirect("/admin_login");
};

//====================================== ADMIN USER MANAGEMENT   =========================================

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
    req.session.userLoggedIn = null;
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
    const { oldCategory, category } = req.body;
    const categoryExist = await Category.findOne({ category: category });
    if (categoryExist) {
      return res
        .status(400)
        .json({ message: "Category with this name is exist" });
    } else {
      await Category.findOneAndUpdate(
        { category: oldCategory },
        { $set: { category: category } },
        { new: true }
      );

      res.status(200).json({ message: "Successfully Edited the category" });
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
      return res
        .status(400)
        .json({ message: "Category with this name is exist" });
    } else {
      const newCategory = new Category({
        category: category,
      });
      await newCategory.save();
      res.status(200).json({ message: "Successfully Added the category" });
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



//======================================  PRODUCT MANAGEMENT  =========================================

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
    let price = parseFloat(req.body.price);
    price = price.toFixed(2);
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
    const { productId } = req.query;

    if (req.body.price <= 0) {
      return res.redirect("/admin_products");
    }
    let price = parseFloat(req.body.price);
    price = price.toFixed(2);

    const updateFields = {};

    if (req.body.productName) {
      updateFields.productName = req.body.productName;
    }

    if (req.files && req.files.length > 0) {
      // Fetch existing product
      const product = await Product.findById(productId);
      // Append new images to existing images
      const arrImages = [
        ...product.image,
        ...req.files.map((value) => value.filename),
      ];
      updateFields.image = arrImages;
    }

    if (req.body.price) {
      updateFields.price = price;
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

    await Product.findOneAndUpdate({ _id: productId }, { $set: updateFields });

    res.redirect("/admin_products");
  } catch (error) {
    console.log(error);
  }
};

exports.deleteImageFromEdit = async (req, res) => {
  const productId = req.query.id;
  const imageToDelete = req.query.image;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the image from the product's images array
    const index = product.image.indexOf(imageToDelete);
    if (index !== -1) {
      product.image.splice(index, 1);
      // Save the updated product
      await product.save();
      return res.status(200).json({ message: "Image deleted successfully" });
    } else {
      return res.status(404).json({ message: "Image not found in product" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal server error" });
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

//======================================  ORDER MANAGEMENT  =========================================

exports.orderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page parameter is provided
    const perPage = 10; // Number of products per page
    const skip = (page - 1) * perPage; // Calculate the number of products to skip

    const orderCount = await Order.countDocuments();
    const totalPages = Math.ceil(orderCount / perPage);

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
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

//======================================  UPDATING ORDER STATUS  =========================================

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

//======================================  SALES REPORT MANAGEMENT  =========================================

let orders;
let heading;

exports.getSalesReport = async (req, res) => {
  try {
    let query = {
      paymentType: { $ne: "Pending" },
      "items.orderStatus": {
        $nin: ["Cancelled By User", "Cancelled By Admin"],
      },
    };

    if (req.query["start-date"] && req.query["end-date"]) {
      const startDate = new Date(req.query["start-date"]);
      const endDate = new Date(req.query["end-date"]);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lte: endDate };
      heading = `Sales Report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    } else {
      switch (req.query.range) {
        case "monthly":
          query.createdAt = {
            $gte: new Date(new Date().setDate(1)),
            $lte: new Date(),
          };
          heading = "MONTHLY REPORT";
          break;
        case "daily":
          const todayDaily = new Date();
          const startOfDay = new Date(
            todayDaily.getFullYear(),
            todayDaily.getMonth(),
            todayDaily.getDate(),
            0,
            0,
            0
          );
          const endOfDay = new Date(
            todayDaily.getFullYear(),
            todayDaily.getMonth(),
            todayDaily.getDate(),
            23,
            59,
            59
          );
          query.createdAt = { $gte: startOfDay, $lte: endOfDay };
          heading = "DAILY REPORT";
          break;
        case "weekly":
          const today = new Date();
          const oneWeekAgo = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 7
          );
          query.createdAt = { $gte: oneWeekAgo, $lte: new Date() };
          heading = "WEEKLY REPORT";
          break;
        case "yearly":
          query.createdAt = {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lte: new Date(),
          };
          heading = "YEARLY REPORT";
          break;
        default:
          heading = "SALES REPORT";
          break;
      }
    }

    orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("items.product")
      .populate("userId")
      .populate("couponApplied");


    let totalAmount = 0;
    for (const order of orders) {
      totalAmount += order.totalAmount;
    }
    totalAmount = totalAmount.toFixed(2);
    req.session.totalAmount = totalAmount;

    const formattedOrders = orders.map((order) => ({
      ...order.toObject(),
      createdAt: order.createdAt.toLocaleString(),
      orderTotal: order.totalAmount,
    }));

    res.render("admin/salesReport", {
      order: formattedOrders,
      totalAmount,
      heading,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadSalesReport = async (req, res) => {
  try {
    let totalAmount = req.session.totalAmount;
    // Generate the HTML content for the sales report
    const salesReportHtml = generateSalesReportPDF(
      orders,
      totalAmount,
      heading
    );

     // Launch Puppeteer browser instance
     const browser = await puppeteer.launch();
     const page = await browser.newPage();
 
     // Set content of the page to invoice HTML
     await page.setContent(salesReportHtml);
 
     // Generate PDF
     const pdfBuffer = await page.pdf({ format: 'A4' });
 
     await browser.close();
 
     // Set headers to make the browser download the file
     res.setHeader("Content-Type", "application/pdf");
     res.setHeader(
       "Content-Disposition",
       `attachment; filename="salesreport_${heading}.pdf"`
     );
 
     // Send PDF buffer as response
     res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Function to generate HTML content for the sales report
function generateSalesReportPDF(orders, totalAmount, heading) {
  let totalPrice = totalAmount;
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${heading}</title>
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
      <h1>${heading}</h1>
      <table>
        <thead>
          <tr>
            <th>Order Date</th>
            <th>Username</th>
            <th>Product Name</th>
            <th>Product Offer</th>
            <th>Category Offer</th>
            <th>Coupon Applied </th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>`;

  // Initialize total price

  // Populate table rows
  orders.forEach((order) => {
    order.items.forEach((item) => {
      html += `
        <tr>
          <td>${order.createdAt.toLocaleString()}</td>
          <td>${order.userId.userName}</td>
          <td>${item.product.productName}</td>
          <td>${
            item.productOfferPrice > 0 ? item.productOfferName : "No offer"
          }</td>
          <td>${
            item.categoryOfferPrice > 0 ? item.categoryOfferName : "No offer"
          }</td>
          <td>${
            order.couponApplied ? "$" + order.couponApplied.discount : "-"
          }</td>
        </tr>
        <tr>
        <td colspan="6" class="text-right">Total Amount of the order:</td>
        <td class="totalPrice">${order.totalAmount}</td>
        <td></td> 
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


//======================================  BANNER MANAGEMENT  =========================================

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

exports.editBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.body.bannerId);
    if (!banner) {
      return res.redirect("/admin_banner");
    }

    const brand = await Category.findOne({ _id: req.body.brandId });
    const brandName = brand ? brand.category : null;

    const updatedBanner = {
      bannerName: req.body.bannerName,
      heading: req.body.bannerHeading,
      subheading: req.body.bannerSubHeading,
      image: req.file ? req.file.filename : banner.image, // Use existing image if no new file provided
      brandName: brandName,
      brandId: req.body.brandId,
    };

    const updatedBannerDocument = await Banner.findByIdAndUpdate(
      req.body.bannerId,
      updatedBanner,
      { new: true }
    );

    if (!updatedBannerDocument) {
      return res.status(404).send("Banner not found");
    }

    res.redirect("/admin_banner");
  } catch (error) {
    console.error("Error editing banner:", error);
    res.status(500).send("Internal server error");
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    await Banner.findByIdAndDelete(bannerId);
    res.redirect("/admin_banner");
  } catch (error) {
    console.log(error);
    res.status(500).send("Network error");
  }
};
