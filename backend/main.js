const express = require('express');
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

function handleRequest(request, result, info) {
    console.log("request received: \"", request ,"\"\n");
    database.all(info.query, info.parameters(request), (error, rows) => {
        if (error) {
            info?.error(request, result, error);
            console.error(error);
            return;
        }
        console.log("sent: \"", rows ,"\"\n\n");
        info.callback(result, rows);
    });
}

function registerGetApiEndpoint(app, database, info) {
    app.get(info.endpoint, (request, result) => {
        handleRequest(request, result, info);
    });
}

function registerPostApiEndpoint(app, database, info) {
    app.post(info.endpoint, (request, result) => {
        handleRequest(request, result, info);
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

registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses',
    query: 'select * from House',
    parameters: _ => [],
    callback: (result, rows) => {
        result.send(rows);
    }
});
registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses/id/:houseId',
    query: 'select * from House where id = ?',
    parameters: (request) => [request.params.houseId],
    callback: (result, rows) => {
        result.send(rows);
    }
});
registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses/city/:city',
    query: `select * from House where city like '%?%'`,
    parameters: (request) => [request.params.city],
    callback: (result, rows) => {
        result.send(rows);
    }
});

registerPostApiEndpoint(app, database, {
    endpoint: '/api/login/signin',
    query: `select username, permissions from User where username = ? and password = ?`,
    parameters: (request) => {
        const username = request.body.username;
        const password = makeSha512Hash(request.body.password);
        return [username, password];
    },
    callback: (result, rows) => {
        if (rows.length > 0) {
            result.send({
                user: rows[0],
            });
        } else {
            result.status(401).send({
                user: null,
            });
        }
    }
});

registerPostApiEndpoint(app, database, {
    endpoint: '/api/login/signup',
    query: `insert into User values (?, ?, 0)`,
    parameters: (request) => {
        const username = request.body.username;
        const password = makeSha512Hash(request.body.password);
        return [username, password];
    },
    callback: (result, rows) => {

    },
    error: (request, result, error) => {
        if (error.code === 'SQLITE_CONSTRAINT') {
            result.status(401).send({
                code: 'PEB_ERROR_USERNAME_TAKEN',
            });
        }
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}.`);
});
