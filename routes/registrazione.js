const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

app.use(session({
  secret: 'XANAX12',
  resave: false,
  saveUninitialized: true
}));

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');

app.post('/RegistrazioneCliente', RegistrazioneCliente);
app.post('/RegistrazioneProprietario', RegistrazioneProprietario);

async function RegistrazioneCliente(req,res){
    let password = req.body.password_cliente;
    let password_cliente = "";
    let results = {};
    bcrypt.hash(password, saltRounds, async function(err, hash) {
        password_cliente = hash;
    const db = await connectDB(configDB);
    try{
        await withTransaction(db, async()=>{
            let valoriCliente = {nome_client : req.body.nome_cliente, cognome_client : req.body.cognome_cliente, data_di_nascita_c : req.body.data_di_nascita, email_client : req.body.email_cliente, password_client : password_cliente, telefono : req.body.telefono};
            let sqlQuery = "INSERT INTO cliente SET ?"
                    await db.query(sqlQuery, valoriCliente).catch(err=>{
                    console.log(err);
                    res.render('autenticazione/registrazione', {
                    errormessage: 'Cliente gia esistente!'
                    });
                });
        });
        db.end();
        res.render('autenticazione/accesso', {
            errormessage: '',
        });
    }
    catch (err) {
    }
    });
}

async function RegistrazioneProprietario(req,res){
    let password = req.body.password_prop;
    let password_prop = "";
    let results = {};
    bcrypt.hash(password, saltRounds, async function(err, hash) {
        password_prop = hash;
        const db = await connectDB(configDB);
        try{
            await withTransaction(db, async()=>{
                let valoriProprietario = {nome_prop : req.body.nome_prop, cognome_prop : req.body.cognome_prop, data_di_nascita_p : req.body.data_di_nascita, email_prop : req.body.email_prop, password_prop : password_prop, partita_iva : req.body.piva};
                let sqlQuery = "INSERT INTO proprietario SET ?"
                        await db.query(sqlQuery, valoriProprietario).catch(err=>{
                        console.log(err);
                        res.render('autenticazione/registrazione', {
                        errormessage: 'Proprietario gia esistente!'
                        });
                        db.end();
                    });
            });
            res.render('autenticazione/accesso', {
                errormessage: '',
            });
        }
        catch (err) {
        }
    });
}

module.exports = app;
