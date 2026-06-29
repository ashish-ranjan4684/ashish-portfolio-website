const express = require("express");
const path = require("path");
const websocket = require("ws");
const http = require("http");
const {MongoClient, ServerApiVersion} = require("mongodb");
const cookieParser = require("cookie-parser");
const redis = require("redis");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {sendEmail} = require("./scripts/sendEmail");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new websocket.Server({ server });

const MONGODB_URI = process.env.MONGODB_URI;
let DB;
const client = new MongoClient(MONGODB_URI,{
    serverApi:{
        version:ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true
    }
});

(async()=>{
    try{
        await client.connect();
        DB = client.db("tushar-chat-app");
        console.log("connected to mongodb");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})();

/*const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

(async()=>{
    redisClient.on("error",(err)=>{
        console.log("Error connecting to Redis Client: ",err);
    });
    await redisClient.connect();
    console.log("Connected to Redis");
})();*/

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname,"frontend")));
app.use(express.static(path.join(__dirname,"styles")));
app.use(express.static(path.join(__dirname,"assets","favicon")));
app.use(express.static(path.join(__dirname,"assets","images")));
app.use(express.static(path.join(__dirname,"assets","resources")));
app.use(express.static(path.join(__dirname,"assets","fonts")));
app.use(express.static(path.join(__dirname,"assets","icons")));


app.get("/",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","home.html"));
});

app.get("/resume",async(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,"assets","resources","resume.pdf"));
});

app.get("/registerFile",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","registration.html"));
});

app.post("/register",async(req,res)=>{
    let {email,organization,name,publicKey} = req.body;
    if(!email || !organization || !name || !publicKey){
        return res.status(400).json({message:"All fields are required"});
    }
    try{
        let existingUser = await client.db("tushar-chat-app").collection("users").findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }else{
            try{
                let uuid = crypto.randomUUID();
                await client.db("tushar-chat-app").collection("users").insertOne({email,uuid,organization,name,publicKey});
                return res.status(201).json({message:"User registered successfully."});
            } catch (error) {
                console.error("Error creating user:", error);
                return res.status(500).json({message:"Internal server error"});
            }
        }
    }catch(error){
        console.error("Error occurred while registering user:", error);
        return res.status(500).json({message:"Internal server error"});
    }
});

app.get("/loginFile",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","login.html"));
});

app.post("/login",async(req,res)=>{
    let {email,signature} = req.body;
    if(!email || !signature){
        return res.status(400).json({message:"Email and signature are required"});
    }
    try{
        let user = await client.db("tushar-chat-app").collection("users").findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        // Generate a JWT token
        crypto
        const token = jwt.sign({email:user.email,uuid:user.uuid}, process.env.JWT_SECRET, {expiresIn:"1h"});
        res.cookie("token", token, {httpOnly:true});
        return res.status(200).json({message:"Login successful", token});
    } catch (error) {
        console.error("Error occurred while logging in:", error);
        return res.status(500).json({message:"Internal server error"});
    }
});

app.get("/talk",async(req,res)=>{
    const token = req.cookies.token;
    if(!token){
        res.redirect("/registerFile");
    }else{
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.sendFile(path.join(__dirname,"frontend","talk.html"));
        } catch (error) {
            res.status(401).send("Invalid token");
        }
    }
});

app.post("/send-message",async(req, res)=>{
    let obj = req.body;
    console.log(obj);

    try{
        await sendEmail(process.env.SMTP_USER, process.env.SMTP_PASSWORD, "notification", "You received a message", process.env.RECEIVER_EMAIL,obj);
        res.status(200).send("email sent successfully.");
    }catch(err){
        console.log(err);
        res.status(500).send("could not send email");
    }
})

wss.on("connection",async(ws,req)=>{
    console.log("A client connected");
    
    //await redisClient.set(); 
    ws.send(`hello from server!`); 
    ws.on("message",(message)=>{
        console.log(`Received message: ${message}`);
        ws.send(`Server received: ${message}`);
    });
});

server.listen(PORT,"localhost", () => {
    console.log(`Server is running on port ${PORT}`);
});