const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite3').verbose();
const app = express();

const database = new sqlite.Database('../main.sqlite', (error) => {
    if (error) {
        console.error(error.message);
    }
    console.log('connected to the main database.');
});
app.use(cors());
app.get('/api/data/houses', (request, result) => {
    database.all('select * from House', (error, rows) => {
        if (error) {
            console.error(error);
        }
        result.send(rows);
    });
});
app.listen(8080);
