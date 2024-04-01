const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel");
const razorPay = require("razorpay")
const walletCollection = require("../model/walletModel")
const { deleteMany } = require("../model/userModel");
const wishlistCollection = require("../model/wishlistModel")
const { generatevoice } = require("../services/generatePDF");
const dotenv=require("dotenv")
dotenv.config();


async function productStockMaintain (cartData){
    console.log(`cartData : ${JSON.stringify(cartData)}`)
    await cartData.forEach(async(data)=>{
        id = data.productId?._id
        dec = data.productQuantity
        await productModel.findByIdAndUpdate({_id:id},{$inc:{"productStock":-dec}})
        await productModel.findByIdAndUpdate({_id:id},{$inc:{stockSold:dec}})
        await categoryModel.updateOne({categoryName:data.productId?.parentCategory},{$inc:{stockSold:data.productQuantity}})
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

        if(paymentTypeValue=="Wallet"){
            const walletData = await walletCollection.findOne({userId:req.session?.userData._id})
            console.log(`walletData..........${walletData}`)
            if(walletData.walletBalance < grandTotalCheckout){
                return res.status(501).send({success:false,insufficientWalletBalance:true})
            }else{
                const transactionAmount = grandTotalCheckout
                const transactionType = paymentTypeValue

                const saveWallet = {
                    transactionAmount,
                    transactionType
                }
                await walletCollection.findByIdAndUpdate({_id:walletData?._id},{$push:{walletDebitTransaction:saveWallet}})

                const walletNewAmount = walletData.walletBalance - grandTotalCheckout;
                await walletCollection.findByIdAndUpdate({_id:walletData?._id},{$set:{walletBalance:walletNewAmount}})
            }
        }

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
        console.log(1)
       await cartValue.forEach(async data=>{
            await productModel.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:-data.productQuantity}})
            await productModel.findByIdAndUpdate({_id:data.productId._id},{$inc:{stockSold:data.productQuantity}})
            await categoryModel.updateOne({categoryName:data.productId?.parentCategory},{$inc:{stockSold:data.productQuantity}})
        })
        console.log(2)
            await cartModel.deleteMany({userId:req.session?.userData?._id});

        req.session.newGrandTotal = null;
        req.session.couponTotal = null;    

        return res.status(200).send({success:true})

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

        req.session.newGrandTotal = null;
        req.session.couponTotal = null;

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
        const wishlistDetails = await wishlistCollection.findOne({userId:req.session?.userData?._id})
        const wishlistCount = wishlistDetails?.wishlistProducts.length;
        const cartCount = await cartModel.find({userId:req.session?.userData?._id}).countDocuments();
        res.render("user/orderSuccess",{userData:req.session.userData,cartData,orderData,wishlistCount,cartCount})
    } catch (error) {
        console.error(`error while getting the getting the order success page \n ${error}`);
    }
}


const downloadInvoice = async (req,res)=>{
    try {
        let orderDetails = await orderModel
        .findOne({ _id: req.params.id })
        .populate("addressChosen");
    
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf",
      });
      generatevoice(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        orderDetails
      );
      console.log(generatevoice);
    } catch (error) {
        console.error(`error while downloading the invoice \n ${error}`);
    }
}





module.exports={
    orderData,
    getOrderSuccess,
    razorPayOrderSuccess,
    razorPayOrder,
    downloadInvoice
}