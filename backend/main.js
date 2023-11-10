const express = require('express');
const circularJson = require('circular-json');
const cors = require('cors');
const sqlite = require('sqlite3').verbose();
const app = express();

function registerApiEndpoint(app, database, info) {
    app.get(info.endpoint, (request, result) => {
        database.all(info.query, info.parameters(request), (error, rows) => {
            if (error) {
                console.error(error);
            }
            console.log(`request received: "${circularJson.stringify(request)}"\n`);
            console.log(`sent: "${circularJson.stringify(rows)}"\n\n`);
            info.callback(result, rows);
        });
    });
}

const database = new sqlite.Database('../main.sqlite', (error) => {
    if (error) {
        console.error(error.message);
    }
    console.log('connected to the main database.');
});
app.use(cors());
registerApiEndpoint(app, database, {
    endpoint: '/api/data/houses',
    query: 'select * from House',
    parameters: _ => [],
    callback: (result, rows) => {
        result.send(rows);
    }
});
registerApiEndpoint(app, database, {
    endpoint: '/api/data/houses/id/:houseId',
    query: 'select * from House where id = ?',
    parameters: (request) => [request.params.houseId],
    callback: (result, rows) => {
        result.send(rows);
    }
});
registerApiEndpoint(app, database, {
    endpoint: '/api/data/houses/city/:city',
    query: 'select * from House where city = ?',
    parameters: (request) => [request.params.city],
    callback: (result, rows) => {
        result.send(rows);
    }
});
app.listen(8080);
