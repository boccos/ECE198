console.log("Server Up");
const express = require('express');
const app = express();
const http = require('http');
const PORT = 3000;

app.get('/', (req, res) => {
    res.status(200);
    console.log("Server Accessed");
    res.set('Content-Type', 'text/html');
    res.send("<h1>Server home page!</h1>");
})

app.listen(PORT, () => {
    console.log("Listening to Server")
})