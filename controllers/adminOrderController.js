const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const { json } = require("body-parser");

const getOrderList = async (req,res)=>{
    try {
        let count;
        let limit=4;
        let skip;
        let orderData;
        let page=Number(req.query.page) || 1
        console.log(page);
        skip=(page-1)*limit
        let totalCount=await orderModel.find().estimatedDocumentCount()
        count=totalCount/limit;
        // productData=await productModel.find().skip(skip).limit(limit)
        orderData = await orderModel.find().sort({ orderNumber: -1 }).populate("userId").skip(skip).limit(limit)
        console.log(orderData)
        res.render("admin/orderList",{orderData,limit,count})
    } catch (error) {
        console.error(`error while getting the admin order list \n ${error}`);
    }
}

const updateOrderStatus = async (req,res)=>{
    try {
        const id = req.params.id
        console.log(id)
        const orderId = id.slice(1);
        const statusCode = id[0]
        console.log(orderId)
        console.log(statusCode)
        if(statusCode==="P"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Pending"}})
        }else if(statusCode==="S"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Shipped"}})
        }else if(statusCode==="D"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Delivered"}})
        }else if(statusCode==="R"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Returned"}})
        }else if(statusCode==="C"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Cancelled"}})
        }
        res.redirect("/orderList");
    } catch (error) {
        console.error(`error while updating the order status in admin side \n ${error}`);
    }
}

const getSingleOrderDetail = async (req,res)=>{
    try {
        console.log(`user id: ${req.params.id}`)
        const orderData = await orderModel.findOne({orderNumber:req.params.id}).populate("userId").populate("addressChosen")
        console.log(`---------------------------------------`)
        console.log(orderData)
        console.log(`---------------------------------------`)
        res.render("admin/singleOrderDetail",{orderData})
    } catch (error) {
        console.error(`error while getting the single order details page \n ${error}`);
    }
}

module.exports = {
    getOrderList,
    updateOrderStatus,
    getSingleOrderDetail
}