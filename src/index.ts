import express from "express"
import compression from "compression"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import fileUpload from "express-fileupload"
import { createConnection } from "typeorm"

import logger from "./utils/logger"
import config from "./config"

import * as AuthValidatorMiddleware from "./middleware/authValidator"
import * as ManagementValidatorMiddleware from "./middleware/managementValidator"
import * as PostValidatorMiddleware from "./middleware/postValidator"
import * as AuthMiddleware from "./middleware/auth"
import * as AuthController from "./controllers/auth"
import * as ManagementController from "./controllers/management"
import * as PostController from "./controllers/post"

const app = express();

// Setup global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(morgan(':response-time ms - :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));


(async () => {
    // Establish connection to database
    try {
        if (process.env.NODE_ENV === 'test') {
            // Create a database for testing
            const connection = await createConnection({
                type: 'better-sqlite3',
                database: './test.db',
                synchronize: true,
                entities: [
                    "src/entity/**/*.ts"
                ],
                cli: {
                    entitiesDir: "src/entity"
                }
            })
        } else {
            const connection = await createConnection()
        }
        logger.debug("Connection to Database established")
    } catch(err) {
        logger.error("DB Connection Error: " + err)
    }

    app.post("/register", AuthValidatorMiddleware.register, AuthController.register)
    app.get("/confirmemail", AuthValidatorMiddleware.confirmEmail, AuthController.confirmEmail)
    app.post("/login", AuthValidatorMiddleware.login, AuthController.login)
    app.post("/token", AuthValidatorMiddleware.token, AuthController.token)
    app.post("/logout", ManagementValidatorMiddleware.revokeRefreshToken, ManagementController.revokeRefreshToken)

    app.patch("/manage/update",
        AuthMiddleware.authenticate,
        ManagementValidatorMiddleware.updateInfo,
        ManagementController.updateInfo
    )
    app.patch("/manage/changepass",
        AuthMiddleware.authenticate,
        ManagementValidatorMiddleware.changePassword,
        ManagementController.changePassword
    )
    app.post("/forgotpass", ManagementValidatorMiddleware.forgotPassword, ManagementController.forgotPassword)
    app.get("/resetlink", ManagementValidatorMiddleware.checkResetLink, ManagementController.checkResetLink)
    app.post("/resetpass", ManagementValidatorMiddleware.resetPassword, ManagementController.resetPassword)
    app.post("/manage/disable",
        AuthMiddleware.authenticate,
        ManagementValidatorMiddleware.disableAccount,
        ManagementController.disableAccount
    )
    
    app.get("/posts",
        AuthMiddleware.authenticate,
        PostController.fetch
    )
    app.post("/posts",
        AuthMiddleware.authenticate,
        fileUpload(),
        PostValidatorMiddleware.publishPost,
        PostController.publish
    )
    app.get("/posts/:id",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.getPost,
        PostController.getPost
    )
    app.patch("/posts/:id",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.updatePost,
        PostController.updatePost
    )
    app.delete("/posts/:id",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.deletePost,
        PostController.deletePost
    )
    app.get("/posts/:id/comments",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.getPost,
        PostController.fetchComments
    )
    app.get("/myposts",
        AuthMiddleware.authenticate,
        PostController.fetchOwnerPosts
    )
    app.post("/comments",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.addComment,
        PostController.addComment
    )
    app.delete("/comments/:id",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.deletePost,
        PostController.deleteComment
    )
    app.put("/like",
        AuthMiddleware.authenticate,
        PostValidatorMiddleware.likePost,
        PostController.likePost
    )

    
    app.all("*", (req, res) => {
        res.status(404).json({
            error: true,
            message: "Not found"
        })
    });
    
    const port = config.PORT || 3000;
    
    app.listen(port, () => {
        logger.debug(`Faux Facebook API listening on port ${port}... 😉`);
    });
})();

// We export our express ref to enable testing without running the server
export default app;
