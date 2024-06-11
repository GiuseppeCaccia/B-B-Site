const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');

app.use(session({
  secret: 'XANAX12',
  resave: false,
  saveUninitialized: true
}));

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');

app.get('/gestioneStrutture/paginaProprietario.ejs', paginaProprietario);
app.post('/LoginProprietario', LoginProprietario);
app.post('/LoginCliente', LoginCliente);

async function paginaProprietario(req,res){
    res.render('gestioneStrutture/paginaProprietario.ejs', {
      errormessage :'',
      immagine : req.session.topStrutture,
      sessione : undefined,
    });
}

async function LoginCliente(req,res){
    const db = await connectDB(configDB);
    let results = {};
    let email_cliente = req.body.email_cliente;
    let password_cliente = req.body.password_cliente;
    try{
      await withTransaction(db, async()=>{
        let sqlQuery = "SELECT * FROM cliente WHERE email_client = ?";
        results = await db.query(sqlQuery, [email_cliente]).catch(err=>{ throw err; });
      });
      db.end();
    }
    catch (err) {
    }
    const db1 = await connectDB(configDB);
    try{
      if (results[0] == null){
        res.render('autenticazione/accesso', {errormessage :'Email o password inesistenti!!'});
      }
      else{
        bcrypt.compare(password_cliente,results[0].password_client, async function(err,result){
          await withTransaction(db1, async()=>{
            if(result == true){
              req.session.cliente = results;
              req.session.emailCliente = email_cliente;
              res.render('index', {
                errormessage: '',
                sessione : req.session.cliente,
                immagine : req.session.topStrutture
              });
            }
            else{
              res.render('autenticazione/accesso', {
                errormessage: 'La password inserita è errata'
              });
           }
         });
       });
     }
   }
   catch (err) {

   }
}

async function LoginProprietario(req,res){
    const db = await connectDB(configDB);
    let results = {};
    let email_prop = req.body.email_prop;
    let password_prop = req.body.password_prop;
    try{
      await withTransaction(db, async()=>{
        let sqlQuery = "SELECT * FROM proprietario WHERE email_prop = ?";
        results = await db.query(sqlQuery, [email_prop]).catch(err=>{ throw err; });
      });
      db.end();
    }
    catch (err) {
    }
    const db1 = await connectDB(configDB);
    try{
      if (results[0] == null){
        res.render('autenticazione/accesso', {errormessage :'Email o password inesistenti!'});
      }
      else{
        bcrypt.compare(password_prop,results[0].password_prop,async function(err,result){
          await withTransaction(db1, async()=>{
              if(result == true){
                  req.session.emailProp = email_prop;
                  sqlQuery = ["SELECT *, DATE_FORMAT(data_ultimo_rendiconto, '%d/%m/%Y') AS data_rendiconto, DATE_FORMAT(DATE_ADD(data_ultimo_rendiconto, INTERVAL 90 DAY), '%d/%m/%Y') AS data_rendiconto_successivo FROM struttura,immagine,servizi_struttura WHERE ref_prop = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str AND ref_prop2 = ref_prop AND nome_str2 = nome_str GROUP BY nome_str",
                              "SELECT MONTHNAME(data_ritorno) as mesi,DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, nome_str, pagato, confermato, num_ospiti, ospitiPrenotati, importo FROM prenotazione,struttura WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop = ?"];
                  let results = await db1.query(sqlQuery.join(';'), [email_prop, email_prop]).catch(err=>{ throw err; });
                  req.session.struttura = results[0];
                  req.session.guadagni = results[1];
                  res.render('gestioneStrutture/paginaProprietario', {
                      errormessage: '',
                      struttura : req.session.struttura,
                      guadagni : req.session.guadagni,
                      emailProprietario : req.session.emailProp
                  });
              }
              else{
                  res.render('autenticazione/accesso', {
                      errormessage: 'La password inserita è errata'
                  });
              }
          });
          db1.end();
        });
      }
    }
    catch (err) {
    }
}

module.exports = app;
