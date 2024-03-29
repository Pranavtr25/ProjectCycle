const mongoose= require('mongoose')

const productSchema= new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    parentCategory:{
        type: String,
        required: true
    },
    productImage1:{
        type: String,
    },
    productImage2:{
        type: String,
    },
    productImage3:{
        type: String,
    },
    productPrice:{
        type: Number,
        required: true
    },
    productStock: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    stockSold: {
        type: Number,
        default: 0
    },
    productDescription:{
        type:String,
        required:true
    },
    productHighlight:{
        type:String,
        required:true
    },


    
    productOfferId:
    { 
        type: mongoose.Types.ObjectId,
         default: null 
    },
    productOfferPercentage:
    { 
        type: Number,
         default: null 
    },
    priceBeforeOffer: 
    { 
        type: Number,
         default: null 
    },
    productafterOfferPrice: 
    { 
        type: Number,
        default: null 
    }
})

const productModel= mongoose.model('products',productSchema)

module.exports= productModel