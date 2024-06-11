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
const { configMail } = require('../database/configMail');

app.post("/invioRendiconto", calcolaRendiconto);

async function calcolaRendiconto(req,res){
  let dati_str;
  let totale;
  let dataString="";
  let results = {};
  let rendiconto_precedente = req.body.data_rendiconto_precendente.split("/"); 
  let rendiconto_successivo = req.body.data_rendiconto_successivo.split("/");
  var data_precedente = rendiconto_precedente[2] + '/' + rendiconto_precedente[1] + '/' + rendiconto_precedente[0];
  var data_successiva = rendiconto_successivo[2] + '/' + rendiconto_successivo[1] + '/' + rendiconto_successivo[0];

  const db = await connectDB(configDB);
  try{
      await withTransaction(db, async()=>{
      let sqlQuery = "SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_Arrivo, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_Ritorno FROM struttura,prenotazione WHERE ref_prop = str_prop1 AND nome_str = str_prenotata AND pagato = 1 AND ref_prop = ? AND nome_str = ? AND data_ritorno BETWEEN ? AND ?;";
      results = await db.query(sqlQuery, [req.session.emailProp, req.body.nome_str, data_precedente, data_successiva]).catch(err=>{ throw err; });
      dati_str = results;
      });
      db.end();
  }
  catch (err) {
  }
  const db1 = await connectDB(configDB);
  try{
      await withTransaction(db1, async()=>{
      let sqlQuery = "SELECT COUNT(*) AS totaleprenotazioni ,SUM(tassa_di_soggiorno) AS totaleTasse FROM struttura,prenotazione WHERE ref_prop = str_prop1 AND nome_str = str_prenotata AND pagato = 1 AND ref_prop = ? AND nome_str = ? AND data_ritorno BETWEEN ? AND ?;";
      results = await db1.query(sqlQuery, [req.session.emailProp, req.body.nome_str, data_precedente, data_successiva]).catch(err=>{ throw err; });
      totale = results;
      });
      db1.end();
      for ( let i = 0; i<dati_str.length; i++){
        dataString += "Tassa di soggiorno: "+ dati_str[i].tassa_di_soggiorno.toString() +"€"+" Data inizio soggiorno: " + dati_str[i].data_Arrivo + " Data fine soggiorno: " + dati_str[i].data_Ritorno+"\n";
      }
      dataString += "Totale Prenotazioni: " + totale[0].totaleprenotazioni.toString()+" Totale tasse pagate: "+ totale[0].totaleTasse.toString()+"€"+"\n";
      if(totale[0].totaleTasse.toString() == null){ //DA RIVEDERE
        dataString = "Nessuna prenotazione ricevuta";
      }
      let info = await transporter.sendMail({
          from: 'TeamMaag12@gmail.com', //Soggetto
          to: "alextorre95@gmail.com",  // Destinatari
          subject: 'Rendiconto trimestrale della struttura: ' +  req.body.nome_str + ' periodo: ' + data_precedente + '-' + data_successiva, // Oggetto della Mail
          text: dataString
      });
  }
  catch (err) {
  }
  const db2 = await connectDB(configDB);
  try{
      await withTransaction(db2, async()=>{
      let sqlQuery = "UPDATE struttura SET data_ultimo_rendiconto = ? WHERE ref_prop = ? AND nome_str = ?";
      results = await db2.query(sqlQuery, [data_successiva, req.session.emailProp, req.body.nome_str]).catch(err=>{ throw err; });
      dati_str = results;
      });
      db2.end();
  }
  catch (err) {
  }
  const db3 = await connectDB(configDB);
  try{
    await withTransaction(db3, async()=>{
      sqlQuery = ["SELECT *, DATE_FORMAT(data_ultimo_rendiconto, '%d/%m/%Y') AS data_rendiconto, DATE_FORMAT(DATE_ADD(data_ultimo_rendiconto, INTERVAL 90 DAY), '%d/%m/%Y') AS data_rendiconto_successivo FROM struttura,immagine,servizi_struttura WHERE ref_prop = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str AND ref_prop2 = ref_prop AND nome_str2 = nome_str GROUP BY nome_str",
                  "SELECT MONTHNAME(data_ritorno) as mesi,DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, nome_str, pagato, confermato, num_ospiti, ospitiPrenotati, importo FROM prenotazione,struttura WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop = ?"];
      results = await db3.query(sqlQuery.join(';'), [req.session.emailProp, req.session.emailProp]).catch(err=>{ throw err; });
      req.session.struttura = results[0];
      req.session.guadagni = results[1];
      res.render('gestioneStrutture/rendiconto.ejs', {
        errormessage : 'Rendiconto inviato con successo',
        emailProprietario : req.session.emailProp,
        struttura : req.session.struttura,
        guadagni : req.session.guadagni
      });
    });
    db3.end();
  }
  catch (err) {
  }
}


module.exports = app;
