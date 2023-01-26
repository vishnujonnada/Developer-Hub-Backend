const express = require("express");
const mongoose = require("mongoose");
const devuser = require("./devusermodel");
const jwt=require('jsonwebtoken');
const middleware=require('./middleware');
const reviewmodel=require('./reviewmodel');
const cors=require('cors')



mongoose.set('strictQuery', false);



const app = express();

mongoose.connect(
  "mongodb://127.0.0.1:27017/myapp",
 {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
 }).then(
    ()=>console.log("DB connected")
 )


app.use(express.json())
app.use(cors({origin:'*'}))


app.get("/", (req, res) => {
  return res.send("<h1>Developer HUb</h1>");
});

app.post('/register',async(req,res)=>{
    try{

        const {fullname,email,mobile,skill,password,confirmpassword}=req.body;
        const exist = await devuser.findOne({email});
        if(exist){
            return res.status(400).send("user already Registered");
        }
        if(password!=confirmpassword){
            return res.status(403).send("Password Not Matched");
        }
        let newUser=new devuser({
            fullname,email,mobile,skill,password,confirmpassword
        })
        newUser.save();
        return res.status(200).send('User Registered Succesfully')

    }catch{
        console.log(err);
        return res.status(500).send("Server Error");
    }
})




app.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        const exist= await devuser.findOne({email})
        if(!exist){
            return res.status(400).send("User not exist")
        }
        if(exist.password !=password){
            return res.status(400).send('Password Invalid' )
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtPassword',{expiresIn:3600000000},
        (err,token)=>{
            if(err) throw err
            return res.json({token})
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error")
    }
})




app.get('/allprofiles',middleware,async(req,res)=>{
    try{
        let allprofiles=await devuser.find();
        return res.json(allprofiles);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})




app.get('/myprofile',middleware,async(req,res)=>{
    try{
        let user=await devuser.findById(req.user.id);
        return res.json(user)
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})



app.post('/addreview',middleware,async(req,res)=>{
    try{

        const {taskworker,rating}=req.body;
        const exist=await devuser.findById(req.user.id);
        const newReview=new reviewmodel({
            taskprovider:exist.fullname,
            taskworker,rating
        })
        newReview.save();
        return res.status(200).send('Review updated Succesfully')

    }
    catch(err){
        console.log(err);
        return res.status(500).send("server error")
    }
})



app.get('/myreview',middleware,async(req,res)=>{
    try{
        let allreviews=await reviewmodel.find();
        let myreviews=allreviews.filter(review=>review.taskworker.toString===req.user.id.toString())
        return res.status(200).json(myreviews);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error")
    }
})


app.listen(5000, () => {
  console.log("Server is running....");
});
