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

router.post("/signup", (req, res) => {

    const {
        name,
        email,
        password,
        organization
    } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            success: false,
            message: "Missing required fields."
        });

    }

    authClient.Signup(
        {
            name,
            email,
            password,
            organization
        },
        (err, response) => {

            if (err) {

                switch (err.code) {

                    case 3:
                        return res.status(400).json({
                            success: false,
                            message: err.message
                        });

                    case 6:
                        return res.status(409).json({
                            success: false,
                            message: "User already exists."
                        });

                    default:
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Internal server error."
                        });
                }

            }

            return res.status(201).json({
                success: true,
                message: "Account created successfully."
            });

        }
    );

});

module.exports = router;