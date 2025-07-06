import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.post('/auth/login', (req, res) => {
    const token = jwt.sign({
        email: req.body.email,
        fullname: "Вася Вася"
    }, "secret123")
    res.json({
        success: true,
        token: token,
    });
    console.log(req.body);
});


app.listen(3000, (err) => {
    if (err) {
        return console.log(err);
    } else {
        console.log('listening on port 3000');
    }
});
