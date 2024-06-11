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

app.post('/ConfermaPrenotazione', ConfermaPrenotazione);

async function ConfermaPrenotazione(req,res){
  let str_prenotata = req.body.str_prenotata;
  let data_arrivo = req.body.data_arr;
  let email_client = req.body.email_client
  let sqlQuery2 = "";
  let prenotazione = "";
  if(req.body.conferma == "1"){
      sqlQuery2 = "UPDATE prenotazione SET confermato = 1 WHERE confermato = 0 AND str_prenotata = ? AND str_prop1 = ? AND ref1_client = ? AND data_arrivo = ?";
      let results = {};
      try{
          let info = await transporter.sendMail({
            from: 'TeamMaag12@gmail.com', //Soggetto
            to: email_client,  // Destinatari
            subject: 'Richiesta di conferma accettata!!', // Oggetto della Mail
            text: 'Gentile cliente la informiamo che la sua prenotazione è stata accolta dal proprietario della struttura', // Testo da inserire nel corpo della mail
            html: "<a href = http://localhost:8080> Accedi alla tua area personale per completare il pagamento </a>",  //codice html
      });
      prenotazione = "Prenotazione confermata"
      }
      catch (err){
      }
  }
  else{
      sqlQuery2 = "DELETE FROM prenotazione WHERE confermato = 0 AND str_prenotata = ? AND str_prop1 = ? AND ref1_client = ? AND data_arrivo = ?";
      try{
            let info = await transporter.sendMail({
              from: 'TeamMaag12@gmail.com', //Soggetto
              to: email_client,  // Destinatari
              subject: 'Richiesta di conferma rifiutata!!', // Oggetto della Mail
              text: 'Gentile cliente la informiamo che la sua prenotazione non è stata accolta dal proprietario della struttura', // Testo da inserire nel corpo della mail
              html: "<a href = http://localhost:8080> Link alla home per effettuare una nuova prenotazione</a>",  //codice html
            });
          prenotazione = "Prenotazione cancellata"
      }
      catch (err){
      }
  }
  const db2 = await connectDB(configDB);
  try{
        await withTransaction(db2, async()=>{
          arrivo = data_arrivo.split('/');
          data_arrivo = arrivo[2] + '/' + arrivo[1] + '/' + arrivo[0];
          let param = [str_prenotata, req.session.emailProp, email_client, data_arrivo];
          results = await db2.query(sqlQuery2, param).catch(err=>{ throw err; });;
        });
        db2.end();
  }
  catch (err) {
  }
  const db3 = await connectDB(configDB);
  try{
    await withTransaction(db3, async()=>{
      let sqlQuery3 = "SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit FROM immagine, struttura, prenotazione WHERE str_prenotata = nome_str AND nome_str = ref_nome_str AND ref_prop = ref_prop1 AND str_prop1 = ref_prop AND confermato = 0 AND ref_prop = ?";
      results = await db3.query(sqlQuery3, req.session.emailProp).catch(err=>{ throw err; });
      res.render("gestioneStrutture/gestioneRichieste.ejs", {
        errormessage : '',
        struttura : results,
        emailProprietario : req.session.emailProp
      });
    });
    db3.end();
  }
  catch (err) {
  }
}

module.exports = app;
