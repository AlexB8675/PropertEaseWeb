const express = require('express');
const circularJson = require('circular-json');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite = require('sqlite3').verbose();
const crypto = require('crypto');
const app = express();

function makeSha512Hash(string) {
    const hash = crypto.createHash('sha512');
    const data = hash.update(String(string), 'utf-8');
    return data.digest('hex');
}

function registerApiEndpoint(app, database, info) {
    app.get(info.endpoint, (request, result) => {
        console.log("request received: \"", request ,"\"\n");
        database.all(info.query, info.parameters(request), (error, rows) => {
            if (error) {
                console.error(error);
            }
            console.log("sent: \"", rows ,"\"\n\n");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    query: `select * from House where city like '%?%'`,
    parameters: (request) => [request.params.city],
    callback: (result, rows) => {
        result.send(rows);
    }
});

// sign_in
app.post('/login/signin', (request, result) => {
    const username = request.body.username;
    const password = makeSha512Hash(request.body.password);
    const query = 'select username, permissions from User where username = ? and password = ?';
    console.log(request);
    database.all(query, [username, password], (error, rows) => {
        if (error) {
            console.error(error);
        }
        console.log(`sent: "${circularJson.stringify(rows)}"\n\n`);
        if (rows.length > 0) {
            result.send({
                success: true,
                user: rows[0],
            });
        } else {
            result.send({
                success: false,
                user: null,
            });
        }
    });
});
app.listen(8080);
