
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

        console.log('req reched isUserBlock ')
        if(req.session?.userData?.block){
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