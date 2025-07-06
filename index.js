import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {registerValidation} from './validations/auth.js'
import {validationResult} from 'express-validator'
import UserModel from './models/User.js'

mongoose.connect(
    "mongodb+srv://yatskonikita2004:uO8TAaU97w2sbDM5@cluster0" +
    ".7dm2dh1.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((error) => {
        console.log(error);
    });

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.post("/auth/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});
        if (!user) {
            res.status(400).json({
                message: 'Пользователь не найден',
            });
            return
        }


        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            res.status(400).json({
                message: 'Неверный логин или пароль',
            })
            return
        }


        const token = jwt.sign(
            {
                _id: user._id
            }, "secret123", {expiresIn: "30d"}
        )

        const {passwordHash, ...userData} = user

        res.json({
            ...userData,
            token
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        })
    }


});

app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({'errors': errors.array()});
        }


        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = bcrypt.hashSync(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        });

        const token = jwt.sign(
            {
                _id: doc._id
            }, "secret123", {expiresIn: "30d"}
        )

        const user = await doc.save();

        const {passwordHash, ...userData} = user._doc

        res.json({
            ...userData,
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось зарегистироваться",
        });
    }
});


app.listen(3000, (err) => {
    if (err) {

        return console.log(err);
    } else {
        console.log('listening on port 3000');
    }
});
