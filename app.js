const express=require("express");
const app=express();
const path=require("path")
const dotenv=require("dotenv")
const userRouter=require("./routes/userRoutes")
const adminRouter=require("./routes/adminRoutes")
const connectDB=require("./config/connectDB")
const session=require("express-session")
const nocache = require("nocache");
const bodyParser=require("body-parser");


dotenv.config();
connectDB();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(nocache());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "passkey123",
  })
);
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use(adminRouter);
app.use(userRouter);
const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})
