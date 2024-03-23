const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const formatDate = require("../helper/formatDate")
const couponCollection =require("../model/couponModel")
const productOfferCollection = require("../model/productOfferModel")
const categoryOfferCollection = require("../model/categoryOfferModel");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel")
const applyProductOffers = require("../services/applyProductOffers").applyProductOffer

const getCouponManagement = async (req,res)=>{
    try {
        let couponData = await couponCollection.find()
        console.log(couponData)
        couponData = couponData.map((v) => {
            v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
            v.expiryDateFormatted = formatDate(v.expiryDate, "YYYY-MM-DD");
            return v;
          });
        res.render("admin/couponManagement",{couponData})
    } catch (error) {
        console.error(`error while getting the coupon management \n ${error}`);
    }
}

const addCouponData = async (req,res)=>{
    try {
        console.log(`req reached addCoupon`)
        let existingCoupon = await couponCollection.findOne({
          couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
        });

   console.log(existingCoupon)
    
        if (!existingCoupon) {
          await couponCollection.insertMany([
            {
              couponCode: req.body.couponCode,
              discountPercentage: req.body.discountPercentage,
              startDate: new Date(req.body.startDate),
              expiryDate: new Date(req.body.expiryDate),
              minimumPurchase: req.body.minimumPurchase,
              maximumPurchase: req.body.maximumDiscount,
            },
          ]);
          return res.json({ couponAdded: true });
        } else {
          return res.json({ couponCodeExists: true });
        } 
    } catch (error) {
        console.error(`error while saving the add coupon \n ${error}`);
        return res.status(500).json({ err: "Internal Server Error" });
    }
}

const editCouponData = async (req,res)=>{
    try {
        let existingCoupon = await couponCollection.findOne({
            couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
          });
          if (!existingCoupon || existingCoupon._id == req.params.id) {
            let updateFields = {
              couponCode: req.body.couponCode,
              discountPercentage: req.body.discountPercentage,
              startDate: new Date(req.body.startDate),
              expiryDate: new Date(req.body.expiryDate),
              minimumPurchase: req.body.minimumPurchase,
              maximumPurchase: req.body.maximumPurchase,
            };
            await couponCollection.findOneAndUpdate(
              { _id: req.params.id },
              { $set: updateFields }
            );
            return res.json({ couponEdited: true });
          } else {
            return res.json({ couponCodeExists: true });
          }
    } catch (error) {
        console.error(`error while saving the edit coupon data \n ${error}`);
    }
}

const deleteCouponData = async(req,res)=>{
    try {
        await couponCollection.findByIdAndDelete(req.params.id);
        return res.json({ couponDeleted: true });
    } catch (error) {
        console.error(`error while deleting the existing coupon \n ${error}`);
    }
}



module.exports ={
    getCouponManagement,
    addCouponData,
    editCouponData,
    deleteCouponData,
}