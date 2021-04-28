const jwt = require("jsonwebtoken")

// const data = {
//     uid: "abc123",
//     email: "somerando@example.com"
// }

// const options = {
//     algorithm: "HS384",
//     issuer: "Company Name",
//     subject: data.uid,
//     audience: "API Gateway",
//     expiresIn: 60*60
// }

// const SIGNING_KEY = "abracadabra"

// jwt.sign({ data }, SIGNING_KEY, options, (err, token) => {
//     if(err) {
//         console.log(err)
//     }
//     console.log(token)
// })

const decoded = jwt.decode("..")

console.log(decoded)