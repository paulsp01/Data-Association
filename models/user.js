const mongoose=require('mongoose');

mongoose.connect(
  "mongodb+srv://paulswarnalee01:spbackend@cluster0.ul7lm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    age:Number,
    password:String,
    profilepic:{
      type:String,
      default:"profile.png"
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'

    }]
  
});

module.exports=mongoose.model("user",userSchema);