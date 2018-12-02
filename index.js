const express = require('express');
const path = require('path');
const { Client } = require('pg');
const PORT = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL ||
    'postgres://bwmpfcfxqrhfbe:3267d6d64fd2c27eff703422f6730d9c238727b5d28952c5962a0a160e252dc1@ec2-54-235-193-0.compute-1.amazonaws.com:5432/d5vuvcpd9kneir';


express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({extended: true}))
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
            db.query(`SELECT * FROM public.transactions`).then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows));
                console.log(JSON.stringify(result.rows));
                db.end();
            });
        });
    })
    .post('/signIn', (req, res) => {
        let name = req.body.name;
        let password = req.body.password;

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            const text = 'INSERT INTO users(name, password) VALUES($1, $2)';
            const values = [name, password];
            db.query(text, values, (err, res) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    console.log(res.rows[0]); 
                }
            });
        });        
    })
    .post('/transactions', (req, res) => {
        let company = req.body.company;
        let date = req.body.date;
        let amount = areq.body.amount;
        let total = calulateTotal(total, amount);

        const db = new Client({
            connectionString: connectionString,
            ssl: true
        });
        const { id } = req.query;
        db.connect().then(() => {
            db.query(`INSERT INTO `).then(result => {

                db.end();
            });
        });        
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
