const nodemailer = require("nodemailer");
const usermodel = require("../model/userModel");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const walletCollection = require("../model/walletModel") 
const wishlistCollection = require("../model/wishlistModel")
const cartModel = require("../model/cartModel")

const getLandingPage = async (req, res) => {
  try {
  
    req.session.userData
    req.session.save();
    const wishlistDetails = await wishlistCollection.findOne({userId:req.session?.userData?._id})
    const wishlistCount = wishlistDetails?.wishlistProducts.length;
    const cartCount = await cartModel.find({userId:req.session?.userData?._id}).countDocuments();
    res.render("user/landing", { userData: req.session.userData,wishlistCount,cartCount});
  } catch (error) {
    console.log(`error while getting the landing page \n ${error}`);
  }
};

const getErrorPage=async(req,res)=>{
  try {
    req.session.userData;
    const wishlistDetails = await wishlistCollection.findOne({userId:req.session?.userData?._id})
    const wishlistCount = wishlistDetails?.wishlistProducts.length;   
    const cartCount = await cartModel.find({userId:req.session?.userData?._id}).countDocuments();
    res.render("user/404",{userData:req.session.userData,wishlistCount,cartCount})
  } catch (error) {
    console.error(`error while getting the error page \n ${error}`);
  }
}

const loginVerification = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let userData = await usermodel.findOne({email:email})
    console.log(userData)
    req.session.userData=userData;

    if(userData){
      const passCompare = await bcrypt.compare(password,userData.password)
      console.log(passCompare)
      if(passCompare){
        console.log("anything...")
        res.status(200).send({success:true})
      }else{
        console.log("this is elseee")
        req.session.userData = false;
        req.session.invalidLoginDetails=true;
        req.session.save();
        res.status(500).send({success:false})
      }
    }else{
      req.session.invalidLoginDetails=true;
      res.status(500).send({success:false})
    }
  } catch (error) {
    console.log(`error while login verification \n ${error}`);
  }
};

const getSignupPage = async (req, res) => {
  try {
    if(req.session.userData){
      res.redirect("/")
    }else{
      const referralCode = req.query.referralCode;
      if(referralCode){
        req.session.referralCode=referralCode;
      }
      req.session.emailExist;
      req.session.invalidLoginDetails;
      req.session.userData;
      res.render("user/signup", {
         emailExist: req.session.emailExist,
         isBlock:req.session.isBlock,
         invalidLoginDetails:req.session.invalidLoginDetails,
         userData:req.session.userData
        });
        
    }
    req.session.emailExist = false;
    req.session.invalidLoginDetails=false;
    req.session.save();
  } catch (err) {
    console.log(`err from registerPage\n ${err}`);
  }
};


const getSignupData = async (req, res) => {
  console.log(req.body);
  try {
    const emailExist = await usermodel.findOne({
      email: req.body.email,
    });

    if (!emailExist) {
      const pass = await bcrypt.hash(req.body.password, 10);

      const userData = {
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        password: pass,
      };
      const OTP = await emailOTPGenerate(req.body.email);
      req.session.otp = OTP;
      req.session.userData = userData;
      req.session.getOTPPage=true;

      res.status(200).send({ success: true });
    } else {
      req.session.emailExist = true;
      res.status(500).send({ success: false });
    }
  } catch (error) {
    console.log(`error in signup ${error}`);
  }
};

const getOTPPage = async (req, res) => {
  try {
    if(req.session.getOTPPage){
      req.session.isWrongOTP;
      res.render("user/signupOTP", { isWrongOTP: req.session.isWrongOTP });
    }
  } catch (error) {
    console.log(`error while getting the OTP page \n ${error}`);
  }
};

const addUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error while adding the user \n ${error}`);
  }
  res.redirect("/");
};

const emailOTPGenerate = async (email) => {
  try {
    const Email = email;
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "pranavtr25@gmail.com",
        pass: "efsu ppor vmiu qbqm",
      },
    });
    const OTP = Math.floor(100000 + Math.random() * 900000);

    const OTPDetails = {
      from: "pranavtr25@gmail.com",
      to: Email,
      subject: "OTP verification",
      text: `Your OTP is ${OTP}`,
    };
    console.log(`genOtp : ${OTP}`);
    let mail = await transport.sendMail(OTPDetails);
    return OTP;
  } catch (error) {
    console.log(`error while sending the OTP \n ${error}`);
  }
};

async function referralCodeGenerate(){
  try {
    const referralCode = Math.random().toString(36).substring(2,7);
    const existingReferral = await usermodel.findOne({referralCode:referralCode})
    if(existingReferral){
      referralCodeGenerate();
    }
    return referralCode;
  } catch (error) {
    console.error(`error while generating the referrral code \n ${error} `);
  }
}

const signupOTPVerification = async (req, res) => {
  try {
    const userOTP = Number(req.params.OTP);
    const genOTP = req.session.otp;

    if (userOTP === genOTP) {
      const userData = req.session.userData;
      const referralCodeGEN = await referralCodeGenerate();
      userData.referralCode = referralCodeGEN;
      console.log(userData);
      if(req.session?.referralCode){
        const userReferral = await usermodel.findOne({referralCode:req.session?.referralCode})
        console.log(`==========--------------user referrral daatassssss : ${userReferral}`)
        if(userReferral){
           await walletCollection.updateOne({userId:userReferral._id},{$inc:{walletBalance:500}})
            const saveWallet = {
                transactionAmount : 500,
                transactionType : "Referral",
                message : "Referral Bonus"
            }
            const walletData = await walletCollection.findOne({userId:userReferral._id})    
            const pushOrder = await walletCollection.findByIdAndUpdate({_id:walletData?._id},{$push:{walletCreditTransaction:saveWallet}})
        }
        req.session.referralCode=null
      }
      console.log(`--------------referralcode-----------${req.session.referralCode}`)
      // const {userName,phoneNumber,}
      console.log(`referralCode...................${referralCodeGEN}`)
      const userDetails = await new usermodel(userData).save();
      console.log(`userDetails  ------------------------${userDetails}`)
      req.session.userData._id=userDetails?._id
      // console.log(`userDetails.... ${userDetails}`)
      await new walletCollection({userId:userDetails?._id}).save()
      console.log("data saved successfully");
      req.session.userExist = {
        isActive: true,
        userName: userData.userName,
      };
      // req.session.userData = null;
      req.session.getOTPPage=false;
      res.status(200).send({ success: true });
    } else {
      // req.session.invalidsignupOTP=true;
      // req.session.save();
      res.status(500).send({ success: false });
    }
  } catch (error) {
    console.log(`error while verifying the otp \n ${error}`);
  }
};

const resendOTP=async (req,res)=>{
  try {
    const {email}=req.session.userData
    const genResendOTP=await emailOTPGenerate(email);
  } catch (error) {
    console.error(`error while resending the OTP \n ${error}`);
  }
}

const getForgotPassword=async (req,res)=>{
  try {
    req.session.invalidEmail;
    req.session.save()
    res.render("user/forgotPassword",{invalidEmail:req.session.invalidEmail})
  } catch (error) {
    console.error(`error while getting the forgot password page \n ${error}`);
  }
}

const getForgotPasswordOTP=async (req,res)=>{
  try {
    console.log(req.session.otp);
    req.session.invalidForgotOTP;
    req.session.save();
    res.render("user/forgotPasswordOTP",{invalidForgotOTP:req.session.invalidForgotOTP,genOTP:req.session.otp})
    req.session.invalidForgotOTP=null;
    req.session.save();
  } catch (error) {
    console.error(`error while getting the forget OTP page \n ${error}`);
  }
}

const getChangePassword= (req,res)=>{
  try {
    res.render("user/changePassword")
  } catch (error) {
    console.error(`error while changing the password \n ${error}`);
  }
}

const isEmailExist=async (req,res)=>{
  try {
        console.log(req.params.id)
        const existEmail = req.params.id
        const userData = await usermodel.findOne({email:existEmail})

      if(userData){
        req.session.userData = userData
        const forgotOTP=await emailOTPGenerate(existEmail)
        req.session.otp = forgotOTP
        req.session.save()
        res.status(200).send({success:true})

      }else{

        req.session.invalidEmail = true;
        invalidEmail = req.session.invalidEmail;
        res.status(500).send({success:false,invalidEmail})
      }
  } catch (error) {
    console.error(`error while verifying the email \n ${error}`);
  }
}

const forgotResendOTP=async (req,res)=>{
  try {
    // console.log(req.session.userData)
    const userData=req.session.userData
    const email=userData.email
    const resendOTP=await emailOTPGenerate(email)
    req.session.otp=resendOTP;
    res.redirect("/forgotPasswordOTP")
  } catch (error) {
    console.error(`error while resending the otp for forget page \n ${error}`);
  }
}


const signupResendOTP=async (req,res)=>{
  try {
    // console.log(req.session.userData);
    const userData=req.session.userData
    const email=userData.email
    const resendOTP=await emailOTPGenerate(email)
    req.session.otp=resendOTP;
    res.redirect("/otp")
  } catch (error) {
    console.error(`error while resending the otp for signup \n ${error}`);
  }
}

const forgotOTPVerification=async (req,res)=>{
  try {
    const userOTP=Number(req.params.id);
    console.log(userOTP)
    const genOTP=req.session.otp;
    console.log(genOTP)
    if(userOTP===genOTP){
      res.status(200).send({success:true})
    }else{
      req.session.invalidForgotOTP=true;
      req.session.save();
      res.status(500).send({success:false})
    }
  } catch (error) {
    console.error(`error while verifying the user otp with generated otp \n ${error}`);
  }
}

const updatePassword=async (req,res)=>{
  try {
    const password=req.params.id
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    const userData=req.session.userData;
    const {_id} =userData
    console.log(userData);
    await usermodel.findByIdAndUpdate(
      {_id},
      {$set:{password:hashedPassword}}
    )
    res.status(200).send({success:true})
  } catch (error) {
    res.status(500).send({success:false})
    console.error(`error while updating the password \n ${error}`);
  }
}

const userLogout=async (req,res)=>{
  try {
    req.session.userData = null
    res.redirect("/signup")
  } catch (error) {
    console.error(`error while user logout`);
  }
}


module.exports = {
  getLandingPage,
  loginVerification,
  getSignupData,
  emailOTPGenerate,
  getSignupPage,
  getOTPPage,
  signupOTPVerification,
  signupResendOTP,
  getForgotPassword,
  getForgotPasswordOTP,
  getChangePassword,
  isEmailExist,
  forgotResendOTP,
  forgotOTPVerification,
  updatePassword,
  getErrorPage,
  userLogout
};
