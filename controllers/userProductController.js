const productModel = require("../model/productModel.js");
const categoryModel = require("../model/categoryModel.js");

const getUserProduct=async (req,res)=>{
    try {
        let limit=4;
        let page=req.query.page;
        let skip=(page-1)*limit;
        let totalCount=await productModel.find().estimatedDocumentCount();
        let count=totalCount/limit;
        let productData=await productModel.find().skip(skip).limit(limit);
        // productData=await productModel.find()
        userData=req.session.userData
        console.log(productData);

        res.render("user/productList",{productData,userData,count})
    } catch (error) {
        console.error(`error while getting the user products \n ${error}`);
    }
}

const getSingleProduct= async (req,res)=>{
    try {
        const id=req.params.id
        const productData=await productModel.findById({_id:id})
        const parentCategory=productData.parentCategory
        // console.log(parentCategory)
        const relatedProductData=await productModel.find({parentCategory:parentCategory})
        console.log(relatedProductData)
        userData=req.session.userData
        res.render("user/singleProduct",{productData,userData,relatedProductData});
    } catch (error) {
        console.error(`error while getting the single product page \n ${error}`);
    }
}



module.exports={
    getUserProduct,
    getSingleProduct
}