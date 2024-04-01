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
    getSingleProduct,
    productPriceRangeData,
    categoryFilterData,
    productSortData,
    clearProductFilters,
    searchFilter
}=require("../controllers/userProductController")


const {
    getCart,
    addToCart,
    deleteFromCart,
    incQty,
    decQty
}=require("../controllers/cartController")


const {
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
} = require("../controllers/profileController")


const {
    getCheckout,
    applyCoupon
}=require("../controllers/checkoutController")


const {
    orderData,
    razorPayOrder,
    razorPayOrderSuccess,
    getOrderSuccess,
    downloadInvoice
} = require("../controllers/orderManagementController")


const {
    getWishlist,
    addWishlistData,
    addToCartFromWishlist,
    deleteWishlistProduct
} = require("../controllers/wishlistControllers")



// ------------------------------------------------------signUp / signIn----------------------------------------------------------

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




// -----------------------------------------------------------products-------------------------------------

router.get("/userProducts",isUserBlock,isUserActive,getUserProduct)

router.get("/singleProduct:id",isUserBlock,isUserActive,getSingleProduct)

router.post("/productPriceRange",isUserBlock,isUserActive,productPriceRangeData)

router.get("/categoryFilter:id",isUserBlock,isUserActive,categoryFilterData)

router.post("/productSort",isUserBlock,isUserActive,productSortData)

router.get("/clearFilters",isUserBlock,isUserActive,clearProductFilters)

router.post("/search",isUserBlock,isUserActive,searchFilter)

// -------------------------------------------cart---------------------------


router.get("/cart",isUserBlock,isUserActive,getCart)

router.post("/cart/:id",isUserBlock,isUserActive,addToCart)

router.delete("/cart/delete/:id",isUserBlock,isUserActive,deleteFromCart)

router.put("/cart/increment",isUserBlock,isUserActive,incQty);

router.put("/cart/decrement",isUserBlock,isUserActive,decQty);


// ----------------------------------------------------profile----------------------------------------------------

router.get("/profile",isUserBlock,isUserActive,getProfile)

router.get("/addAddress",isUserBlock,isUserActive,getAddAddress)

router.post("/addAddressData",isUserBlock,isUserActive,addAddressData)

router.get("/myAddress",isUserBlock,isUserActive,getMyAddress)

router.get("/editAddress:id",isUserBlock,isUserActive,getEditAddress)

router.post("/editAddressData",isUserBlock,isUserActive,editAddressData)

router.get("/editProfile",isUserBlock,isUserActive,getEditProfile)

router.post("/editProfileData",isUserBlock,isUserActive,editProfileData)

router.delete("/deleteAddress:id",isUserBlock,isUserActive,deleteAddress)

router.get("/profileOTP",isUserBlock,isUserActive,getProfileOTP)

router.post("/profileOTPData:id",isUserBlock,isUserActive,profileOTPVerification)

router.get("/profileChangePassword",isUserBlock,isUserActive,getProfileChangePassword)

router.patch("/profileChangePasswordData",isUserBlock,isUserActive,profileChangePasswordData)

router.get("/profile/userOrders",isUserBlock,isUserActive,getuserOrders)

router.get("/profile/userSingleOrder:id",isUserBlock,isUserActive,getUserSingleOrder)

router.get("/profile/cancelReturnOrder:id",isUserBlock,isUserActive,cancelReturnOrder)


// -----------------------------------------------------------checkout-----------------------------------------------

router.get("/checkout",isUserBlock,isUserActive,getCheckout)

router.post("/applyCoupon",isUserBlock,isUserActive,applyCoupon)


// -----------------------------------------------------------order management---------------------------------------

router.post("/orderData",isUserBlock,isUserActive,orderData)

router.post("/razorPayOrder",isUserBlock,isUserActive,razorPayOrder)

router.all("/order/orderPlaced",isUserBlock,isUserActive,razorPayOrderSuccess)

router.get("/orderSuccess",isUserBlock,isUserActive,getOrderSuccess)

router.get("/downloadInvoice:id",isUserBlock,isUserActive,downloadInvoice)



// -------------------------------------------------------------wishlist----------------------------------------------


router.get("/wishlist",isUserBlock,isUserActive,getWishlist)

router.post("/addToWishlist:id",isUserBlock,isUserActive,addWishlistData)

router.post("/wishlist/addToCart:id",isUserBlock,isUserActive,addToCartFromWishlist)

router.delete("/wishlist/delete:id",isUserBlock,isUserActive,deleteWishlistProduct)

// -------------------------------------------------------------------------------------------------------------------
router.get("*/",getErrorPage)

module.exports=router