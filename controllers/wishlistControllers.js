const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orderModel =require("../model/orderModel");
const wishlistCollection = require("../model/wishlistModel")
const {grandTotal}=require("../controllers/cartController");



const getWishlist = async (req,res)=>{
    try {
        const userData= req.session.userData;
        const wishlistData = await wishlistCollection.findOne({userId:userData._id}).populate("wishlistProducts.productId")
        console.log(wishlistData)
        // const cartProductData=await cartModel.findOne({userId:userData._id,productId:id})
        // const productQuantity= cartProductData?.productQuantity || 0
        res.render("user/wishlist",{wishlistData})
    } catch (error) {
        console.error(`error while getting the wishlist page \n ${error}`);
    }
}

const addWishlistData = async (req,res)=>{
    try {
        console.log(`addWishlistData : \n ${req.params.id}`);
        const id = req.params?.id
        const userData = req?.session?.userData
        const wishlistData = await wishlistCollection.findOne({userId:userData?._id});
        console.log(wishlistData)
        if(wishlistData){
            const wishlistProducts=wishlistData?.wishlistProducts;
            for(let i=0;i<wishlistProducts.length;i++){
                if(wishlistProducts[i].productId==id){
                    return res.status(200).send({success:true,wishlistAlreadyExist:true})
                }
            }
            await wishlistCollection.findByIdAndUpdate({_id:wishlistData?._id},{$push:{wishlistProducts:{productId:id}}})
        } else {
            const userWishlistData = {
                userId:userData._id,
                wishlistProducts:
                [
                    {productId:id}
                ]
            }
            await wishlistCollection(userWishlistData).save()
        }
        res.status(200).send({success:true,wishlistAlreadyExist:false})
            
    } catch (error) {
        res.status(501).send({success:false})
        console.error(`error while adding the wishlist data \n ${error}`);
    }
}

const addToCartFromWishlist = async (req,res)=>{
    try {
        console.log(`id fronm wishlist : ${req.params.id}`)
        const productId = req.params?.id
        const userId = req.session?.userData?._id;
        const cartData = await cartModel.findOne({userId:userId,productId:productId}).populate("productId")
        const productData = await productModel.findOne({_id:req.params?.id})
        if(cartData){
            console.log("cardata existttt")
            console.log(cartData.productQuantity)
            console.log(cartData.productId.productStock)
            if(cartData.productQuantity < cartData.productId.productStock){
                await cartModel.findByIdAndUpdate({_id:cartData?._id},{$inc:{productQuantity:1}});
                res.status(200).send({success:true})
            } else {
                res.status(501).send({success:false,stockExceeded:true})
            }
        } else {
            console.log("else part workeddd")
            const cartData = {
                userId:userId,
                productId:req.params.id,
                productQuantity:1,
                totalCostPerProduct:productData.productPrice
              }
              await cartModel(cartData).save()
            res.status(200).send({success:true})
        }
        console.log(cartData)
    } catch (error) {
        console.error(`error while adding to the cart from wishlist \n ${error}`);
        res.status(501).send({success:false})
    }
}

const deleteWishlistProduct = async (req,res)=>{
    try {
        console.log(req.params.id)
        const userId = req.session?.userData?._id
        const wishlistData = await wishlistCollection.findOne({userId})
        console.log(wishlistData)

//         userWhishlist.whishlist.forEach(async(val)=>{


    
//       if(val._id == req.body.id){

//       const userWhishList= await whishlistModel.updateOne({userId:userId},{$pull:{whishlist:{_id:req.body?.id}}})


//       }
     
//    })

        wishlistData.wishlistProducts.forEach(async (data)=>{
            if(data.productId==req.params.id){
                 await wishlistCollection.updateOne({userId:userId},{$pull:{wishlistProducts:{productId:req.params?.id}}})
            }
        })
        res.status(200).send({success:true})

        
    } catch (error) {
        res.status(501).send({success:false})
        console.error(`error while deleting the wishlist product \n ${error}`);
    }
}


module.exports = {
    getWishlist,
    addWishlistData,
    addToCartFromWishlist,
    deleteWishlistProduct
}