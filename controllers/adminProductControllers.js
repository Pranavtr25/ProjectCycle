
const productModel = require("../model/productModel.js");
const categoryModel = require("../model/categoryModel.js");

const getProductList = async (req,res)=>{
    try {

        // let productData = await productModel.find()
        let categoryList = await categoryModel.find(
          {},
          { categoryName: true }
        );

        let count;
        let limit=4;
        let skip;
        let productData;
        let page=Number(req.query.page) || 1
        console.log(page);
        skip=(page-1)*limit
        let totalCount=await productModel.find().estimatedDocumentCount()
        count=totalCount/limit;
        productData=await productModel.find().skip(skip).limit(limit)
    
        res.render("admin/productList", {
          productData,
          categoryList,
          // productExist: req.session.productAlreadyExists,
          limit,
          count
        });
        req.session.productAlreadyExists = null;
    } catch (error) {
        console.log(`error while getting the product list page \n ${error}`);
    }
}

const getAddProduct= async (req,res)=>{
    try {
        const categories = await categoryModel.find({ isListed: true });
        req.session.productAlreadyExists;
        req.session.save()
        res.render("admin/addProduct",{categories,productAlreadyExists:req.session.productAlreadyExists});
        req.session.productAlreadyExists = null;
        req.session.save();
    } catch (error) {
        console.log(`error while getting the add product page \n ${error}`);
    }
   
}

const addProductData = async (req, res) => {

    try {
      let existingProduct = await productModel.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
         productName: req.body.productName,
      });
      if (!existingProduct) {
        await productModel.insertMany([
          {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage1: req.files[0].filename,
            productImage2: req.files[1].filename,
            productImage3: req.files[2].filename,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
            productDescription:req.body.productDescription,
            productHighlight:req.body.productHighlight
          },
        ]);
        res.redirect("/productsList");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/addProduct");
      }
    } catch (err) {
      console.log(err);
    }
};

const getEditProduct=async (req,res)=>{
    try {
    const productId = req.params.id;
    const productData = await productModel.findOne({ _id: productId });
    const categories = await categoryModel.find({});
    req.session.productAlreadyExists
    res.render("admin/editProduct", {
      productData,
      categories,
      productAlreadyExists:req.session.productAlreadyExists
    })
    req.session.productAlreadyExists=null;
    req.session.save()
    } catch (error) {
        console.error(`error while editing the product \n ${error}`);
    }
}

const editProductData=async (req,res)=>{
    try {
      let existingProduct = await productModel.findOne({
        productName: { $regex: new RegExp(`^${req.body.productName}$`, "i") },
    
      });
      if (!existingProduct || existingProduct._id == req.params.id) {
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
            productDescription:req.body.productDescription,
            productHighlight:req.body.productHighlight
          },
        };
  
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].filename;
        }
  
        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].filename;
        }
  
        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].filename;
        }
  
        await productModel.findOneAndUpdate(
          { _id: req.params.id },
          updateFields
        );  
        res.redirect("/productsList");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect(`/editProduct/${req.params.id}`)
        req.session.save();
      }
    } catch (error) {
        console.error(`error while posting the edited data , \n ${error}`)
    }
}

const deleteProduct=async (req,res)=>{
  try {
    await productModel.findOneAndDelete({_id:req.params.id});
    res.redirect("/productsList")
  } catch (error) {
    console.log(`error while deleting the data \n ${error}`);
  }
}

const unListProduct=async (req,res)=>{
  try {
    console.log("unlisting is working...")
      await productModel.findOneAndUpdate(
        {_id:req.params.id},
        {$set:{isListed:false}}
        )

        res.status(200).send({success:true})
  } catch (error) {
    res.status(500).send({success:false})
    console.error(`error while unlisting the product /n ${error}`);
  }
}

const listProduct=async (req,res)=>{
  try {
    await productModel.findOneAndUpdate(
      {_id:req.params.id},
      {$set:{isListed:true}}
    )
    res.status(200).send({success:true});
  } catch (error) {
    res.status(500).send({success:false});
    console.error(`error while listing the products \n ${error}`);
  }
}

module.exports={
    getProductList,
    getAddProduct,
    addProductData,
    getEditProduct,
    editProductData,
    deleteProduct,
    unListProduct,
    listProduct
} 