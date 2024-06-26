const mongoose= require('mongoose')

const categorySchema= new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryDescription:{
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    stockSold: {
        type: Number,
        default: 0
    }
})

const categoryModel  = mongoose.model('categories',categorySchema)

module.exports= categoryModel;