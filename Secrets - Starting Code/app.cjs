//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const saltRounds=10;

const app=express();

// set up rate limiter: maximum of five requests per 3 seconds
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 1*3*1000, // 3 seconds
  max: 5
});

// apply rate limiter to all requests
app.use(limiter);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

mongoose.connect('mongodb://127.0.0.1/userDB',{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser=new User({
            email:req.body.username,
            password:hash
        });
        newUser.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                res.render("secrets");
            }
        })
    });
    
})
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result==true){
                    res.render("secrets");
                }
                else{
                    console.log(err);
                }
            });   
        }
    })
})

app.get("/logout",(req,res)=>{
    res.redirect("/");
})
app.listen(3000,function(req,res){
    console.log("Successfully connected to port 3000");
})
