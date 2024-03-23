const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const formatDate = require("../helper/formatDate")
const couponCollection =require("../model/couponModel")
const productOfferCollection = require("../model/productOfferModel")
const categoryOfferCollection = require("../model/categoryOfferModel");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel")
const applyProductOffers = require("../services/applyProductOffers").applyProductOffer
const applyCategoryOffer= require("../services/applyCategoryOffers").applyCategoryOffer


const getProductOfferList = async (req,res)=>{
    try {
      let productOfferData = await productOfferCollection.find();
          productOfferData.forEach(async (v) => {
            await productOfferCollection.updateOne(
              { _id: v._id },
              {
                $set: {
                  currentStatus:
                    v.endDate >= new Date() && v.startDate <= new Date(),
                },
              }
            );
          });
    
          console.log(productOfferData)
          //sending the formatted date to the page
          productOfferData = productOfferData.map((v) => {
            v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
            v.endDateFormatted = formatDate(v.endDate, "YYYY-MM-DD");
            return v;
          });
    
          let productData = await productModel.find();
          let categoryData = await categoryModel.find();

          console.log(productData)
    
          res.render("admin/productOfferList", {
            productData,
            productOfferData,
            categoryData,
          });
    } catch (error) {
        console.error(`error while getting the product offer list \n ${error}`);
    }
}

const productAddOfferData = async (req,res)=>{
  try {
          let { productName } = req.body;
          let existingOffer = await productOfferCollection.findOne({ productName });
          if (!existingOffer) {
              //if offer for that particular product doesn't exist:

              let product = req.body?.productName
              let productData = await productModel.findOne({productName:product});
              let { productOfferPercentage, startDate, endDate } = req.body;
              await productOfferCollection.insertMany([
              {
                  productId: productData._id,
                  productName,
                  productOfferPercentage,
                  startDate: new Date(startDate),
                  endDate: new Date(endDate),
              },
              ]);
              await applyProductOffers("addOffer");
              res.json({ success: true });
          } else {
              res.json({ success: false });
          }
  } catch (error) {
    console.error(`error while adding the product offer data \n ${error}`);
  }
}

const productEditOfferData = async (req,res)=>{
    try {
        
        let { productName } = req.body;

        let existingOffer = await productOfferCollection.findOne({
          productName: { $regex: new RegExp(req.body.productName, "i") },
        });
  
        if (!existingOffer || existingOffer._id == req.params.id) {
        
          let { discountPercentage, startDate, expiryDate } = req.body;
          let updateFields = {
           productName,
           productOfferPercentage:Number( discountPercentage),
            startDate: new Date(startDate),
            endDate:new Date(expiryDate),
          };

   
          await productOfferCollection.findByIdAndUpdate(
            req.params.id,
            updateFields
          );
          await applyProductOffers("editOffer");
          res.json({ success: true });
        } else {
          console.log(`else is working`)
          res.json({ success: false });
        }
    } catch (error) {
        console.error(`error while editing the product offer data \n ${error}`);
    }
}


const getCategoryOfferList = async (req,res)=>{
    try {
        const categories = await categoryModel.find();
        console.log(categories)
        const offers = await categoryOfferCollection.find().populate("category");
        console.log(offers)
        applyCategoryOffer();
        res.render("admin/categoryOfferList",{categories,offers})
      } catch (error) {
        console.error(`error while getting the category offer list \n ${error}`);
    }
}


const categoryAddOfferData = async (req,res)=>{
  try {
      const { category, offerPercentage, startDate, endDate } = req.body;            
      const offerExist = await categoryOfferCollection.findOne({ category });
      if (offerExist) {
        return res.status(500).send({ exist: true });
      }
      const offer = await new categoryOfferCollection({
        category,
        offerPercentage,
        startDate,
        endDate
      }).save();
      return res.status(200).send({ success: true });
  } catch (error) {
    console.error(`error while adding the category offer \n ${error}`);  
    return res.status(500).send({ success: false });
  }
}

module.exports = {
    getProductOfferList,
    productAddOfferData,
    productEditOfferData,
    getCategoryOfferList,
    categoryAddOfferData
}