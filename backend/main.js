const express = require('express');      // To implement a web server
const bodyParser = require('body-parser');         // To parse multipart form data
const cors = require('cors'); // To allow cross-origin requests
const sqlite = require('sqlite3').verbose();        // To implement a database
const crypto = require('crypto');                        // To implement password hashing

const app = express();

// Password hashing
function makeSha512Hash(string) {
    const hash = crypto.createHash('sha512');
    const data = hash.update(String(string), 'utf-8');
    return data.digest('hex');
}

function cleanString(inputString) {
    return inputString.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Utility function to handle web requests and eventually invoke dbms
function handleRequest(request, result, info) {
    console.log("request received: \"", request ,"\",");
    if (info.query) {
        database.all(info.query, info.parameters(request), (error, rows) => {
            if (error) {
                if (info.error) {
                    info.error(request, result, error);
                }
                console.error(error);
                return;
            }
            console.log("sent: \"", rows ,"\",,");
            info.callback(result, request, rows);
        });
    } else {
        info.callback(request, result);
    }
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

function registerDeleteApiEndpoint(app, database, info) {
    app.delete(info.endpoint, (request, result) => {
        handleRequest(request, result, info);
    });
}

const database = new sqlite.Database('../main.sqlite', (error) => {
    if (error) {
        console.error(error.message);
    }
    console.log('Connected to the main database.');
});
app.use(cors());
app.use(bodyParser.json({
    limit: '256mb',
}));
app.use(bodyParser.urlencoded({
    limit: '256mb',
    extended: true
}));

registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses',
    query: 'select * from House',
    parameters: _ => [],
    callback: (result, _, rows) => {
        result.send(rows);
    }
});

// Retrieves the house main info for the card and its cover image (if it exists)
registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses/main',
    query: 'select * from House',
    parameters: _ => [],
    callback: (result, _, rows) => {
        let newData = [];
        for (const { id, plan } of rows) {
            const current = JSON.parse(plan);
            const indices = current
                .indices
                .filter(({ cellId, _ }) => {
                    return cellId === 0;
                });
            const imageIndex = indices.length > 0 ? indices[0].imageId : null;
            const images = imageIndex !== null ? [current.images[imageIndex]] : [];
            newData.push({
                id: id,
                plan: {
                    data: current.data,
                    info: current.info,
                    indices: indices,
                    images: images,
                    rooms: current.rooms,
                }
            });
        }
        result.send(newData);
    }
});

registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/types',
    query: 'select * from Type',
    parameters: _ => [],
    callback: (result, _, rows) => {
        result.send(rows);
    }
});

registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses/id/:houseId',
    query: 'select * from House where id = ?',
    parameters: (request) => [request.params.houseId],
    callback: (result, _, rows) => {
        if (rows.length > 0) {
            result.send(rows);
        } else {
            result.status(404).send({});
        }
    }
});

registerDeleteApiEndpoint(app, database, {
    endpoint: '/api/data/houses/id/:houseId',
    query: `delete from House where id = ?`,
    parameters: (request) => [request.params.houseId],
    callback: (result, _, __) => {
        result.send({});
    },
    error: (request, result, error) => {
        console.error(error);
        result.status(404).send({});
    }
});

registerGetApiEndpoint(app, database, {
    endpoint: '/api/data/houses/city/:city',
    query: "select * from House",
    parameters: _ => [],
    callback: (result, request, rows) => {
        if (rows.length > 0) {
            result.send(
                rows
                    .filter((row) => {
                        const house = JSON.parse(row.plan);
                        return cleanString(house.info.city).includes(cleanString(request.params.city));
                    })
                    .map((row) => {
                        return row.id;
                    }));
        } else {
            result.status(404).send({});
        }
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
    callback: (result, _, rows) => {
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
    callback: (result,  _, __) => {
        result.send({});
    },
    error: (request, result, error) => {
        if (error.code === 'SQLITE_CONSTRAINT') {
            result.status(401).send({
                code: 'PEB_ERROR_USERNAME_TAKEN',
            });
        }
    }
});

registerPostApiEndpoint(app, database, {
    endpoint: '/api/data/tool/upload',
    callback: (request, result) => {
        const { id, plan } = request.body;
        if (!id) {
            database.run(`insert into House (plan) values (?)`, JSON.stringify(plan), (error) => {
                if (error) {
                    console.error(error);
                    result.status(500).send({});
                    return;
                }
                database.all('select max(id) as id from House', (error, rows) => {
                    if (error) {
                        console.error(error);
                        result.status(500).send({});
                        return;
                    }
                    result.send({
                        id: rows[0].id,
                    });
                });
            });
        } else {
            database.run(`update House set plan = ? where id = ?`, JSON.stringify(plan), id, (error) => {
                if (error) {
                    console.error(error);
                    result.status(500).send({});
                    return;
                }
                result.send({
                    id: id,
                });
            });
        }
    }
});

const port = 13331;
app.listen(port, () => {
    console.log(`listening on port ${port}.`);
});
