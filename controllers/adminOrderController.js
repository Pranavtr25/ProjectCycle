const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const { json } = require("body-parser");

const getOrderList = async (req,res)=>{
    try {
        const orderData = await orderModel.find().populate("userId")
        // console.log(orderData)
        res.render("admin/orderList",{orderData})
    } catch (error) {
        console.error(`error while getting the admin order list \n ${error}`);
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
    getSingleOrderDetail
}