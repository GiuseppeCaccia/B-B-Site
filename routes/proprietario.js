const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'XANAX12',
  resave: false,
  saveUninitialized: true
}));

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');

app.get('/inserimentoStruttura', inserimentoStruttura);
app.get('/indexProprietario', indexProprietario);
app.post('/strutturaDettaglio', strutturaDettaglio);
app.get('/gestioneRichieste', gestioneRichieste);
app.get('/selezioneModificaStruttura', selezioneModificaStruttura);
app.get('/datiOspite', datiOspite);
app.get('/LogoutProp', LogoutProp);
app.get("/rendicontoTrimestrale", paginaRendiconto)

async function paginaRendiconto(req,res){
  res.render('gestioneStrutture/rendiconto.ejs', {
    errormessage : '',
    emailProprietario : req.session.emailProp,
    struttura : req.session.struttura,
    guadagni : req.session.guadagni
  });
}

async function datiOspite(req,res){
  const db = await connectDB(configDB);
  var oggi = new Date();
  var dataoggi = new Date( oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - 1);
  try{
    await withTransaction(db, async()=> {
      let sqlQuery="SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit from struttura, prenotazione, immagine WHERE  str_prenotata=nome_str AND str_prop1=?  AND ref_prop1=str_prop1 AND  ref_nome_str=nome_str AND comunicato=0 AND pagato=1";
      results= await db.query(sqlQuery, req.session.emailProp).catch(err=> {throw err;});
      res.render('gestioneStrutture/datiOspite.ejs', {
        errormessage : '',
        data : dataoggi,
        prenotazione : results,
        emailProprietario : req.session.emailProp
      });
    });
    db.end();
  }
  catch (err){
  }
};

async function indexProprietario(req,res){
  const db1 = await connectDB(configDB);
  try{
    await withTransaction(db1, async()=>{
      sqlQuery = ["SELECT *, DATE_FORMAT(data_ultimo_rendiconto, '%d/%m/%Y') AS data_rendiconto, DATE_FORMAT(DATE_ADD(data_ultimo_rendiconto, INTERVAL 90 DAY), '%d/%m/%Y') AS data_rendiconto_successivo FROM struttura,immagine,servizi_struttura WHERE ref_prop = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str AND ref_prop2 = ref_prop AND nome_str2 = nome_str GROUP BY nome_str",
                  "SELECT MONTHNAME(data_ritorno) as mesi,DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, nome_str, pagato, confermato, num_ospiti, ospitiPrenotati, importo FROM prenotazione,struttura WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop = ?"];
      let results = await db1.query(sqlQuery.join(';'), [req.session.emailProp, req.session.emailProp]).catch(err=>{ throw err; });
      req.session.struttura = results[0];
      req.session.guadagni = results[1];
      res.render('gestioneStrutture/paginaProprietario.ejs', {
        errormessage : '',
        emailProprietario : req.session.emailProp,
        struttura : req.session.struttura,
        guadagni : req.session.guadagni
      });
    });
  db1.end();
  }
  catch (err) {
  }
}

async function inserimentoStruttura(req,res){
    res.render('gestioneStrutture/inserimentoStruttura.ejs', {
      errormessage : '',
      emailProprietario : req.session.emailProp,
      struttura : req.session.struttura
    });
}

async function gestioneRichieste(req,res){
  const db = await connectDB(configDB);
  let results = {}
  try{
      await withTransaction(db, async()=>{
      let sqlQuery = "SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit FROM immagine, struttura, prenotazione WHERE str_prenotata = nome_str AND nome_str = ref_nome_str AND ref_prop = ref_prop1 AND str_prop1 = ref_prop AND confermato = 0 AND ref_prop = ?";
      results = await db.query(sqlQuery, req.session.emailProp).catch(err=>{ throw err; });
      });
      db.end();
  }
  catch (err) {
  }
  res.render('gestioneStrutture/gestioneRichieste.ejs', {
    errormessage : '',
    emailProprietario : req.session.emailProp,
    struttura : results
  });
}

async function strutturaDettaglio(req,res){
  const db = await connectDB(configDB);
  try{
    await withTransaction(db, async()=>{
      let sqlQuery =["SELECT * FROM struttura,immagine, servizi_struttura WHERE ref_prop = ? AND nome_str = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str AND ref_prop2 = ref_prop AND nome_str2 = nome_str",
                    "SELECT * from recensione, struttura WHERE str_prop = ref_prop AND str_recensita=nome_str AND ref_prop= ? AND nome_str = ?"
                    ];
      results = await db.query(sqlQuery.join(';'), [req.session.emailProp, req.body.nome_str, req.session.emailProp, req.body.nome_str]).catch(err=>{ throw err; });
      });
      db.end();
  }
  catch (err) {
  }

  res.render('gestioneStrutture/strutturaDettaglio.ejs', {
    errormessage : '',
    emailProprietario : req.session.emailProp,
    dettaglio : results[0],
    recensione : results[1]
  });
}

async function selezioneModificaStruttura(req,res){
  res.render('gestioneStrutture/selezioneModificaStruttura.ejs', {
    errormessage : '',
    emailProprietario : req.session.emailProp,
    struttura : req.session.struttura
  });
}

async function LogoutProp(req,res){
  req.session.emailProp = undefined;
  req.session.struttura = undefined;
  req.session.guadagni = undefined;
  const db = await connectDB(configDB);
  let results = {};
  try{
    await withTransaction(db, async()=>{
    let sqlQuery = "SELECT * FROM struttura, immagine WHERE valutazione_struttura > 4 AND ref_prop1 = ref_prop AND ref_nome_str=nome_str;";
    results = await db.query(sqlQuery).catch(err=>{throw (err)});
    req.session.topStrutture = results;
    });
    db.end();

    res.render('index.ejs', {
      errormessage : '',
      immagine : req.session.topStrutture,
      sessione : undefined
    });
  }
  catch (err){
  }
}

module.exports = app;
