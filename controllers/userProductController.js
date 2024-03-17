const productModel = require("../model/productModel.js");
const categoryModel = require("../model/categoryModel.js");
const cartModel = require("../model/cartModel.js");

const getUserProduct=async (req,res)=>{
    try {
        let limit=4;

      
        let page=req.query.page || 1
        let skip=(page-1)*limit;

        // let productData=await productModel.find({isListed:true}).skip(skip).limit(limit);
        const maxVal=await productModel.aggregate([{$group:{_id:null,maxValue:{$max:"$productPrice"}}},{$project:{_id:0,maxValue:1}}])
        const minVal=await productModel.aggregate([{$group:{_id:null,minValue:{$min:"$productPrice"}}},{$project:{_id:0,minValue:1}}])

        const productGTE=req.session.productGTE || minVal[0].minValue; //if the user didnt gave any filter then the or condition should work and in that the min and max value will be fetched directly from the database
        const productLTE=req.session.productLTE || maxVal[0].maxValue;
    
        req.session.save()

        if( req.session.categoryFilterName){

            console.log(req.session.categoryFilterName)

            const minVal=await productModel.aggregate([
                {$match:{parentCategory:req.session.categoryFilterName}},
                {$group:{_id:null,minValue:{$min:"$productPrice"}}},
                {$project:{_id:0,minValue:1}}
            ])
            
            const maxVal = await productModel.aggregate([
                {$match:{parentCategory:req.session.categoryFilterName}},
                {$group:{_id:null,maxValue:{$max:"$productPrice"}}},
                {$project:{_id:0,maxValue:1}}
            ])  
            console.log(req.session.categoryFilterName)
            console.log(maxVal)
            console.log(minVal)
            // req.session.productLTE 

            const productGTE =  req.session?.productGTE || Number(minVal[0]?.minValue)
            const productLTE =  req.session?.productLTE || Number(maxVal[0]?.maxValue) 

            let categoryData=await categoryModel.find({isListed:true})

            const priceSelect=`${productGTE}-${productLTE}`
            console.log(priceSelect)
            let productData=await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE},parentCategory:req.session.categoryFilterName}).skip(skip).limit(limit) 
            
            let totalCount=await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE},parentCategory:req.session.categoryFilterName}).countDocuments();
            let count=totalCount/limit;
            console.log("/////////////////////////////////////////////////////////////////////")
            console.log(productData)
            console.log("/////////////////////////////////////////////////////////////////////")
            if(req.session.sortValue){
                productData = await priceSortWithCategorisedFilter(req,productGTE,productLTE,skip,limit)
                console.log("product dataaaaa: \n"+productData)
           }

           const categoryFilterName=req.session.categoryFilterName

           console.log(categoryFilterName)

            res.render("user/productList",{productData,userData,count,categoryData,priceSelect,categoryFilterName})


        }else{


        console.log(`[[[[[0]]]]]`)
        console.log( req.session.productGTE)
        console.log( req.session.productLTE)
        console.log(`[[[[[0]]]]]`)
        const priceSelect=`${productGTE}-${productLTE}`
        


        let productData=await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE}}).skip(skip).limit(limit)

        let totalCount=await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE}}).countDocuments();
        let count=totalCount/limit;
        let categoryData=await categoryModel.find({isListed:true})
        // console.log(`categoriesssss : \n ${categoryData}`)
        // productData=await productModel.find()
        userData=req.session.userData
        
        if(req.session.sortValue){
            productData = await priceSortWithoutCategorisedFilter(req,productGTE,productLTE,skip,limit)
        }
        console.log(productData);

        res.render("user/productList",{productData,userData,count,categoryData,priceSelect,categoryFilterName:false})

        }
              
    } catch (error) {
        console.error(`error while getting the user products \n ${error}`);
    }
}


async function priceSortWithoutCategorisedFilter(req,productGTE,productLTE,skip,limit){
    try {
        if(req.session.sortValue==="Low to High"){
            const sortData = await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE}}).sort({productPrice:1}).skip(skip).limit(limit)
            console.log(sortData)
            return sortData;
        }else if(req.session.sortValue==="High to Low"){
            const sortData = await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE}}).sort({productPrice:-1}).skip(skip).limit(limit)
            console.log(sortData)
            return sortData;
        }
    } catch (error) {
        console.error(`error while priceSortWithoutCategorisedFilter \n ${error}`);
    }
    
}

async function priceSortWithCategorisedFilter(req,productGTE,productLTE,skip,limit){
    try {
        if(req.session.sortValue==="Low to High"){
            const sortData = await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE},parentCategory:req.session.categoryFilterName}).sort({productPrice:1}).skip(skip).limit(limit)
            return sortData;
        }else if(req.session.sortValue==="High to Low"){
            const sortData = await productModel.find({isListed:true,productPrice:{$gte:productGTE,$lte:productLTE},parentCategory:req.session.categoryFilterName}).sort({productPrice:-1}).skip(skip).limit(limit)    
            return sortData;
        }
    } catch (error) {
        console.error(`error while priceSortWithCategorisedFilter \n ${error}`);
    }
}



const productPriceRangeData = async (req,res)=>{
    try {
        const priceRange=req.body.priceRange.split("-")
        console.log('*******');
        console.log(priceRange);
        console.log('*******');
        
        req.session.productLTE=priceRange[1]
        req.session.productGTE=priceRange[0]
        console.log(req.session.productLTE)
        console.log(req.session.productGTE)
        req.session.save()
        console.log(req.body);
        res.status(200).send({success:true})
    } catch (error) {
        console.error(`error while getting the productPriceRangeData \n ${error}`);
        res.status(501).send({success:false})
    }
}

const categoryFilterData = async (req,res)=>{
    try {
        console.log(req.params.id)
        console.log(`[[[[[]]]]]`)
        console.log( req.session.productGTE)
        console.log( req.session.productLTE)
        console.log(`[[[[[]]]]]`)

        req.session.categoryFilterName=req.params.id;
        const minVal=await productModel.aggregate([
            {$match:{parentCategory:req.params.id}},
            {$group:{_id:null,minValue:{$min:"$productPrice"}}},
            {$project:{_id:0,minValue:1}}
        ])
        
        const maxVal = await productModel.aggregate([
            {$match:{parentCategory:req.params.id}},
            {$group:{_id:null,maxValue:{$max:"$productPrice"}}},
            {$project:{_id:0,maxValue:1}}
        ])
        req.session.productGTE =  req.session?.productGTE || minVal[0]?.minValue
        req.session.productLTE =  req.session?.productLTE || maxVal[0]?.maxValue
        console.log(`[[[[[]]]]]`)
        console.log( req.session.productGTE)
        console.log( req.session.productLTE)
        console.log(`[[[[[]]]]]`)
        res.redirect("/userProducts")
        
    } catch (error) {
        console.error(`error while doing the category filter data \n ${error}`);
    }
}


const productSortData = (req,res)=>{
    try {
        console.log(req.body)
        if(req.body.sortValue==="Sort"){
            req.session.sortValue = null;
        }else{
            req.session.sortValue=req.body.sortValue
        }
        res.status(200).send({success:true})
        
    } catch (error) {
        console.error(`error while getting the product sort data \n ${error}`);
        res.status(501).send({success:false})
    }
}


const getSingleProduct= async (req,res)=>{
    try {
        const id=req.params.id
        const productData=await productModel.findById({_id:id})
        const parentCategory=productData.parentCategory
        // console.log(parentCategory)

        
        const relatedProductData=await productModel.find({parentCategory:parentCategory})


        userData=req.session.userData
        const cartProductData=await cartModel.findOne({userId:userData._id,productId:id})
        const productQuantity= cartProductData?.productQuantity || 0
        console.log(productQuantity)
        console.log(cartProductData)
    
        res.render("user/singleProduct",{productData,userData,relatedProductData,productQuantity});
    } catch (error) {
        console.error(`error while getting the single product page \n ${error}`);
    }
}

const clearProductFilters = async (req,res)=>{
    try {
        console.log("this clear workeddddd")
        req.session.categoryFilterName=null;
        req.session.sortValue=null;
        req.session.productLTE=null;
        req.session.productGTE=null;
        req.session.save();
        res.redirect("/userProducts")
    } catch (error) {
        console.error(`error while clearing the product filters \n ${error}`);
    }
}


module.exports={
    getUserProduct,
    getSingleProduct,
    productPriceRangeData,
    categoryFilterData,
    productSortData,
    clearProductFilters
}