const AddressModel = require("../model/addressModel")


const getProfile = (req,res)=>{
    try {
        userData=req.session.userData
        res.render("user/profile",{userData})
    } catch (error) {
        console.error(`error while getting the profile page \n ${error}`);
    }
}

const getAddAddress=(req,res)=>{
    try {
        res.render("user/addAddress")
    } catch (error) {
        console.error(`error while getting the getting the add address page \n ${error}`);
    }
}

module.exports = {
    getProfile,
    getAddAddress
}