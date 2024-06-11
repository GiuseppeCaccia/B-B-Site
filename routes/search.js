const express = require('express');
const app = express();
const session = require('express-session');

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');
const {verificaDisponibilità} = require('../public/js/checkPosti');
const {differenzaDate} = require('../public/js/checkGiorni');

app.use(session({
  secret: 'XANAX12',
  resave: false,
  saveUninitialized: true
}));

app.post('/paginaDettaglio', visualizzaDettaglio);
app.post('/ricercaAvanzata', ricercaAvanzata);

async function visualizzaDettaglio(req,res){
  let struttura_proprietario = req.body.prop;
  let nome_struttura = req.body.nomeStr;
  let tipologia = req.body.tipologia;
  let struttura=req.session.strDisponibili;
  let giorniTotali = 0;
  let result = [];
  giorniTotali += differenzaDate(req.session.dataArr,req.session.dataRit);
  let totale = 0;
  for(i=0; i<struttura.length; i++){
    if(struttura[i].nome_str==nome_struttura){
      result=struttura[i];
      req.session.strPrenotata = result;
      if(tipologia == "B&B"){
        if(req.session.noTax =="on"){
          totale = struttura[i].prezzo * giorniTotali * req.session.ospiti;
          req.session.totale = totale;
        }
        else{
          totale = (req.session.adulti * struttura[i].tassa_di_soggiorno + req.session.ragazzi * (struttura[i].tassa_di_soggiorno / 2)) * giorniTotali + struttura[i].prezzo * giorniTotali * req.session.ospiti;
          req.session.totale = totale;
        }
      }
      else{
        if(req.session.noTax =="on"){
          totale = struttura[i].prezzo * giorniTotali;
          req.session.totale = totale;
        }
        else{
          totale = (req.session.adulti * struttura[i].tassa_di_soggiorno + req.session.ragazzi * (struttura[i].tassa_di_soggiorno / 2)) * giorniTotali + struttura[i].prezzo * giorniTotali;
          req.session.totale = totale;
        }
      }
    }
  }
  const db = await connectDB(configDB);
  let results = {};
  try{
    await withTransaction(db, async()=>{
      let sqlQuery="SELECT * from recensione, struttura WHERE  ref_prop = str_prop AND nome_str = str_recensita AND nome_str = ? AND ref_prop = ?";
      results = await db.query(sqlQuery, [nome_struttura, struttura_proprietario]).catch(err=>{ throw err; });
    });
    db.end();
    req.session.rec=results;
  }
  catch(err){
    throw err;
  }
  res.render("gestionePrenotazione/paginaDettaglio.ejs", {
    sessione : req.session.cliente || undefined,
    errormessage :'',
    dettaglio:result,
    recensione:req.session.rec,
    totale: req.session.totale,
    data_arrivo:req.session.dataArr,
    data_ritorno:req.session.dataRit,
    bambini : req.session.bambini,
    ragazzi : req.session.ragazzi,
    adulti : req.session.adulti
  });
}

async function ricercaAvanzata(req,res){
  req.session.noTax = "off";
  let destinazione = req.body.destinazione;
  let dataArr = req.body.data_arrivo.split('/');
  req.session.dataArr = dataArr[2] + '/' + dataArr[0] + '/' + dataArr[1];
  let dataRit = req.body.data_ritorno.split('/');
  req.session.dataRit = dataRit[2] + '/' + dataRit[0] + '/' + dataRit[1];
  let bambini = +req.body.bambini || 0;
  req.session.bambini = bambini;
  let ragazzi = +req.body.ragazzi || 0;
  req.session.ragazzi = ragazzi;
  let adulti = +req.body.adulti || 0;
  req.session.adulti = adulti;
  let numOspiti = bambini + ragazzi + adulti;
  req.session.ospiti = numOspiti;
  let tipo = req.body.tipologia || '%';
  if(req.body.noTax == "on"){
    req.session.noTax = "on";
  }
  if(tipo == 0){
    tipo = '%';
  }
  else if(tipo == 1){
    tipo = 'Casa Vacanza'
  }
  else if(tipo == 2){
    tipo = 'B&B'
  }
  let distanza = +req.body.distanzaKm || 1000;
  let prezzo = +req.body.prezzo1 || 0;
  let valutazione = +req.body.stars5 || +req.body.stars4 || +req.body.stars3 || +req.body.stars2 || +req.body.stars1 || 0;
  let param_str = [destinazione, destinazione, valutazione, prezzo, distanza, tipo, +req.body.booking1 || '%', +req.body.booking2 || '%',+req.body.booking3 || '%',+req.body.booking4 || '%', +req.body.booking5 || '%', +req.body.booking6 || '%', +req.body.booking7 || '%', +req.body.booking8 || '%', +req.body.booking9 || '%', +req.body.booking10 || '%', +req.body.booking11 || '%', +req.body.booking12 || '%', +req.body.booking13|| '%'];
  let valoriRicerca = {data_arrivo : req.body.data_arrivo, data_ritorno : req.body.data_ritorno, destinazione : req.body.destinazione, bambini : req.body.bambini, ragazzi : req.body.ragazzi, adulti : req.body.adulti};
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
    try{
      await withTransaction(db, async()=>{
        let sqlQuery="SELECT * FROM struttura,servizi_struttura,immagine WHERE ref_prop1=ref_prop AND ref_nome_str=nome_str AND ref_prop2=ref_prop AND nome_str=nome_str2 AND (comune LIKE ? OR nome_str LIKE ?) AND valutazione_struttura >=? AND prezzo <=? AND distanza_km_centro <=? AND tipologia LIKE ? AND colazione LIKE ? AND wifi LIKE ? AND piscina LIKE ? AND giardino LIKE ? AND parcheggio LIKE ? AND tv LIKE ? AND libri LIKE ? AND palestra LIKE ? AND animali LIKE ? AND cucina LIKE ? AND fumare LIKE ? AND doccia LIKE ? AND condizionatore LIKE ?;";
        results = await db.query(sqlQuery, param_str).catch(err=>{
          res.render('index.ejs',{
            errormessage : "Errore Interno del server",
            sessione : req.session.cliente || undefined,
            immagine : req.session.topStrutture
          });
        });
      });
      db.end();
    }
    catch (err) {
      console.log(err);
    }
    if(results.length == 0){
      res.render('gestionePrenotazione/paginaDiRicerca.ejs',{
        errormessage : "Non ci sono strutture disponibili con questi parametri immessi, Riprova con altri parametri",
        sessione : req.session.cliente || undefined,
        struttura: req.session.strDisponibili,
        ricerca : valoriRicerca
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
  }
}

module.exports = app;
