const express = require('express');
const path = require('path');
const money = require("money-math");
const { Client } = require('pg');
const PORT = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL ||
    'postgres://bwmpfcfxqrhfbe:3267d6d64fd2c27eff703422f6730d9c238727b5d28952c5962a0a160e252dc1@ec2-54-235-193-0.compute-1.amazonaws.com:5432/d5vuvcpd9kneir';


express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/signIn', (req, res) => {
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
    .get('/transactions', (req, res) => {
        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            db.query(`SELECT * FROM public.transactions INNER JOIN public.total ON public.transactions.user_id = public.total.total_user_id`).then(result => {
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
            res.sendFile(path.join(__dirname + '/public/transactions.html'));
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
                text: 'INSERT INTO public.total(total, total_user_id) VALUES($1, $2)',
                values: [amount, 1],
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

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            const query = {
                text: 'INSERT INTO public.transactions(date, company, amount, user_id) VALUES($1, $2, $3, $4)',
                values: [date, company, amount, 1],
            }

            // callback
            db.query(query, (err, response) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    console.log(response.rows[0])
                }
                subtractFromTotal(amount, res, function () {

                    res.sendFile(path.join(__dirname + '/public/transactions.html'));
                })
            })
        });
    })
    .post('/incomes', (req, res) => {
        let company = req.body.incomeCompany;
        let date = req.body.incomeDate;
        let amount = req.body.incomeAmount;

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            const query = {
                text: 'INSERT INTO public.transactions(date, company, amount, user_id) VALUES($1, $2, $3, $4)',
                values: [date, company, amount, 1],
            }

            // callback
            db.query(query, (err, response) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    console.log(response.rows[0])
                }
                addToTotal(amount, res, function () {

                    res.sendFile(path.join(__dirname + '/public/transactions.html'));
                })
            })
        });
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function subtractFromTotal(amount, res, callback) {
    console.log(amount);
    const db = new Client({
        connectionString: connectionString,
        ssl: true
    });
    db.connect().then(() => {
        db.query('SELECT * FROM public.total WHERE total_user_id = 1', function (err, result) {
            let balance = result.rows[0].total;
            console.log(balance);
            balance = money.subtract(balance, amount);
            console.log(balance);
            db.query('UPDATE public.total SET total = $1 WHERE total_user_id = 1', [balance]);
            res.sendFile(path.join(__dirname + '/public/transactions.html'));
        })
    })

    callback(amount);
}

function addToTotal(amount, res, callback) {
    console.log(amount);
    const db = new Client({
        connectionString: connectionString,
        ssl: true
    });
    db.connect().then(() => {
        db.query('SELECT * FROM public.total WHERE total_user_id = 1', function (err, result) {
            let balance = result.rows[0].total;
            console.log(balance);
            balance = money.add(balance, amount);
            console.log(balance);
            db.query('UPDATE public.total SET total = $1 WHERE total_user_id = 1', [balance]);
            res.sendFile(path.join(__dirname + '/public/transactions.html'));
        })
    })

    callback(amount);
}
