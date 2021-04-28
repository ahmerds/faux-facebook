process.env.NODE_ENV = "test"

import fs from 'fs'

import { describe, it, before, after } from "mocha"
import chai from "chai";
import chaiHttp = require("chai-http")

chai.use(chaiHttp);
const should = chai.should();

import app from "../src"

describe("Post Service", function() {
    let accessToken
    before((done) => {
      chai.request(app)
        .post('/login')
        .send({
            "email": "mail@example.com",
            "password": "12345678"
        }).end(async (err, res) => {
            if (err) {
                console.log(err)
            }

            accessToken = res.body.accessToken
            done()
        })
    })

    describe("Publish a Post", () => {
        it("should not add a post if user is not signed in", (done) => { 
            chai.request(app)
                .post('/posts')
                .set('authorization', 'None')
                .send({
                    "post": "Post from test suite that won't work"
                }).end((err, res) => {
                    res.should.have.status(401)
                    res.body.should.have.property('error')
                    done()
                }) 
        })

        it("should add a post if user is signed in", (done) => { 
            chai.request(app)
                .post('/posts')
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    "post": "Post from test suite"
                }).end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('data')
                    res.body.data.should.have.property('post')
                    done()
                }) 
        })
    })

    describe("Like a post", () => {
        before((done) => {
            chai.request(app)
                .post('/posts')
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    "post": "test"
                }).end((err, res) => {
                    done()
                }) 
        })
        it("should show an error if unlike is triggered without previously liking a post", (done) => { 
            chai.request(app)
                .put('/like')
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    "postId": 2,
                    "liked": false
                }).end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error')
                    done()
                }) 
        })

        it("should like a post", (done) => { 
            chai.request(app)
                .put('/like')
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    "postId": 2,
                    "liked": true
                }).end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })

        it("should unlike a post", (done) => { 
            before((done) => {
                chai.request(app)
                    .put('/like')
                    .set('authorization', `Bearer ${accessToken}`)
                    .send({
                        "postId": 2,
                        "liked": true
                    }).end((err, res) => {
                        done()
                    })
            })
            chai.request(app)
                .put('/like')
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    "postId": 2,
                    "liked": false
                }).end((err, res) => {
                    res.should.have.status(200)
                    done()
                }) 
        })
    })

    after((done) => {
        fs.unlinkSync(__dirname + "/../test.db")
        fs.unlinkSync(__dirname + "/../test.db-shm")
        fs.unlinkSync(__dirname + "/../test.db-wal")
        done()
    })
})