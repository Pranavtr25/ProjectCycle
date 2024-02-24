const express=require("express");
const {
    isUserActive,
    isUserBlock
}=require("../middlewares/userMiddleware")

const router=express.Router();
const {
    getLandingPage,
    loginVerification,
    getSignupData,
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
}=require("../controllers/userControllers")


const {
    getUserProduct,
    getSingleProduct
}=require("../controllers/userProductController")

router.get("/",isUserBlock,getLandingPage)

router.get("/signup",isUserBlock,getSignupPage)

router.post("/signupData",getSignupData)

router.get("/otp",getOTPPage)

router.post("/login",isUserBlock,loginVerification)

router.post("/signupOTPVerify:OTP",signupOTPVerification)

router.get("/signupResendOTP",signupResendOTP)

router.get("/forgotPassword",getForgotPassword)

router.get("/forgotPasswordOTP",getForgotPasswordOTP)

router.get("/changePassword",getChangePassword)

router.post("/forgotPasswordEmailVerify:id",isEmailExist)

router.get("/forgotResendOTP",forgotResendOTP)

router.post("/forgotOTPVerify:id",forgotOTPVerification)

router.post("/updatePassword:id",updatePassword)

router.get("/userLogout",userLogout)



// -----------------------------------------------------------

router.get("/userProducts",isUserBlock,isUserActive,getUserProduct)

router.get("/singleProduct:id",isUserBlock,isUserActive,getSingleProduct)





router.get("*/",getErrorPage)

module.exports=router