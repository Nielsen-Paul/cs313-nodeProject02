const express = require('express');
const path = require('path');
const money = require("money-math");
const session = require("cookie-session");
const { Client } = require('pg');
const PORT = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL ||
    'postgres://bwmpfcfxqrhfbe:3267d6d64fd2c27eff703422f6730d9c238727b5d28952c5962a0a160e252dc1@ec2-54-235-193-0.compute-1.amazonaws.com:5432/d5vuvcpd9kneir';


express()
    .use(session({
        name: 'session',
        keys: ['key1'],

        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }))
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/signUp', (req, res) => {
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            db.query(`SELECT * FROM public.users`).then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows));
                console.log(JSON.stringify(result.rows));
                db.end();
            });
        });
    })
    .post('/signIn', (req, res) => {
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            let name = req.body.name;
            let password = req.body.password;
            const query = {
                text: 'SELECT password, id FROM public.users WHERE name = $1',
                values: [name]
            }

            // callback
            db.query(query, (err, result) => {
                if (err) {
                    console.log(err.stack);
                } else {
                    console.log(result.rows[0]);
                    if (password == result.rows[0].password) {
                        req.session.id = result.rows[0].id;
                        res.sendFile(path.join(__dirname + '/public/transactions.html'));
                    }
                }
            })
        });
    })
    .get('/transactions', (req, res) => {
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            db.query(`SELECT * FROM public.transactions WHERE user_id = $1`, [req.session.id]).then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows));
                console.log(JSON.stringify(result.rows));
                db.end();
            });
        });
    })
    .post('/signUp', (req, res) => {
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            let name = req.body.name;
            let password = req.body.password;
            const query = {
                text: 'INSERT INTO public.users(name, password) VALUES($1, $2)',
                values: [name, password],
            }

            // callback
            db.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                } else {
                    console.log(res.rows[0]);

                }
            })
            res.sendFile(path.join(__dirname + '/public/signIn.html'));
        });
    })
    .post('/beginningBalance', (req, res) => {
        let amount = req.body.startingTotal;
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            const query = {
                text: "INSERT INTO public.transactions(date, company, amount, user_id, total) VALUES(now(), 'Balance', $1, $2, $3)",
                values: [amount, req.session.id, amount]
            }

            // callback
            db.query(query, (err, response) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    console.log(response.rows[0]);
                }
                res.sendFile(path.join(__dirname + '/public/transactions.html'));
            })
        });
    })
    .post('/transactions', (req, res) => {
        let company = req.body.company;
        let date = req.body.date;
        let amount = req.body.amount;
        var total;

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {

            subtractFromTotal(amount, req, function (total) {
                const query = {
                    text: 'INSERT INTO public.transactions(date, company, amount, user_id, total) VALUES($1, $2, $3, $4, $5)',
                    values: [date, company, amount, req.session.id, total],
                }

                // callback
                db.query(query, (err, response) => {
                    if (err) {
                        console.log(err.stack)
                    } else {
                        console.log(response.rows[0])
                        res.sendFile(path.join(__dirname + '/public/transactions.html'));
                    }
                })
            })
        });
    })
    .post('/incomes', (req, res) => {
        let company = req.body.incomeCompany;
        let date = req.body.incomeDate;
        let amount = req.body.incomeAmount;
        var total;

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {

            addToTotal(amount, req, function (total) {
                const query = {
                    text: 'INSERT INTO public.transactions(date, company, amount, user_id, total) VALUES($1, $2, $3, $4, $5)',
                    values: [date, company, amount, req.session.id, total],
                }

                // callback
                db.query(query, (err, response) => {
                    if (err) {
                        console.log(err.stack)
                    } else {
                        console.log(response.rows[0])
                        res.sendFile(path.join(__dirname + '/public/transactions.html'));
                    }
                })
            })
        });
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function subtractFromTotal(amount, req, callback) {
    var total;
    console.log(amount);
    const db = new Client({
        connectionString: connectionString,
        ssl: true
    });
    db.connect().then(() => {
        db.query('SELECT * FROM public.transactions WHERE user_id = $1 ORDER BY id DESC', [req.session.id], function (err, result) {
            total = result.rows[0].total;
            console.log(total);
            total = money.subtract(total, amount);
            console.log(total);
            callback(total);
        })
    })
}

function addToTotal(amount, req, callback) {
    var total;
    console.log(amount);
    const db = new Client({
        connectionString: connectionString,
        ssl: true
    });
    db.connect().then(() => {
        db.query('SELECT * FROM public.transactions WHERE user_id = $1 ORDER BY id DESC', [req.session.id], function (err, result) {
            total = result.rows[0].total;
            console.log(total);
            total = money.add(total, amount);
            console.log(total);
            callback(total);
        })
    })
}
