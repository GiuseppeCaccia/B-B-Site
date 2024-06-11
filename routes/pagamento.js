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

app.post('/pagamento', pagamento);

async function pagamento(req,res){
  let emailProp=req.body.emailProp;
  let emailCliente=req.body.emailCliente;
  let nome_str=req.body.nome_str;
  let arrivo=req.body.arrivo.split('/');
  let ritorno=req.body.ritorno.split('/');
  let data_arrivo = arrivo[2] + arrivo[1] + arrivo[0];
  let data_ritorno = ritorno[2] + ritorno[1] + ritorno[0];
  let oggi = new Date();
  const db = await connectDB(configDB);
  try{
    await withTransaction(db, async()=>{
      let sqlQuery="UPDATE prenotazione SET pagato=1 WHERE ref1_client = ? AND str_prop1=? AND str_prenotata=? AND data_arrivo=? AND data_ritorno=?";
      results=await db.query(sqlQuery, [emailCliente, emailProp, nome_str, data_arrivo, data_ritorno]).catch(err=>{ throw err; });
    });
    db.end();
    let info = await transporter.sendMail({
      from: 'TeamMaag12@gmail.com', //Soggetto
      to: [emailCliente, emailProp],  // Destinatari
      subject: 'Pagamento effettuato presso la struttura ' + nome_str, // Oggetto della Mail
      text: 'Il pagamento della prenotazione in data ' + req.body.arrivo + '-' + req.body.ritorno + ' di euro ' + req.body.totale + '€ presso la struttura ' + nome_str + ' è andato a buon fine'
    });
  }
  catch (err) {
  }
  const db1 = await connectDB(configDB);
  try{
    await withTransaction(db1, async()=>{
      let sqlQuery1 = "SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit FROM struttura,prenotazione,immagine WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop1 = ref_prop AND ref_nome_str = nome_str AND ref1_client = ? GROUP BY data_arrivo;";
      results = await db1.query(sqlQuery1, emailCliente).catch(err=>{ throw err; });
    });
    db1.end();
  }
  catch (err) {
  }
  res.render('gestionePrenotazione/cronologiaPrenotazioni.ejs', {
    errormessage : 'Il pagamento è andato a buon fine',
    prenotazione : results,
    data : oggi
  });
}

module.exports = app;
