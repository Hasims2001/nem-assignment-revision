const express = require("express");
const bcrypt = require('bcrypt');
const { UserModel } = require("../model/UserModel");
const jwt = require("jsonwebtoken");
require('dotenv').config();


const userRouter = express.Router();



/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       400:
 *         description: Bad request, missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       409:
 *         description: User already registered with the provided email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 */
userRouter.post("/register", async (req, res) => {

    const {  email, password } = req.body;
    if ( !email || !password) {
        res.status(400).json({ "msg": "all the fields are requried", issue: true });
    } else {
        try {
            let user = await UserModel.findOne({ email: email });

            if (user) {
                res.status(400).json({ "msg": "User has already registered", issue: true })
            } else {
                bcrypt.hash(password, 5, async (err, hash) => {
                    if (err) return err;
                    req.body.password = hash;
                    const newbody = {
                        ...req.body,
                    }

                    let newuser = new UserModel(newbody);
                    await newuser.save();
                    res.status(200).json({ "msg": "The new user has been registered", issue: false });
                })

            }
        } catch (error) {
            res.status(200).json({ "msg": error.message, issue: true })
        }
    }
})


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request, missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       401:
 *         description: Invalid password or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 issue:
 *                   type: boolean
 */
userRouter.post("/login", async (req, res) => {
    const { password, email } = req.body;
    if (!password || !email) {
        res.status(200).json({ "msg": "all the fields are requried", issue: true });
    } else {
        try {
            let user = await UserModel.findOne({ email });
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) return err;

                    if (result) {
                        const token = jwt.sign({ userId: user._id,  email: user.email }, process.env.JWT_KEY);

                        res.status(200).json({ "msg": "Login successful!", user: { email: user.email }, "token": token, issue: false })
                    } else {
                        res.status(200).json({ "msg": "Invalid Password!", issue: true })
                    }
                })
            } else {
                res.status(200).json({ "msg": "User Not Found!", issue: true })
            }
        } catch (error) {
            res.status(200).json({ "msg": error.message, issue: true })
        }
    }

})

module.exports = {
    userRouter
}