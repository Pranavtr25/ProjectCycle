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
    getSingleOrderDetail
} = require("../controllers/adminOrderController")




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

router.get("/singleOrder:id",isAdminActive,getSingleOrderDetail)




module.exports=router;