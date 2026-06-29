const nodeMailer = require("nodemailer");

function Template(emailContent){
    let name = emailContent.name;
    let email = emailContent.email;
    let org = emailContent.org;
    let message = emailContent.message;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Contact</title>
</head>

<body style="
    margin:0;
    padding:0px;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="max-width:700px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;">

    <!-- Header -->

    <tr>
        <td
            style="
                padding:28px 36px;
                background:#111827;
                color:white;
            ">

            <table width="100%">
                <tr>

                    <td width="60">

                        <img
                            src="https://tushar.ashish-ranjan.com/logo.png"
                            width="48"
                            height="48"
                            style="display:block;">

                    </td>

                    <td>

                        <div
                            style="
                                font-size:24px;
                                font-weight:bold;
                            ">

                            Ashish Ranjan

                        </div>

                        <div
                            style="
                                color:#cfd8dc;
                                font-size:14px;
                                margin-top:4px;
                            ">

                            Portfolio Contact Notification

                        </div>

                    </td>

                </tr>
            </table>

        </td>
    </tr>

    <!-- Body -->

    <tr>

        <td style="padding:36px;">

            <h2
                style="
                    margin-top:0;
                    color:#111827;
                ">

                You've received a new message

            </h2>

            <p
                style="
                    color:#555;
                    line-height:1.7;
                    font-size:15px;
                ">

                <strong>${name}</strong>

                from

                <strong>${org}</strong>

                has contacted you through your portfolio website.

            </p>

            <table
                width="100%"
                cellpadding="10"
                cellspacing="0"
                style="
                    margin-top:24px;
                    border-collapse:collapse;
                ">

                <tr>

                    <td
                        style="
                            width:150px;
                            color:#6b7280;
                            font-weight:bold;
                        ">

                        Name

                    </td>

                    <td>

                        ${name}

                    </td>

                </tr>

                <tr>

                    <td
                        style="
                            color:#6b7280;
                            font-weight:bold;
                        ">

                        Email

                    </td>

                    <td>

                        <a href="mailto:${email}">
                            ${email}
                        </a>

                    </td>

                </tr>

                <tr>

                    <td
                        style="
                            color:#6b7280;
                            font-weight:bold;
                        ">

                        Organization

                    </td>

                    <td>

                        ${org}

                    </td>

                </tr>

            </table>

            <div
                style="
                    margin-top:32px;
                    border:1px solid #ececec;
                    border-radius:12px;
                    padding:20px;
                    background:#fafafa;
                ">

                <div
                    style="
                        color:#6b7280;
                        font-size:13px;
                        margin-bottom:10px;
                    ">

                    MESSAGE

                </div>

                <div
                    style="
                        font-size:15px;
                        line-height:1.8;
                        color:#333;
                        white-space:pre-wrap;
                    ">

                    ${message}

                </div>

            </div>

            <div
                style="
                    margin-top:35px;
                ">

                <a
                    href="mailto:${email}"
                    style="
                        background:#00bcd4;
                        color:white;
                        text-decoration:none;
                        padding:14px 28px;
                        border-radius:8px;
                        display:inline-block;
                        font-weight:bold;
                    ">

                    Reply to ${name}

                </a>

            </div>

        </td>

    </tr>

    <!-- Footer -->

    <tr>

        <td
            style="
                padding:24px;
                background:#f7f7f7;
                text-align:center;
                color:#888;
                font-size:13px;
            ">

            This email was automatically generated from your portfolio contact form.

            <br><br>

            © 2026 Tushar Vatsa

        </td>

    </tr>

</table>

</body>

</html>
`
}

async function sendEmail(SMTP_USER, SMTP_PASSWORD, type,subject,receiverEmail,emailContent){
    const transporter = nodeMailer.createTransport({
        host:"smtpout.secureserver.net",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:SMTP_USER,
            pass:SMTP_PASSWORD
        }
    });
    const mailOptions = {
        from: `${type}@ashish-ranjan.com`, 
        to: `${receiverEmail}`, 
        subject: `${subject}`,
        html: Template(emailContent)
    };

    try{
        let result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${result.response}`);
    }catch(err){
        console.error("Email could not be sent. Reason: ",err);
        throw err;
    }
}

module.exports = {
    sendEmail
}