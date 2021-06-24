const express = require('express');
const app = express();
var images = require('./images.json')


const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5000;
app.use(bodyParser.json({limit: '50mb'}));


app.use(cors());

//server requst
app.get('/', (req, res) => {
    res.send('Hello EasyCaount!')
})
app.post('/images', (req, res) => {
    images.push({src: req.body.data});
    res.json(images).status(201);
})

app.get('/images', (req, res) => {
    res.json(images).status(200);
})
app.delete('/images', (req, res) => {
    images=[];
    res.json(images).status(200);
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
