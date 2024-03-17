const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel");
const { deleteMany } = require("../model/userModel");

const orderData = async (req,res)=>{
    try {
        const cartValue= await cartModel.find({userId:req.session?.userData?._id}).populate("productId")
        // console.log("-------------------------------------------------------cartdata-------------------------")
        // console.log(cartValue)
        // console.log("-------------------------------------------------------cartdata-------------------------")

        const{
            grandTotalCheckout,
            paymentTypeValue,
            selectAddressValue
        } = req.body

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

        console.log(`=====================`)
        console.log(JSON.stringify(cartValue))
        console.log(`=====================`)

        const decProductData = JSON.stringify(cartValue)

       await cartValue.forEach(async data=>{
            await productModel.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:-data.productQuantity}})
        })
        // console.log(`deccccccc : ${decProductArr}`)

        // cartModel.forEach(data=>{
        //     console.log(data.productQuantity , data.productId)
        // })

        await cartModel.deleteMany({userId:req.session?.userData?._id});

        res.status(200).send({success:true})

    } catch (error) {
        console.error(`error while saving the order data \n ${error}`);
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