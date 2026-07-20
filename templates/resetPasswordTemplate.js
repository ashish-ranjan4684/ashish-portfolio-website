const resetPasswordTemplate = (link,username,ip,timestamp)=>{
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
                            src="https://ashish-ranjan.com/logo.png"
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

                            Reset your password

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

                A password reset event has been triggered. Kindly complete the process within 1 hour.

            </h2>

            <p
                style="
                    color:#555;
                    line-height:1.7;
                    font-size:15px;
                ">

                To complete the password reset process, visit the following link: 
                <br><br>
                <a href=${link}>${link}</a>

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

                        Username

                    </td>

                    <td>

                        ${username}

                    </td>

                </tr>

                <tr>

                    <td
                        style="
                            color:#6b7280;
                            font-weight:bold;
                        ">

                        IP Address

                    </td>

                    <td>

                        ${ip}

                    </td>

                </tr>

                <tr>

                    <td
                        style="
                            color:#6b7280;
                            font-weight:bold;
                        ">

                        Request Timestamp

                    </td>

                    <td>

                        ${timestamp}

                    </td>

                </tr>

            </table>
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

            This email was automatically generated following a password reset request.

            <br><br>

            © 2026 Ashish Ranjan

        </td>

    </tr>

</table>

</body>

</html>`
}

module.exports = {
    resetPasswordTemplate
}