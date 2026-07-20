const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const {transporter} = require("../controllers/nodemailer");
const {resetPasswordTemplate} = require("../templates/resetPasswordTemplate");
require("dotenv").config();
const express = require("express");
const router = express.Router();

const packageDef = protoLoader.loadSync(
    path.join(__dirname, "auth.proto")
);

const proto = grpc.loadPackageDefinition(packageDef).auth;
console.log(process.env.AUTH_SERVER_ADDRESS);
const authClient = new proto.AuthService(
    process.env.AUTH_SERVER_ADDRESS || "localhost:51000",
    grpc.credentials.createInsecure()
);

router.post("/reset-password-email", async(req,res)=>{

    let email = req.body.email;
    let timestamp = new Date();
    if(!email){
        return res.status(400).json({
            message:"Email not provided."
        });
    }else{
        authClient.SetResetPasswordToken({
            email
        },async (err, response)=>{
            if(err){
                return res.status(500).json({
                    message:"Internal server error."
                });
            }
            if(response.token && response.status == grpc.status.OK){
                let link = `https://ashish-ranjan.com/auth/reset-password/${response.token}?reqEmail=${email}`;
                let options = {
                    from:"support@ashish-ranjan.com",
                    to:email,
                    subject:"Password Reset",
                    html:resetPasswordTemplate(link, email, req.ip, timestamp)
                }
                try{
                    await transporter.sendMail(options);
                    console.log("email sent successfully.")
                }catch(err){
                    console.error("We encounered an error while sending you an email", err);
                }
            }
            return res.status(200).json({
                message:"If the email exists then we have sent you a mail. Kindly process it within 1 hour. Thank you."
            });

        })
    }
});

router.get("/reset-password/:token",async(req,res)=>{
    let token = req.params.token;
    let email = req.query.reqEmail;

    if(!token || !email){
        return res.status(400).json({
            message:"Invalid link"
        });
    }
    
    res.render("resetPassword",{email});
});

router.post("/reset-password/:token",async(req,res)=>{
    let {email, password, confirmPassword} = req.body;
    let token = req.params.token;
    if(!email){
        res.status(400).json({
            message:"Email not provided."
        });
    }else if(!password || !confirmPassword){
        res.status(400).json({
            message:"Password or Confirm Password not provided."
        });
    }else if(password!==confirmPassword){
        res.status(400).json({
            message:"Password and Confirm Password do not match."
        });
    }else{
        authClient.ResetPassword({token, password},(err,response)=>{
            if(err){
                switch(err.code){
                    case grpc.status.DEADLINE_EXCEEDED:
                        return res.status(400).json({
                            message:"Password reset token expired. Please request a new link."
                        });
                    case grpc.status.NOT_FOUND:
                        return res.status(400).json({
                            message:"User does not exist."
                        });
                    case grpc.status.INTERNAL:
                        return res.status(400).json({
                            message:"Internal server error."
                        });
                }
            }else{
                return res.status(200).json({
                    message:`${response.message}. You can now login with your new password.`
                })
            }
        });
    }
});

module.exports = router;                