process.env.NODE_ENV = "test"
// We do not want emails to get sent during tests
process.env.SMTP_PASSWORD = "No"

import fs from 'fs'

import { describe, it, before, beforeEach, after } from "mocha"
import chai from "chai";
import chaiHttp = require("chai-http")

chai.use(chaiHttp);
const should = chai.should();

import app from "../src"
import { AuthService } from "../src/services/Auth"

import { User } from "../src/entity/User"

const authService = new AuthService()

describe("Auth Service", function() {
    before((done) => {
        chai.request(app)
            .post('/register')
            .send({
                "email": "mail@example.com",
                "password": "12345678",
                "lastName": "Obi",
                "firstName": "Aremu"
            }).end(async (err, res) => {
                if (err) {
                    console.log(err)
                }

                // We confirm dummy user automatically after sign up
                const user = await User.findOneOrFail({ id: 1 })
                user.isUserConfirmed = true
                await user.save()
                done()
            })
    })

    describe("register", () => {
        it("should have error if a user already exists", (done) => {
            chai.request(app)
                .post('/register')
                .send({
                    "email": "mail@example.com",
                    "password": "12345678",
                    "lastName": "Obi",
                    "firstName": "Aremu"
                }).end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error')
                    done()
                })
        })

        it("should add new user to the database", (done) => { 
            chai.request(app)
                .post('/register')
                .send({
                    "email": "mail2@example.com",
                    "password": "12345678",
                    "lastName": "Chisom",
                    "firstName": "Danladi"
                }).end((err, res) => {
                    res.should.have.status(200)
                    res.body.data.should.have.property('uid')
                    done()
                }) 
        })
    })

    describe("confirmEmail", () => {
        it("should show an error if token is not found in the DB", (done) => { 
            chai.request(app)
                .post('/register')
                .send({
                    "email": "mail@example.com",
                    "code": "abfo347"
                }).end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error')
                    done()
                }) 
        })
    })

    describe("login", () => {
        it("should show an error if email does not exist", (done) => {  
            chai.request(app)
                .post('/login')
                .send({
                    "email": "nonexistent@example.com",
                    "password": "12345678"
                }).end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have.property('error')
                    done()
                }) 
        })

        it("should show an error if password is incorrect", (done) => {
            chai.request(app)
                .post('/login')
                .send({
                    "email": "mail@example.com",
                    "password": "12345"
                }).end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have.property('error')
                    done()
                }) 
        })

        it("should return a generated JWT and data for the user if credentials are correct", (done) => {
            chai.request(app)
                .post('/login')
                .send({
                    "email": "mail@example.com",
                    "password": "12345678"
                }).end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('accessToken')
                    res.body.should.have.property('refreshToken')
                    res.body.should.have.property('user')
                    done()
                }) 
        })
    })
    after((done) => {
        // fs.unlinkSync(__dirname + "/../test.db")
        // fs.unlinkSync(__dirname + "/../test.db-shm")
        // fs.unlinkSync(__dirname + "/../test.db-wal")
        done()
    })
})