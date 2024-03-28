const Category = require('../model/categoryModel')
const Product = require('../model/productModel');
const Offer = require('../model/offerModel')
const Coupon = require('../model/couponModel')


exports.getOffer = async (req,res)=> {
    try {
        const offers = await Offer.find({}).populate('product').populate('category')
        res.render('admin/adminOffer',{offers:offers})
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}

exports.getProductOffer = async (req,res)=> {
    try {
        const product = await Product.find({})
        res.render('admin/productOffer',{data:product})
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}

exports.getCategoryOffer = async (req,res)=> {
    try {
        const category = await Category.find({})
        res.render('admin/categoryOffer',{data:category})
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}

exports.addProductOffer = async (req,res)=> {
    try {
       const {name,percentage,product} = req.body
       console.log(name)
       console.log(percentage)
       console.log('The type of percentage is ',typeof(percentage))
       console.log(product)

        if(percentage <= 0 || percentage > 99){
            return res.status(400).json({message:"Enter the valid percentage"})
        } 

        const existingOffer = await Offer.findOne({name:name})

        if(existingOffer){
            return res.status(400).json({message:"Offer in the same name is Exist"})
        } 

        const existingProduct = await Product.findById(product)

        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const sameProduct = await Offer.findOne({product:product})

        if(sameProduct){
            return res.status(400).json({message:`Already applied offer for ${existingProduct.productName}`})
        }

        existingProduct.percentage = percentage
        const originalPrice = existingProduct.price;
        const offerPrice = originalPrice - (originalPrice * (percentage / 100)).toFixed(2);
        existingProduct.offerPrice = offerPrice
        existingProduct.price = originalPrice - offerPrice
        existingProduct.productOfferName = name
        existingProduct.productOfferPrice = offerPrice
        await existingProduct.save()
        
        const newOffer = new Offer({
            name,
            percentage,
            product
        });
        await newOffer.save();
       
        return res.status(200).json({message:`Offer successfully created for ${existingProduct.productName}`})
        
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}

exports.addCategoryOffer = async (req,res)=> {
    try {
        const {name,percentage,category} = req.body
        if(percentage<=0 || percentage >100){
            return res.status(400).json({message:"Enter the valid percentage"})
        }

        const existingOffer = await Offer.findOne({name:name})

        if(existingOffer){
            return res.status(400).json({message:"Offer in the same name is exist"})
        } 
        const existingCategory = await Category.findById(category)
        const sameCategory = await Offer.findOne({category:category})
        if(sameCategory){
            return res.status(400).json({message:`Already applied offer for ${existingCategory.category}`})
        }
    
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        

        const productsInCategory = await Product.find({category:category}) 

        if (!productsInCategory || productsInCategory.length === 0) {
            return res.status(404).json({ message: "No products found in the category" });
        }

        for (const product of productsInCategory) {
            const originalPrice = product.price;
            const offerPrice = originalPrice - (originalPrice * (percentage / 100)).toFixed(2);
            product.price = originalPrice - offerPrice;
            product.categoryOfferName = name
            product.categoryOfferPrice = offerPrice
            await product.save();
        }
        
        const newOffer = new Offer({
            name,
            percentage,
            category
        });
        await newOffer.save();
       
        return res.status(200).json({message:`Offer successfully created for the category ${existingCategory.category}`})
        
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}

exports.deleteProductOffer = async (req, res) => {
    try {
        const { offerId } = req.body;
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        const product = await Product.findById(offer.product);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Calculate the amount that needs to be added back to the original price
        const originalPrice = product.price 
        product.price = originalPrice + product.productOfferPrice;
        product.productOfferPrice = 0
        product.productOfferName = null

        await product.save();
        await Offer.findByIdAndDelete(offerId);
        return res.status(200).json({ message: "Offer successfully deleted" });

    } catch (error) {
        console.log(error);
        return res.status(500).redirect("/error");
    }
};


exports.deleteCategoryOffer = async (req,res)=>{
    try {
        const {offerId} = req.body
        const offer = await Offer.findById(offerId)
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        const products = await Product.find({category:offer.category})
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found in the category" });
        }

        for (const product of products){
        const originalPrice = product.price
        product.price = originalPrice + product.categoryOfferPrice;
        product.categoryOfferPrice = 0
        product.categoryOfferName = null
        await product.save() 
        }

        await Offer.findByIdAndDelete(offerId)
        return res.status(200).json({ message: "Offer successfully deleted" });

    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}


exports.getCoupon = async (req,res)=> {
    try {
        const coupon = await Coupon.find({})
        res.render('admin/couponManagement',{coupons:coupon})
    } catch (error) {
        console.log(error)
        return res.status(500).redirect("/error");
    }
}


exports.addCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, validity, discount, limit } = req.body;
        
        // Check if all fields are filled
        if (!couponName || !couponCode || !validity || !discount || !limit) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // Check if validity date is in the past
        if (new Date(validity) < new Date()) {
            return res.status(400).json({ message: "Validity date should be in the future" });
        }

        // Check if coupon code already exists
        const existingCouponCode = await Coupon.findOne({ couponCode });
        if (existingCouponCode) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        // Check if coupon name already exists
        const existingCouponName = await Coupon.findOne({ couponName });
        if (existingCouponName) {
            return res.status(400).json({ message: "Coupon name already exists" });
        }

        // Check if limit is less than discount and greater than zero
        if (limit < 0 || limit < discount) {
            return res.status(400).json({ message: "Limit should be greater than zero and less than discount" });
        }

        // Check if discount is between 0 and limit
        if (discount < 0 || discount > limit) {
            return res.status(400).json({ message: "Enter valid discount" });
        }

        const newCoupon = new Coupon({
            couponName,
            couponCode,
            validity,
            discount,
            limit,
            isActive: true
        });
        
        await newCoupon.save();
        return res.status(200).json({ message: "Successfully added new coupon" });
    } catch (error) {
        console.log(error);
        return res.status(500).redirect("/error");
    }
};

exports.editCoupon = async (req, res) => {
    try {
        const {couponId, couponName, couponCode, validity, discount, limit } = req.body;
        const discountNumber = parseInt(discount)
        const limitNumber = parseInt(limit)
        console.log(couponId)
        console.log(couponName)
        console.log(couponCode)
        console.log(validity)
        console.log(discount)
        console.log(limit)
        
        const couponExist = await Coupon.find({couponCode:couponCode})
        if(couponExist){
            return res.redirect('/admin_coupon')
        }

        if(limitNumber < 0){
           return res.status(400).redirect('/admin_coupon')
             
        }
        if(discountNumber < 0 || discountNumber > limitNumber){
            return res.status(400).redirect('/admin_coupon')
        }
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $set: {
                couponName,
                couponCode,
                validity,
                discount,
                limit
            }
        },{new:true});

        if (!updatedCoupon) {
            return res.status(400).redirect('/admin_coupon')
        }
            return res.redirect('/admin_coupon')

    } catch (error) {
        console.error("Error while editing the coupon", error);
        return res.status(500).json({ success: false, message: "An error occurred while editing the coupon" });
    }
};

exports.deactiveCoupon = async (req,res)=> {
    try {
        const {couponId} = req.body
        const coupon = await Coupon.findByIdAndUpdate(couponId,{$set:{isActive:false}})
        if (!coupon) {
            return res.status(400).json({message:"Coupon not available at the moment"})
        }
        return res.status(200).json({message:"Deactivated"})

    } catch (error) {
        console.error("Error while editing the coupon", error);
        return res.status(500).json({ message: "An error occurred while deleting the coupon" });
    }
}

exports.activateCoupon = async (req,res)=> {
    try {
        const {couponId} = req.body
        const coupon = await Coupon.findByIdAndUpdate(couponId,{$set:{isActive:true}})
        if (!coupon) {
            return res.status(400).json({message:"Coupon not available at the moment"})
        }
        return res.status(200).json({message:"Activated"})

    } catch (error) {
        console.error("Error while editing the coupon", error);
        return res.status(500).json({ message: "An error occurred while deleting the coupon" });
    }
}