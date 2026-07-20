const express = require("express");
const path = require("path");
const websocket = require("ws");
const http = require("http");
const cookieParser = require("cookie-parser");
const {transporter} = require("./controllers/nodemailer");
const crypto = require("crypto");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {sendEmail} = require("./scripts/sendEmail");
const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
const forgotPasswordRoute = require("./routes/forgetPassword");
const mysql = require("mysql2/promise");
const {createClient} = require("redis");
const authenticate = require("./middlewares/authenticate");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new websocket.Server({ server });
const packageDef = protoLoader.loadSync("aichat.proto");
const proto = grpc.loadPackageDefinition(packageDef).aichat;

const LLMServers = ["10.0.0.6:8100", "10.0.0.6:8101"];


const grpcLLMClient = new proto.AiChatService(
    "ipv4:"+LLMServers.join(","),
    grpc.ChannelCredentials.createInsecure(),
    {
        "grpc.service_config": JSON.stringify({
            loadBalancingConfig: [
                { round_robin: {} }
            ]
        })
    }
);
/*const MONGODB_URI = process.env.MONGODB_URI;
let DB;
const client = new MongoClient(MONGODB_URI,{
    serverApi:{
        version:ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true
    }
});*/

var publicKey = null;
var connection = null;
(async()=>{
    try{
            connection = await mysql.createConnection({
            host:process.env.DB_HOST,
            port:process.env.DB_PORT,
            user:process.env.DB_USER,
            password:process.env.DB_PASSWORD,
            database:process.env.DATABASE,
        });
        let [row] = await connection.execute(`SELECT public_key FROM public_keys WHERE kid = ?`,[process.env.KID]);
        console.log(row);
        publicKey = row[0].public_key;
        process.env.PUBLIC_KEY = publicKey;
    }catch(err){
        publicKey = null;
        console.log(err);
        console.log("An error occurred while setting the public key.")
    }finally{
        if(connection){
            await connection.end();
            console.log("connection to mysql closed");
        }
    }
})();

/*(async()=>{
    try{
        await client.connect();
        DB = client.db("tushar-chat-app");
        console.log("connected to mongodb");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})();*/

app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"frontend")));
app.use(express.static(path.join(__dirname,"styles")));
app.use(express.static(path.join(__dirname,"scripts")));
app.use(express.static(path.join(__dirname,"assets","favicon")));
app.use(express.static(path.join(__dirname,"assets","images")));
app.use(express.static(path.join(__dirname,"assets","resources")));
app.use(express.static(path.join(__dirname,"assets","fonts")));
app.use(express.static(path.join(__dirname,"assets","icons")));
app.use(express.static(path.join(__dirname,"assets","sounds")));
app.set("views","./views");
app.set("view engine","ejs");

app.use("/auth",forgotPasswordRoute);
app.use("/",loginRoutes);
app.use("/",signupRoutes);


app.get("/",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","home.html"));
});

app.get("/resume",async(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,"assets","resources","resume.pdf"));
});

app.get("/registerFile",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","registration.html"));
});

/*app.post("/login",async(req,res)=>{
    let {email, password} = req.body;
    console.log(`email: ${email}\npassword: ${password}`);

    res.sendFile(path.join(__dirname,"frontend","talk.html"));
});*/

/*app.get("/loginFile",async(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","login.html"));
});*/

/*app.post("/login",async(req,res)=>{
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
});*/

/*app.get("/talk",async(req,res)=>{
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
});*/

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
});

app.get("/ask",authenticate, async(req,res)=>{
    console.log("user authenticated");
    res.status(200).send();
})

app.post("/ask",authenticate,async (req,res)=>{
    const query = req.body.query;
    console.log(`reqeuest recived from: ${req.socket.remoteAddress}`);
    const stream = grpcLLMClient.AnswerQuery({
        query,
        client:"ashish"
    });

    /*res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");*/
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    stream.on("data",(chunk)=>{
        res.write(chunk.answer);
    });

    stream.on("end",()=>{
        return res.end();
    });

    stream.on("error",(err)=>{

        if(!res.headersSent){
            return res.status(500).json({
                err: err.message
            });
        }else{
            return res.end();
        }
    })


});
app.post('/upload', upload.single('resume'), (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const file = req.file;

    // Fast validation failure handles early exits cleanly
    if (!username || !file || !password) {
        return res.status(400).json({ error: "Missing required parameters: 'username' and 'resume' file." });
    }

    let grpcEmbeddingsClient = new proto.AiChatService(
        "10.0.0.6:8200",
        grpc.ChannelCredentials.createInsecure()
    );

    // Set HTTP headers for live chunk streaming to the client
    //res.setHeader('Content-Type', 'text/event-stream'); Not using SSE as post requests are not allowed in EventSource
    res.setHeader('Content-Type','text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache');
    //res.setHeader('Connection', 'keep-alive');
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    console.log(`Starting processing for user: ${username}, File Size: ${file.size} bytes`);

    // Initialize the bi-directional streaming framework over gRPC
    const grpcStream = grpcEmbeddingsClient.CreateResumeEmbeddings();

    // Track state to avoid double response invocations if a crash occurs
    let streamEnded = false;

    // Helper to pipe a clean text update down the HTTP wire safely
    const sendSSEUpdate = (status, message) => {
        if(res.writableEnded)return;
        if(res.destroyed)return;
        if (!streamEnded) {
            res.write(`${JSON.stringify({ status, message })}`);
        }
    };

    // Listen for responses back from the gRPC Server
    grpcStream.on('data', (grpcResponse) => {
        // grpcResponse looks like { code: 0, message: "45.20%" }
        if (grpcResponse.code === grpc.status.OK) {
            sendSSEUpdate("PROCESSING", grpcResponse.message);
        } else {
            sendSSEUpdate("ERROR", `gRPC Server reported error code ${grpcResponse.code}: ${grpcResponse.message}`);
            cleanupAndEnd();
        }
    });

    // Listen for connection level/gRPC standard protocol errors
    grpcStream.on('error', (err) => {
        console.error("gRPC Connection Error occurred:", err);
        sendSSEUpdate("ERROR", `gRPC stream error: ${err.message}`);
        cleanupAndEnd();
    });

    // Fire when the gRPC server successfully completes processing
    grpcStream.on('end', () => {
        sendSSEUpdate("COMPLETED", "File safely processed and database updated!");
        cleanupAndEnd();
    });

    function cleanupAndEnd() {
        if (!streamEnded) {
            streamEnded = true;
            res.end();
            grpcStream.end();
            grpcEmbeddingsClient.close();
            console.log("Cleaned up gRPC stream and closed HTTP response.");
        }
    }

    try {
        // Step A: Send User metadata block
        grpcStream.write({ user: username });

        // Step B: Send Total File Size sizing parameters
        grpcStream.write({
            metadata: { totalSize: file.size } // Matching the .proto file tracking naming
        });

        // Step C: Chunk the file buffer slice by slice and push it down the wire
        const CHUNK_SIZE = 64 * 1024; // 64KB chunks optimization limit
        const fileBuffer = file.buffer;
        const sha256Hash = crypto.createHash("sha256");

        for (let offset = 0; offset < fileBuffer.length; offset += CHUNK_SIZE) {
            const chunk = fileBuffer.slice(offset, offset + CHUNK_SIZE);
            sha256Hash.update(chunk);
            
            grpcStream.write({ chunk: chunk });
        }

        // Step D: Send the concluding checksum verification hash
        const finalChecksum = sha256Hash.digest("hex");
        grpcStream.write({ hash: finalChecksum });

    } catch (err) {
        console.error("Failed to read and pipe data chunks to the gRPC client:", err);
        sendSSEUpdate("ERROR", "Internal system failure parsing file buffers.");
        grpcStream.end();
        cleanupAndEnd();
    }
});

wss.on("connection",async(ws,req)=>{
    console.log("A client connected");
    
    //await redisClient.set(); 
    ws.send(`hello from server!`); 
    ws.on("message",(message)=>{
        console.log(`Received message: ${message}`);
        ws.send(`Server received: ${message}`);
    });
});

server.listen(PORT,"localhost", async() => {
    console.log(`Server is running on port ${PORT}`);
    try{
        await transporter.verify();
        console.log("Connected to SMTP server successfully.");
    }catch(err){
        console.log("Cannot connect to SMTP server.");
    }
});