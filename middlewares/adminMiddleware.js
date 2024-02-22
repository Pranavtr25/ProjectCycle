
const isAdminActive=async(req,res,next)=>{
    try {
        if(req.session.admin){
            next();
        } else{
            res.redirect("/adminLogin");
        }
    } catch (error) {
        console.error(`error while checking admin is active \n ${error}`);
    }
}

module.exports=isAdminActive;