const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");

async function grandTotal(req) {
  try {
    // console.log("session" + req.session.userData);
    let userCartData = await cartModel
      .find({ userId: req.session.userData._id })
      .populate("productId");
    // console.log(Array.isArray(userCartData));
    let grandTotal = 0;
    for (const val of userCartData) {
      grandTotal += val.productId.productPrice * val.productQuantity;
      await cartModel.updateOne(
        { _id: val._id },
        {
          $set: {
            totalCostPerProduct: val.productId.productPrice * val.productQuantity,
          },
        }
      );
    }

    // console.log(grandTotal)
    userCartData = await cartModel
      .find({ userId: req.session.userData._id })
      .populate("productId");
    req.session.grandTotal = grandTotal;
    // console.log(userCartData)

    return JSON.parse(JSON.stringify(userCartData));
  } catch (error) {
    console.log(`error while checking the grand total \n ${error}`);
  }
}

const getCart = async (req, res) => {
  try {
    let userCartData = await grandTotal(req);
    res.render("user/cart",{
        userData:req.session.userData,
        userCartData,
        grandTotal:req.session.grandTotal
    });
  } catch (error) {
    console.error(`error while getting the cart page \n ${error}`);
  }
};

const addToCart = async (req, res) => {
//   console.log(req.session.userData);
  try {
    let existingProduct = await cartModel.findOne({
      userId: req.session.userData._id,
      productId: req.params.id,
    });
    // console.log("this is the existing product " , existingProduct)
    if (existingProduct) {
      console.log("product is already been added")
        console.log(existingProduct);
      await cartModel.updateOne(
        { _id: existingProduct._id },
        { $inc: { productQuantity: 1 } }
      );
      res.status(200).send({success:true})
    } else {
      await cartModel.insertMany([
        {
          userId: req.session.userData._id,
          productId: req.params.id,
          productQuantity: req.body.productQuantity,
          userData: req.session.userData,
          //   user: req.body.user
        },
      ]);
      res.status(200).send({success:true})
    }

    // console.log(categoryModel);

    //   console.log(req.body);
    // res.redirect("/cart");
    //   console.log("try part worked");
    // res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({success:false})

    // res.redirect('/loginpage')

    // console.error("Error in addToCart:", error);
    // res.status(500).send("Internal Server Error");
  }
};

const deleteFromCart = async (req, res) => {
    try {
      await cartModel.findOneAndDelete({ _id: req.params.id });
    //   res.send("hello ur cart is deleted");
        res.status(200).send({success:true})
    } catch (error) {
        console.error(error);
        res.status(500).send({success:false})
    }
};


const decQty = async (req, res) => {
    try {
        console.log("this is worked decqty")
      let cartProduct = await cartModel
        .findOne({ _id: req.body._id })
        .populate("productId");
      if (cartProduct.productQuantity > 1) {
        cartProduct.productQuantity--;
      }
      cartProduct = await cartProduct.save();
      await grandTotal(req);
      res.json({
        success: true,
        cartProduct,
        grandTotal: req.session.grandTotal,
        userData: req.session.userData,
      });
    } catch (error) {
      console.error(error);
    }
  };


  const incQty = async (req, res) => {
    try {
        console.log("incqty worked successfully")
      let cartProduct = await cartModel
        .findOne({ _id: req.body._id })
        .populate("productId");
      if (cartProduct.productQuantity < cartProduct.productId.productStock) {
        cartProduct.productQuantity++;
      }
      cartProduct = await cartProduct.save();
      await grandTotal(req);
      res.json({
        success: true,
        cartProduct,
        grandTotal: req.session.grandTotal,
        userData: req.session.userData,
      });
    } catch (error) {
      console.error(error);
    }
  };





module.exports = {
  getCart,
  addToCart,
  deleteFromCart,
  decQty,
  incQty,
  grandTotal
};
