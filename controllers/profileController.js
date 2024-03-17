const AddressModel = require("../model/addressModel")
const userModel=require("../model/userModel")
const {emailOTPGenerate}=require("../controllers/userControllers")
const bcrypt = require("bcrypt");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");


const getProfile = async (req,res)=>{
    try {
        userData=await userModel.findById({_id:req.session?.userData?._id})
        res.render("user/profile",{userData})
    } catch (error) {
        console.error(`error while getting the profile page \n ${error}`);
    }
}

const getEditProfile=async (req,res)=>{
    try {
        res.render("user/editProfile")
    } catch (error) {
        console.error(`error while getting the edit profile page \n ${error}`);
    }
}

const editProfileData = async (req,res)=>{
    try {
        const userData=await userModel.findById({_id:req.session.userData._id})
        console.log(`this is the new userdata \n ${userData}`)
        const {userName,email,phoneNumber} = req.body
        if(email === userData.email){ 
            console.log("this is workingggg.")         
           await userModel.updateOne(
                {email:email},
                {$set:{
                    userName:userName,
                    phoneNumber:phoneNumber,
                    email:email
                }}
            )
            res.status(200).send({success:true,generateOTP:false})
        } else{
            const emailExists = await userModel.findOne({email:email})
            if(!emailExists){         
             const profileEditOTP = await emailOTPGenerate(email)
             req.session.profileEditEmail = req.body
             req.session.profileEditOTP = profileEditOTP
             req.session.save()
             res.status(200).send({success:true,generateOTP:true})            
            }
            // res.status(501).send({success:false})
         }
    } catch (error) {
        console.error(`error while editing the data \n ${error}`);
        res.status(501).send({success:false})
    }
}

const getAddAddress= async (req,res)=>{
    try {
        res.render("user/addAddress")
    } catch (error) {
        console.error(`error while getting the getting the add address page \n ${error}`);
    }
}

const addAddressData = async (req,res)=>{
    try {
        const id=req.session.userData._id
        const data={
            user_id:id,
            name:req.body.name,
            phoneNumber:req.body.phoneNumber,
            houseNumber:req.body.houseNumber,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode
        }
        await AddressModel.create(data)
        res.status(200).send({success:true})
    } catch (error) {
        console.error(`error while saving the address data \n ${error}`);
        res.status(200).send({success:true})
    }
}

const getEditAddress = async (req,res)=>{
    try {
        const addressId=req.params.id;
        const addressData = await AddressModel.findById({_id:addressId})
        console.log(addressData)
        res.render("user/editAddress",{addressData})
    } catch (error) {
        console.error(`error while getting the edit address page \n ${error}`);
    }
}

const editAddressData = async (req,res)=>{
    try {
        const {
            id,
            name,
            phoneNumber,
            houseNumber,
            city,
            state,
            pincode
        } = req.body;

        await AddressModel.findByIdAndUpdate({_id:id},{$set:{name,phoneNumber,houseNumber,city,state,pincode}})
        res.status(200).send({success:true})
    } catch (error) {
        console.error(`error while saving the edited address data \n ${error}`);
        res.status(501).send({success:false})
    }
}

const deleteAddress = async (req,res)=>{
    try {
        console.log("req.params in deleteaddress = "+req.params.id)
        await AddressModel.findByIdAndDelete({_id:req.params.id})
        res.status(200).send({success:true})
    } catch (error) {
        console.error(`error while deleting the address \n ${error}`);
        res.status(501).send({success:false})
    }
}

const getMyAddress=async (req,res)=>{
    try {
        const userData=req.session.userData
        const addressData=await AddressModel.find({user_id:userData._id})
        console.log(`addressdata is \n ${addressData}`)
        res.render("user/myAddress",{addressData})
    } catch (error) {
        console.error(`error while getting the my address page \n ${error}`);
    }
}

const getProfileOTP = async (req,res)=>{
    try {
        req.session.isWrongProfileOTP
        res.render("user/profileOTPVerify",{isWrongProfileOTP:req.session.isWrongProfileOTP})
        req.session.isWrongProfileOTP=false;
    } catch (error) {
        console.error(`error while getting the profile otp page \n ${error}`);
    }
}

const profileOTPVerification = async (req,res)=>{
    try {
        const genOTP=req.session.profileEditOTP;
        const userOTP=Number(req.params.id);

        if(userOTP ===  genOTP){
            let user = req.session.profileEditEmail 
            console.log( req.session.profileEditEmail)
            let userData = req.session.userData 
            await userModel.findByIdAndUpdate(
                {_id:userData._id},
                {
                    $set:{
                        userName:user.userName,
                        phoneNumber:user.phoneNumber,
                        email:user.email
                }})
           
            res.status(200).send({success:true})

        }else{
            res.status(500).send({success:false})
        }
    } catch (error) {
        console.error(`error while verifying the otp \n ${error}`);
        res.status(500).send({success:false})
    }
}

const getProfileChangePassword= async (req,res)=>{
    try {
        res.render("user/profileChangePassword")
    } catch (error) {
        console.error(`error while getting profile change password \n ${error}`);
    }
}

const profileChangePasswordData = async (req,res)=>{
    try {
        console.log(req.body)
        const oldPassword=req.body.oldPassword;
        const newPassword=req.body.newPassword
        // console.log(Number(req.body.oldPassword))
        const userData=await userModel.findById({_id:req.session.userData._id})
        // console.log(userData);
        const samePassword = await bcrypt.compare(newPassword,userData.password)
        const passCompare = await bcrypt.compare(oldPassword,userData.password)
        if(!passCompare){
            res.status(501).send({success:false})
        }else if(samePassword){
            res.status(501).send({same:true})
        }else if(passCompare){
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userModel.findByIdAndUpdate({_id:userData._id},{password:hashedPassword})
            res.status(200).send({success:true})
        }
    } catch (error) {
        res.status(501).send({success:false})
        console.error(`error while changing the password for the user /n ${error} `);
    }
}


const getuserOrders = async (req,res)=>{
    try {
        let count;
        let limit=4;
        let skip;
        let orderData;
        let page=Number(req.query.page) || 1
        skip=(page-1)*limit
        let totalCount=await orderModel.find().estimatedDocumentCount()
        count=totalCount/limit;
        orderData= await orderModel.find({userId:req.session?.userData?._id}).skip(skip).limit(limit)
        console.log("............................................................................")
        console.log(orderData)
        console.log("............................................................................")
        res.render("user/userOrdersList",{orderData,limit,count})
    } catch (error) {
        console.error(`error while getting the user order list \n ${error}`);
    }
}

const getUserSingleOrder = async (req,res)=>{
    try {
        console.log(`user id: ${req.params.id}`)
        const orderData = await orderModel.findById({_id:req.params.id}).populate("userId").populate("addressChosen")
        console.log(`---------------------------------------`)
        console.log(orderData)
        console.log(`---------------------------------------`)
        res.render("user/userSingleOrder",{orderData})
    } catch (error) {
        console.error(`error while getting the user single order page \n ${error}`);
    }
}

const cancelReturnOrder = async (req,res)=>{
    try {
        console.log(req.params.id)
        const id=req.params.id
        const orderId = id.slice(1);
        const statusCode = id[0]
        const orderData = await orderModel.findById({_id:orderId})
        console.log(`orderrrrrrrrrrrrrr: ${orderData}`)
        console.log(orderId)
        console.log(statusCode)
        if(statusCode==="C"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Cancelled"}})
        }else if(statusCode==="R"){
            await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Returned"}})
        }

        orderData.cartData.forEach(async data => {
            await productModel.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:data.productQuantity}})
        });

        res.redirect("/profile/userOrders")
    } catch (error) {
        console.error(`error while cancelling / returning the order \n ${error}`);
    }
}

module.exports = {
    getProfile,
    getAddAddress,
    addAddressData,
    getMyAddress,
    getEditProfile,
    editProfileData,
    getProfileOTP,
    profileOTPVerification,
    getProfileChangePassword,
    profileChangePasswordData,
    getEditAddress,
    editAddressData,
    deleteAddress,
    getuserOrders,
    getUserSingleOrder,
    cancelReturnOrder
}