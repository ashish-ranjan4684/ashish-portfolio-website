const crypto = require("crypto");
const path = require("path");

function authenticate(req, res, next) {

    // Public key not loaded
    let publicKey = process.env.PUBLIC_KEY;
    if (!publicKey) {
        return res.status(500).send("Internal Server Error");
    }

    const token = req.cookies?.access_token;

    if (!token) {
        /*return res.sendFile(
            path.join(__dirname,"..","frontend", "registration.html")
        );*/
        return res.status(401).send("Authentication required.");
    }

    try {

        const parts = token.split(".");

        if (parts.length !== 2) {
            throw new Error("Invalid token format");
        }

        const [payloadB64, signatureB64] = parts;

        const payloadBuffer = Buffer.from(payloadB64, "base64url");
        const signatureBuffer = Buffer.from(signatureB64, "base64url");

        const verified = crypto.verify(
            null,
            payloadBuffer,
            publicKey,
            signatureBuffer
        );

        if (!verified) {
            throw new Error("Invalid signature");
        }

        const payload = JSON.parse(payloadBuffer.toString());

        if (Date.now() > payload.expAt) {
            throw new Error("Token expired");
        }

        req.user = payload;

        next();

    } catch (err) {

        res.clearCookie("access_token");

        return res.sendFile(
            path.join(__dirname, "public", "registration.html")
        );

    }

}

module.exports = authenticate;