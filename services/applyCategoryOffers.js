// const categoryOfferCollection = require("../models/categoryOfferModel");
const categoryOfferCollection = require('../model/categoryOfferModel');
const productCollection = require("../model/productModel");


const applyCategoryOffer = async () => {
    try {
      const today = new Date();
  
      const offers = await categoryOfferCollection.find({ isAvailable: true });
  
      const allProducts = await productCollection.find();
  
      for (const prod of allProducts) {
        const currentOffer = offers.find(
          (offer) => String(offer.category) === String(prod.category)
        );
  
        if (
          currentOffer &&
          currentOffer.startDate <= today &&
          currentOffer.endDate >= today
        ) {
          await productCollection.findByIdAndUpdate(prod._id, {
            offerPrice: Math.floor(
              prod.price - (prod.price * currentOffer.offerPercentage) / 100
            ),
          });
        } else {
          await productCollection.findByIdAndUpdate(prod._id, {
            offerPrice: prod.price,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  module.exports = { applyCategoryOffer };