const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel");
const razorPay = require("razorpay")
const { deleteMany } = require("../model/userModel");
const dotenv=require("dotenv")
dotenv.config();


async function productStockMaintain (cartData){
    console.log(`cartData : ${JSON.stringify(cartData)}`)
    await cartData.forEach(async(data)=>{
        id = data.productId._id
        dec = data.productQuantity
        await productModel.findByIdAndUpdate({_id:id},{$inc:{"productStock":-dec}})
    })
}


const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env

let instance = new razorPay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
  });

const orderData = async (req,res)=>{
    try {
        const cartValue= await cartModel.find({userId:req.session?.userData?._id}).populate("productId")
        
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

        const decProductData = JSON.stringify(cartValue)

       await cartValue.forEach(async data=>{
            await productModel.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:-data.productQuantity}})
        })
                await cartModel.deleteMany({userId:req.session?.userData?._id});

        res.status(200).send({success:true})

    } catch (error) {
        console.error(`error while saving the order data \n ${error}`);
        res.status(501).send({success:false})
    }
}


const razorPayOrder = async (req,res)=>{
    try {
        console.log(req.body)

        const grandTotalCheckout = req.body.grandTotalCheckout
        req.session.razorPayOrderData = req.body
        console.log(`razorrrrr : ${req.session.razorPayOrderData.grandTotalCheckout}`)

        instance.orders
          .create({
            amount: grandTotalCheckout + "00",
            currency: "INR",
            receipt: "receipt#1",
          }).then((order) => {
            console.log(`order ID : \n${order.id} `)
            res.json(order)
            // return res.send({ orderId: order.id });
          }).catch((err)=>{
            console.log(err)
          });
    } catch (error) {
        console.error(`error in razorpay order \n ${error}`);
    }
}

const razorPayOrderSuccess = async (req,res)=>{
    try {
        // console.log(req)
        const userId = req.session?.userData?._id
        const orderNumber=await orderModel.countDocuments() + 1
        const userCartData = await JSON.parse(JSON.stringify(await cartModel.find({userId:userId}).populate("productId")))
        const grandTotalCheckout = req.session?.razorPayOrderData?.grandTotalCheckout
        const paymentTypeValue = req.session?.razorPayOrderData?.paymentTypeValue
        const selectAddressValue = req.session?.razorPayOrderData?.selectAddressValue
        const razorPayId = req.body?.razorpay_payment_id

        const orderDetails = {
            userId:userId,
            orderNumber:orderNumber,
            paymentType:paymentTypeValue,
            addressChosen:selectAddressValue,
            cartData:userCartData,
            grandTotalCost:grandTotalCheckout,
            razorPayId:razorPayId
        }

        req.session.orderNumber=orderNumber

        await orderModel(orderDetails).save()

        productStockMaintain(userCartData)

        await cartModel.deleteMany({userId:userId})

        res.status(401).redirect("/orderSuccess")

    } catch (error) {
        console.error(`error in razor pay order success \n ${error}`);
    }
}


const getOrderSuccess = async (req,res)=>{
    try {
        req.session.userData;
        const cartData = await cartModel.find({userId:req.session.userData._id}).populate("productId");
        console.log(cartData)
        const orderNumber = req.session?.orderNumber;
        const orderData = await orderModel.findOne({userId:req.session.userData._id,orderNumber:orderNumber})
        res.render("user/orderSuccess",{userData:req.session.userData,cartData,orderData})
    } catch (error) {
        console.error(`error while getting the getting the order success page \n ${error}`);
    }
}





module.exports={
    orderData,
    getOrderSuccess,
    razorPayOrderSuccess,
    razorPayOrder
}