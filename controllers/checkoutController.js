const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const { grandTotal } = require("../controllers/cartController");
const AddressModel = require("../model/addressModel");
const wishlistCollection = require("../model/wishlistModel")

const getCheckout = async (req, res) => {
  try {
    const id = req.session.userData._id;
    const userData = req.session.userData;

    await grandTotal(req);
    const grandTotalCheckout = req.session.grandTotal;
    const checkoutData = await cartModel
      .find({ userId: id })
      .populate("productId");
    const addressData = await AddressModel.find({ user_id: id });
    // console.log(addressData)
    // console.log(checkoutData)
    // const wishlistCount = await wishlistCollection.find({userId:req.session?.userData?._id}).countDocuments();
    // const cartCount = await cartModel.find({userId:req.session?.userData?._id}).countDocuments();
    res.render("user/checkout", {
      userData,
      checkoutData,
      grandTotalCheckout,
      addressData,
      wishlistCount:req.session?.wishlistCount,
      cartCount:req.session?.cartCount
    });
  } catch (error) {
    console.error(`error while getting the checkout page \n ${error}`);
  }
};
module.exports = {
  getCheckout,
};
