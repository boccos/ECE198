console.log("Server Up");

const { log } = require('console');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;


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

async function sendData(){
    try{
        const inputPath = path.resolve(__dirname, 'sensors', 'sensorData.json');
        const outputPath = path.resolve(__dirname, 'data', 'data.txt');

        const rawData = await fs.readFile(inputPath, 'utf-8');
        const data = JSON.parse(rawData);
        await fs.writeFile(outputPath, JSON.stringify(data) + '\n', { flag: 'a', encoding: 'utf-8' });
        console.log("Data Copied Success!");
    }
    catch(err){
        console.log(`Data Failed to Copy ${err.message}`);
    }
}

// setInterval(sendData, 10000)