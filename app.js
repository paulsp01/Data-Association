const express=require('express');
const app=express();
const userModel=require('./models/user');
const postModel=require('./models/post');
const cookieParser=require('cookie-parser');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const router = express.Router();

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/',(req,res)=>{

 res.render('index');
});

app.get('/profile',isLoggedin,async (req,res)=>{
  
  let token=req.cookies.token;
  if(token){
    
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("posts");
    
    
    res.render("profile", { user });

  }else{
    res.redirect('/l');
  }
   
});


app.post("/register", async (req, res) => {
 let {email,password,name,age,username}=req.body;

 let user=await userModel.findOne({email});

 if(!user){
 bcrypt.genSalt(10,  function (err, salt) {
     bcrypt.hash(password, salt, async function (err, hash) {

        let createduser=await userModel.create({
        email,
        password:hash,
        name,
        age,
        username
    });

     let token = jwt.sign({ email: email, userid: createduser._id }, "abcde");
     res.cookie("token", token);
     console.log("registered");
     res.render("login");
     
   });
 });



}else{
  res.send("user already exist");
  
 }

});

app.get("/l",(req,res)=>{
    res.render('login');
});

app.post("/login",async (req,res)=>{

    let { email, password } = req.body;

   let user=await userModel.findOne({email});

   if(user){
    bcrypt.compare(password, user.password, function (err, result) {
        if(result==true){

             let token = jwt.sign({ email: email, userid: user._id }, "abcde");
             res.cookie("token", token);
            console.log(result,"logged in successfully")
            

           
           res.redirect("/profile");
            
        }else{
           
            res.redirect("/l");
        }
      
    });
   }else{
    res.send("cannot find user");
    
   }

   
});


app.get("/logout",(req,res)=>{
   
    res.cookie("token", "");
   
    res.redirect("/l");
});


function isLoggedin(req,res,next){
    if(req.cookies.token==""){
        res.status(500).send("you must be loggin");
        return;
    }else{
        let data=jwt.verify(req.cookies.token,"abcde");
        req.user=data;
    }

    next();

}

app.post("/post",isLoggedin,async (req,res)=>{
 
    let user=await userModel.findOne({email:req.user.email});
    
let {postdata}=req.body;
let createdpost=await postModel.create({
    user:user._id,
    postdata
});
user.posts.push(createdpost._id);
await user.save();
res.redirect("/profile");
});

app.get("/like/:id",isLoggedin, async (req, res) => {
   
  const post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if(post.likes.indexOf(req.user.userid)===-1){
    post.likes.push(req.user.userid);
  }else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
  }

  
  await post.save();
  res.redirect("/profile");
  
 
});


app.get("/edit/:id",  async (req, res) => {
  const post = await postModel.findOne({ _id: req.params.id }).populate("user");

  
  res.render("edit",{post});
});

app.post("/update/:id", async (req, res) => {
  const post = await postModel.findOneAndUpdate({ _id: req.params.id },{postdata:req.body.postdata});

 
  res.redirect("/profile");
});

app.post("/delete/:id", async (req, res) => {
  const post = await postModel.findOneAndDelete(
    { _id: req.params.id }
   
  );

  res.redirect("/profile");
});



app.listen(3002,()=>{
    console.log("my server is running at port 3002");
})


module.exports=router;