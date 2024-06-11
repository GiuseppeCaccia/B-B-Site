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
const {verificaDisponibilità} = require('../public/js/checkPosti');
const {differenzaDate} = require('../public/js/checkGiorni');

//GET della pagina principale
app.get('/' , home);

//bottone registrati  da pagina index
app.get('/registrazione', registrazione);
app.get('/accesso', accesso);
app.get('/cronologiaPrenotazioni', cronologiaPrenotazioni);
app.get('/LogoutCliente', LogoutCliente);

//bottone invia da pagina index
app.post('/ricerca', ricerca);


async function home(req,res){
  const db = await connectDB(configDB);
  let results = {};
  try{
    await withTransaction(db, async()=>{
      let sqlQuery= "SELECT * FROM struttura, immagine WHERE valutazione_struttura > 4 AND ref_prop1 = ref_prop AND ref_nome_str=nome_str; " ;
      results = await db.query(sqlQuery).catch(err=>{ throw err; });
      req.session.topStrutture = results;
      res.render('../views/index',{
        immagine : req.session.topStrutture,
        sessione : req.session.cliente || undefined,
        errormessage : ''
      });
    });
  }
  catch (err) {
    console.log(err);
  }
}

async function accesso(req,res){
  res.render('../views/autenticazione/accesso.ejs',{
    errormessage : ''
  });
}

async function registrazione(req,res){
  res.render('../views/autenticazione/registrazione.ejs', {
    errormessage :'',
  });
}

async function ricerca(req,res){
  let destinazione = req.body.destinazione;
  let dataArr = req.body.data_arrivo.split('/');
  req.session.dataArr = dataArr[2] + '/' + dataArr[0] + '/' + dataArr[1];       //catturo la variabile per usarla in fase di prenotazione
  let dataRit = req.body.data_ritorno.split('/');
  req.session.dataRit = dataRit[2] + '/' + dataRit[0] + '/' + dataRit[1];       //catturo la variabile per usarla in fase di prenotazione
  let bambini = +req.body.bambini || 0;                                         //se uno dei campi è vuoto inserisco 0
  req.session.bambini = bambini;
  let ragazzi = +req.body.ragazzi || 0;
  req.session.ragazzi = ragazzi;
  let adulti = +req.body.adulti || 0;
  req.session.adulti = adulti;
  req.session.noTax = req.body.check_categoria;
  let numOspiti = bambini + ragazzi + adulti;
  req.session.ospiti = numOspiti;
  let giorniTotali = 0;
  giorniTotali += differenzaDate(req.session.dataArr,req.session.dataRit);
  if ( giorniTotali > 28 ){
    res.render('index.ejs', {
      errormessage : "Impossibile prenotare una struttura per piu di 28 giorni",
      sessione : req.session.emailCliente,
      immagine : req.session.topStrutture
    });
  }
  else{
    const db = await connectDB(configDB);
    let results = {};
    let valoriRicerca = {data_arrivo : req.body.data_arrivo, data_ritorno : req.body.data_ritorno, destinazione : req.body.destinazione, bambini : req.body.bambini, ragazzi : req.body.ragazzi, adulti : req.body.adulti}
    try{
      await withTransaction(db, async()=>{
        let sqlQuery = "SELECT * FROM struttura, immagine,servizi_struttura WHERE (comune LIKE ? OR nome_str LIKE ?) AND ref_prop1 = ref_prop AND ref_nome_str=nome_str AND ref_prop2 = ref_prop AND nome_str = nome_str2; ";
        results = await db.query(sqlQuery, [destinazione, destinazione]).catch(err=>{
          res.render('index.ejs',{
            errormessage : "Errore Interno del server",
            sessione : req.session.cliente || undefined,
            immagine : req.session.topStrutture
          });
        });
        if(results.length == 0){
          res.render('index.ejs',{
            errormessage : "Non ci sono strutture disponibili con questi parametri immessi, Riprova con altri parametri",
            sessione : req.session.cliente || undefined,
            immagine : req.session.topStrutture
          });
        }
        else{
          let checkStrDisponibili = [];
          let strDisponibili = [];
          let flagCasa = 0;
          let flagBb = 0;
          for (i = 0 ; i< results.length ; i++){
            checkStrDisponibili = verificaDisponibilità(numOspiti, results[i].tipologia, results[i].num_ospiti, results[i].camera_singola, results[i].camera_doppia, results[i].camera_tripla, results[i].camera_quadrupla );
            if(Array.isArray(checkStrDisponibili)){
              if(checkStrDisponibili.length == 1 && flagCasa == 0){
                req.session.casaVacanzaPosti = checkStrDisponibili;
                flagCasa = 1;
              }
              if(checkStrDisponibili.length > 1 && flagBb == 0){
                req.session.bbPosti = checkStrDisponibili;
                flagBb = 1;
              }
              strDisponibili.push(results[i]);
            }
          }
          req.session.strDisponibili = strDisponibili;
          if(req.session.strDisponibili.length == 0){
            res.render('index.ejs',{
              errormessage : "Non ci sono strutture disponibili con questi parametri immessi, Riprova con altri parametri",
              sessione : req.session.cliente || undefined,
              immagine : req.session.topStrutture
            });
          }
          else{
            res.render("gestionePrenotazione/paginaDiRicerca.ejs", {
              errormessage : "",
              sessione : req.session.cliente || undefined,
              struttura: req.session.strDisponibili,
              ricerca : valoriRicerca
            });
          }
        }
      });
    }
    catch (err) {
      console.log(err);
    }
  }

}

async function cronologiaPrenotazioni(req,res){
  const db = await connectDB(configDB);
  let results = {}
  var oggi = new Date();
  try{
    await withTransaction(db, async()=>{
    let sqlQuery = "SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, data_ritorno FROM struttura,prenotazione,immagine WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop1 = ref_prop AND ref_nome_str = nome_str AND ref1_client = ? AND confermato = 1 GROUP BY data_arrivo;";
    results = await db.query(sqlQuery, req.session.emailCliente).catch(err=>{ throw err; });
    });
    db.end();
  }
  catch (err) {
  }
  res.render('gestionePrenotazione/cronologiaPrenotazioni.ejs', {
    immagine : req.session.topStrutture,
    sessione : req.session.cliente,
    errormessage : '',
    data : oggi,
    prenotazione : results,
  });
}

async function LogoutCliente(req,res){
  req.session.cliente = undefined;
  req.session.email_client = undefined;
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
