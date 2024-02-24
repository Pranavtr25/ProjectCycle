
const isUserActive=async (req,res,next)=>{
    try {
        if(req.session.userData){
            next();
        }else{
            res.redirect("/signup")
        }
    } catch (error) {
        console.error(`error while checking user is active \n ${error}`);
    }
}

const isUserBlock=async (req,res,next)=>{
    try {
        const blocked = req.session?.userData
        if(blocked?.block){
            req.session.userData = null
            res.redirect("/signup")
        }else{
            next();
        }
    } catch (error) {
        console.error(`error while checking user is block \n ${error}`);
    }
}




module.exports={
    isUserActive,
    isUserBlock
};