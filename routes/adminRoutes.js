const express=require("express")
const router=express.Router();
const upload=require("../helper/multer")
const isAdminActive=require("../middlewares/adminMiddleware")

const {
    getAdminLogin,
    validateAdmin,
    getAdminHome,
    getUserManagement,
    blockUser,
    unBlockUser,
    adminLogout
}=require("../controllers/adminControllers")


const {

    getAdminCategory,
    addCategory,
    unListCategory,
    ListCategory,
    getEditCategory,
    editCategory,
    deleteCategory

}=require("../controllers/categoryControllers")


const {

    getProductList,
    getAddProduct,
    addProductData,
    getEditProduct,
    editProductData,
    deleteProduct,
    unListProduct,
    listProduct

}=require("../controllers/adminProductControllers")


const {
    getOrderList,
    updateOrderStatus,
    getSingleOrderDetail
} = require("../controllers/adminOrderController")


const {
    getCouponManagement,
    addCouponData,
    editCouponData,
    deleteCouponData,
} = require("../controllers/couponManagement")


const {
    getProductOfferList,
    productAddOfferData,
    productEditOfferData,
    getCategoryOfferList,
    categoryAddOfferData,
    categoryEditOfferData,
    editCategoryOfferStatus
} = require("../controllers/offerController")


const {
    getSalesReport
} = require("../controllers/salesReportController")


router.get("/adminLogin",getAdminLogin)

router.post("/adminValidate",validateAdmin)

router.get("/adminHome",isAdminActive,getAdminHome)

router.get("/userManagement",isAdminActive,getUserManagement)

router.post("/userManagement/block/:id",blockUser)

router.post("/userManagement/unBlock/:id",unBlockUser)


// ------------category--------------------

router.get("/adminCategory",isAdminActive,getAdminCategory)

router.post("/addCategory",addCategory)

router.post("/adminCategory/unList/:id",unListCategory)

router.post("/adminCategory/list/:id",ListCategory)

router.get("/editCategory/edit/:id",isAdminActive,getEditCategory)

router.post("/saveEditCategory/:id",editCategory)

router.get("/adminCategory/delete/:id",isAdminActive,deleteCategory)

router.get("/adminLogout",adminLogout)

// -----------------------------------products-------------------------


router.get("/productsList",isAdminActive,getProductList)

router.get("/addProduct",isAdminActive,getAddProduct)

router.post("/addProductData", upload.any(), addProductData)

router.get("/editProduct/:id",isAdminActive,getEditProduct);

router.post("/editProductData/:id",upload.any(),editProductData)

router.get("/deleteProduct/:id",isAdminActive,deleteProduct)

router.post("/productsList/unList/:id",unListProduct)

router.post("/productsList/list/:id",listProduct)


// ---------------------------------------------------orders---------------------------------------------

router.get("/orderList",isAdminActive,getOrderList)

router.get("/orderListStatus:id",isAdminActive,updateOrderStatus)

router.get("/singleOrder:id",isAdminActive,getSingleOrderDetail)


// -----------------------------------------------------coupon management--------------------------------

router.get("/couponManagement",isAdminActive,getCouponManagement)

router.post("/admin/couponManagement/addCoupon",isAdminActive,addCouponData)

router.put("/couponManagement/editCoupon/:id",isAdminActive,editCouponData)

router.delete("/couponManagement/deleteCoupon/:id",isAdminActive,deleteCouponData)


// ------------------------------------------------------offer management----------------------------------

router.get("/productOfferList",isAdminActive,getProductOfferList)

router.post("/productOfferManagement/addOffer",isAdminActive,productAddOfferData)

router.put("/productOfferManagement/editOffer/:id",isAdminActive,productEditOfferData)

router.get("/categoryOfferList",isAdminActive,getCategoryOfferList)

router.post("/categoryOfferList/addOffer",isAdminActive,categoryAddOfferData)

router.put("/categoryOfferList/editOffer",isAdminActive,categoryEditOfferData)

router.get("/categoryOfferStatus/:id",isAdminActive,editCategoryOfferStatus)


// ---------------------------------------------------------sales report----------------------------------------

router.get("/salesReport",isAdminActive,getSalesReport)


module.exports=router;