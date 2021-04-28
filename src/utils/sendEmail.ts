import config from "../config"
import logger from "./logger"

const transport = config.SMTP.transporter

export default async function sendEmail(type: string = "confirmation", params: any) {
    return new Promise((resolve, reject) => {
        const options = {
            from: {
                name: "Faux Facebook",
                address: "awesomeness@change.this"
            },
            to: params.email,
            subject: "Subject",
            text: 'Please use a HTML compatible client to view this email',
            html: 'Email'
        }
    
        switch (type) {
            case "confirmation":
                options.subject = "Confirm your Email"
                options.text = `Use the following link to verify your email \n ${params.link}`
                options.html = `
                    <html>
                        <body>
                            <h3 style="color: #3b5998;">Faux Facebook</h3>
                            <p>Use the following link to verify your email <br> <a href="${params.link}">${params.link}</a></p> 
                            <div style="margin-top: 40px; color: #AAA; font-size: 6px;">
                                This email was sent from the TalentQL Evaluation Demo Project by Ahmad.
                            </div>
                        </body>
                    </html>
                `
                break;
        
            case "resetpass":
                options.subject = "Reset your password"
                options.text = `You requested a password reset for your account. \n 
                    Use the following link to change your password ${params.link} \n\n
                    If you did not make this request, kindly ignore this email.`
                options.html = `
                    <html>
                        <body>
                            <h3 style="color: #3b5998;">Faux Facebook</h3>
                            <p>You requested a password reset for your account. <br> 
                            Use the following link to change your password <a href="${params.link}">${params.link}</a></p> 
                            <p>If you did not make this request, kindly ignore this email.</p>
                            <div style="margin-top: 40px; color: #AAA; font-size: 6px;">
                                This email was sent from the TalentQL Evaluation Demo Project by Ahmad.
                            </div>
                        </body>
                    </html>
                `
                break;

            default:
                break;
        }
    
        transport.sendMail(options, (err, any) => {
            if(err) {
                logger.error(`Error sending ${type} email to ${params.email}: ${err}`)
                return reject(err)
            } 

            resolve("Email sent")
        })
    })
}