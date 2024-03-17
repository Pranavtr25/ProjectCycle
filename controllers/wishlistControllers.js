const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel");


const getWishlist = (req,res)=>{
    try {
        res.render("user/wishlist")
    } catch (error) {
        console.error(`error while getting the wishlist page \n ${error}`);
    }
}


module.exports = {
    getWishlist
}