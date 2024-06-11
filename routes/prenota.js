const express = require('express');
const app = express();
const session = require('express-session');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TeamMaag12@gmail.com',
    pass: 'explosion14#'
  }
});

app.use(session({
    secret: 'XANAX12',
    resave: false,
    saveUninitialized: true
  }));

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');
const {differenzaDate} = require('../public/js/checkGiorni');

app.post('/prenotazioneCliente', prenota);

async function prenota(req,res){
  if(req.session.emailCliente == undefined){
    res.render('autenticazione/accesso.ejs', {
      errormessage: 'Effettua l\' accesso prima di prenotare!'
    });
  }
  else{
    let data1;
    let data2;
    let giorniTotali = differenzaDate(req.session.dataArr, req.session.dataRit);
    let nome_str_prenotata = req.body.nome_str_prenotata;
    let emailprop = req.body.emailproprietario;
    const db = await connectDB(configDB);
    let results = {};
    try{
      await withTransaction(db, async()=>{
        let sqlQuery="SELECT DISTINCT DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS date_client_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS date_client_rit FROM prenotazione,cliente WHERE ref1_client = email_client AND email_client = ? AND str_prenotata = ? AND str_prop1 = ? AND pagato = 1;";
        results = await db.query(sqlQuery, [req.session.emailCliente, nome_str_prenotata, emailprop]).catch(err=>{ throw err; });
        for ( let i = 0 ; i<results.length; i++){
          data1 = results[i].date_client_arr.split('/');
          data1 = data1[2] + '/' + data1[1] + '/' + data1[0];
          data2 = results[i].date_client_rit.split('/');
          data2 = data2[2] + '/' + data2[1] + '/' + data2[0];
          giorniTotali += differenzaDate(data1,data2);
        }
      });
      db.end();
    }
    catch(err){
      throw err;
    }
    if ( giorniTotali > 28 ){
      res.render('index.ejs', {
        errormessage : "Impossibile prenotare una struttura per piu di 28 giorni",
        sessione : req.session.emailCliente,
        immagine : req.session.topStrutture
      });
    }
    else{
      const db2 = await connectDB(configDB);
      let results = {};
      arrivo = req.session.dataArr.split('/');
      ritorno = req.session.dataRit.split('/');
      data_arrivo = arrivo[0] + '/' + arrivo[1] + '/' + arrivo[2];
      data_ritorno = ritorno[0] + '/' + ritorno[1] + '/' + ritorno[2];
      let valori = {ref1_client : req.session.emailCliente, str_prop1 : emailprop, str_prenotata : nome_str_prenotata, data_arrivo: data_arrivo, data_ritorno : data_ritorno, ospitiPrenotati : req.session.ospiti, confermato: 0, pagato: 0, comunicato : 0, importo: req.session.totale };
      try{
        await withTransaction(db2, async()=>{
          let sqlQuery = "INSERT INTO prenotazione SET ?";
          results = await db2.query(sqlQuery, valori).catch(err=>{});
        });
        db2.end();
      }
      catch(err){
        throw err;
      }
      ospiti = req.session.adulti + req.session.ragazzi + req.session.bambini;
      let text = 'Gentile proprietario la informiamo che la sua struttura è interessata ad un possibile cliente che ha effettuato una prenotazione per ' + ospiti + ' ospiti' + ', la preghiamo di rispondere il piu presto possibile';
      let info = await transporter.sendMail({
        from: 'TeamMaag12@gmail.com', //Soggetto
        to: emailprop,  // Destinatari
        subject: 'Richiesta di prenotazione in stato di pending!!', // Oggetto della Mail
        html: "<a href = http://localhost:8080/accesso.ejs > Link alla pagina di gestione richieste del nostro sito </a>" + '\n' + text  //codice html
      });
      res.render('index.ejs', {
        errormessage : "La tua prenotazione è andata a buon fine",
        sessione : req.session.cliente,
        immagine : req.session.topStrutture
      });
    }
  }
}

module.exports = app;
