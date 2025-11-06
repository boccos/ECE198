console.log("Server Up");
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static('./public'));


app.use((req, res) => {
    res.status(404).send('resource not found');
    console.log('Resource not found');
});

app.listen(PORT, () => {
    console.log("Listening to Server");
});