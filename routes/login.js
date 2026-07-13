const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const express = require("express");
const router = express.Router();

const packageDef = protoLoader.loadSync(
    path.join(__dirname, "auth.proto")
);

const proto = grpc.loadPackageDefinition(packageDef).auth;

const authClient = new proto.AuthService(
    process.env.AUTH_SERVER_ADDRESS || "localhost:51000",
    grpc.credentials.createInsecure()
);

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    authClient.Login(
        {
            email,
            password
        },
        (err, response) => {

            if (err) {

                switch (err.code) {

                    case 3:
                        return res.status(400).json({
                            success: false,
                            message: err.message
                        });

                    case 5:
                        return res.status(404).json({
                            success: false,
                            message: "User not found."
                        });

                    case 7:
                        return res.status(401).json({
                            success: false,
                            message: "Incorrect password."
                        });

                    default:
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Internal server error."
                        });
                }

            }

            res.cookie("access_token", response.token, {
                httpOnly: true,
                secure: process.env.PRODUCTION === "true",
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.json({
                success: true
            });

        }
    );

});

module.exports = router;
