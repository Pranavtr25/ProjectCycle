const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");

const getAdminCategory = async (req, res) => {
  try {
    console.log("admin category page reached");
    // let categoryData = await categoryModel.find();
    let limit=3;
    let totalCount=await categoryModel.find().estimatedDocumentCount();
    let count=totalCount/limit;
    let page=req.query.page;
    let skip=(page-1)*limit;
    let categoryData=await categoryModel.find().skip(skip).limit(limit);
    req.session.categoryExists;
    res.render("admin/Category", {
      categoryData,
      count,
      categoryExists: req.session.categoryExists
    });
    req.session.categoryExists = null;
    req.session.save()
  } catch (error) {
    console.log(`error while getting the admin category \n ${error}`);
  }
};

const addCategory = async (req, res) => {
  
  try {
    let categoryName = req.body.categoryName;
    let categoryExists = await categoryModel.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });
    console.log(categoryExists);
    console.log(req.body);
    if (!categoryExists) {
      new categoryModel({
        categoryName: req.body.categoryName,
        categoryDescription: req.body.categoryDescription,
      }).save();
      console.log("Added category");
      res.redirect("/adminCategory");
    } else {
      console.log("category already exists !");

      req.session.categoryExists = categoryExists;
      res.redirect("/adminCategory");
    }
  } catch (error) {
    console.log(`error while adding the category \n ${error}`);
  }
};

const unListCategory = async (req, res) => {
  try {
    console.log(req.params.id);
    await categoryModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isListed: false } }
    );
    res.status(200).send({success:true})
  } catch (error) {
    res.status(500).send({success:false})
    console.log(`error while unlisting the category \n ${error}`);
  }
};

const ListCategory = async (req, res) => {
  try {
    console.log(req.params.id);
    await categoryModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isListed: true } }
    );
    res.status(200).send({success:true})
  } catch (error) {
    res.status(500).send({sucess:false})
    console.log(`error while listing the category \n ${error}`);
  }
};

const getEditCategory = async (req, res) => {
  try {
    let categoryData = await categoryModel.findOne({ _id: req.params.id });
    console.log("categeries exit")
    req.session.categoryAlreadyExists;
    req.session.save()
    res.render("admin/editCategory", { categoryData: categoryData ,categoryAlreadyExists:req.session.categoryAlreadyExists});
    req.session.categoryAlreadyExists = false
    req.session.save()
  } catch (error) {
    console.log(`error while getting the edit category page \n ${error}`);
  }
};

const editCategory = async (req, res) => {
 
  try {
    let existingCategory = await categoryModel.findOne({
      categoryName: { $regex: new RegExp(`^${req.body.categoriesName}$`) },
    });
    console.log(existingCategory);
    if(!existingCategory){
      await categoryModel.findByIdAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            categoryName: req.body.categoriesName,
            categoryDescription: req.body.categoriesDescription,
          },
        }
      );
      res.redirect("/adminCategory");
    }else{
      req.session.categoryAlreadyExists = existingCategory
      res.redirect(`/editCategory/edit/${req.params.id}`)
      req.session.save()
    }
    
  } catch (error) {
    console.log(`error while editing the category details \n ${error}`);
  }
};

const deleteCategory = async (req, res) => {
  try {
    console.log(req.params.id);
    await categoryModel.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/adminCategory");
  } catch (error) {
    console.error(`error while deleting the category \n ${error}`);
  }
};


module.exports = {
  getAdminCategory,
  addCategory,
  unListCategory,
  ListCategory,
  getEditCategory,
  editCategory,
  deleteCategory,
};
