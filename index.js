const express = require('express');
const path = require('path');
const { Client } = require('pg');
const PORT = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL ||
    'postgres://bwmpfcfxqrhfbe:3267d6d64fd2c27eff703422f6730d9c238727b5d28952c5962a0a160e252dc1@ec2-54-235-193-0.compute-1.amazonaws.com:5432/d5vuvcpd9kneir';

const db = new Client({
    connectionString: connectionString,
    ssl: true
});

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/signIn', (req, res) => {
        const { id } = req.query;
        db.connect().then(() => {
            db.query('SELECT * FROM public.transactions').then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows[0]));
                console.log(JSON.stringify(result.rows[0]));
                db.end();
            });
        });
    })
    .get('/transactions', (req, res) => {
        const { id } = req.query;
        db.connect().then(() => {
            db.query('SELECT * FROM public.transactions').then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows[0]));
                console.log(JSON.stringify(result.rows[0]));
                db.end();
            });
        });
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
