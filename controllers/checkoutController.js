const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const { grandTotal } = require("../controllers/cartController");
const AddressModel = require("../model/addressModel");
const wishlistCollection = require("../model/wishlistModel");
const couponCollection = require("../model/couponModel");

const getCheckout = async (req, res) => {
  try {
    const id = req.session.userData._id;
    const userData = req.session.userData;

    await grandTotal(req);
    const grandTotalCheckout = req.session.grandTotal;
    const newGrandTotal = req.session?.newGrandTotal;
    const couponTotal = req.session?.couponTotal;
    const checkoutData = await cartModel
      .find({ userId: id })
      .populate("productId");
    const addressData = await AddressModel.find({ user_id: id });
    // console.log(addressData)
    // console.log(checkoutData)
    const wishlistDetails = await wishlistCollection.findOne({userId:req.session?.userData?._id})
    const wishlistCount = wishlistDetails?.wishlistProducts.length;
    const cartCount = await cartModel.find({userId:req.session?.userData?._id}).countDocuments();
    const couponData = await couponCollection.find()
    let couponValue = []
    couponData.forEach((data)=>{
        couponValue.push(data.couponCode)
    })
    
    res.render("user/checkout", {
      userData,
      checkoutData,
      grandTotalCheckout,
      newGrandTotal,
      couponTotal,
      addressData,
      wishlistCount,
      cartCount,
      couponData,
      couponValue
    });
  } catch (error) {
    console.error(`error while getting the checkout page \n ${error}`);
  }
};

const applyCoupon = async (req,res)=>{
  try {
    const couponData = await couponCollection.findOne({couponCode:req.body?.couponCode})
    console.log(couponData)
    console.log(req.session.grandTotal)
    let newGrandTotal;
    let couponTotal = req.session?.couponTotal || 0;
    if(req.session.newGrandTotal){
        const couponAmount = Math.round(Number(req.session?.newGrandTotal) * (couponData?.discountPercentage / 100))
        newGrandTotal = Number(req.session?.newGrandTotal) - couponAmount
        couponTotal += couponAmount
    }else{
        const couponAmount = Math.round(Number(req.session?.grandTotal) * (couponData?.discountPercentage / 100))
        newGrandTotal = Number(req.session?.grandTotal) - couponAmount
        couponTotal += couponAmount
    }
    console.log(newGrandTotal)
    req.session.newGrandTotal = newGrandTotal;
    req.session.couponTotal = couponTotal;
    const userId = req.session?.userData?._id
    const applyCoupon =  await couponCollection.findByIdAndUpdate({_id:couponData?._id},{$push:{userId:userId}})
    // console.log(applyCoupon)
    console.log(couponTotal)
    res.status(200).send({success:true})
  } catch (error) {
    console.error(`error while applying the user entered coupon n \n ${error}`);
    res.status(501).send({success:false})
  }
}


module.exports = {
  getCheckout,
  applyCoupon
};
