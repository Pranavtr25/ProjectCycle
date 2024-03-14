const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel")

const orderData = async (req,res)=>{
    try {
        const cartValue= await cartModel.find({userId:req.session?.userData?._id}).populate("productId")
        const{
            grandTotalCheckout,
            paymentTypeValue,
            selectAddressValue
        } = req.body
        // console.log(req.body)
        const data ={
            userId:req.session?.userData?._id,
            orderNumber:await orderModel.find().estimatedDocumentCount()+1,
            paymentType:paymentTypeValue,
            addressChosen:selectAddressValue,
            cartData:JSON.parse(JSON.stringify(cartValue)),
            grandTotalCost:grandTotalCheckout
        }

        req.session.orderNumber = data.orderNumber;

        await orderModel(data).save();

        res.status(200).send({success:true})

    } catch (error) {
        console.error(`error while saving the error data \n ${error}`);
        res.status(501).send({success:false})
    }
}


const getOrderSuccess = async (req,res)=>{
    try {
        req.session.userData;
        const cartData = await cartModel.find({userId:req.session.userData._id}).populate("productId");
        console.log(cartData)
        const orderNumber = req.session.orderNumber;
        const orderData = await orderModel.findOne({userId:req.session.userData._id,orderNumber:orderNumber})
        console.log(`orderrrrrrr  data : ${orderData}`)
        res.render("user/orderSuccess",{userData:req.session.userData,cartData,orderData})
    } catch (error) {
        console.error(`error while getting the getting the order success page \n ${error}`);
    }
}


module.exports={
    orderData,
    getOrderSuccess
}