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

app.post('/EliminaStruttura', EliminaStruttura);
app.get('/modificaStruttura', ModificaStruttura);
app.post('/InvioModifica', InvioModifica)


async function InvioModifica(req,res){
  let calcolo_ospiti = +req.body.singola + +req.body.doppia*2 + +req.body.tripla*3 + +req.body.quadrupla*4
  var servizi = [req.body.booking1, req.body.booking2, req.body.booking3, req.body.booking4, req.body.booking5, req.body.booking6, req.body.booking7, req.body.booking8, req.body.booking9, req.body.booking10, req.body.booking11, req.body.booking12, req.body.booking13];
  for(var j = 0; j <= 12; j++){
    if(servizi[j] == 'on'){
      servizi[j] = 0;
    }
    else{
      servizi[j] = 1;
    }
  }

  let valori = [req.body.nome_str_nuova, req.body.descrizione, calcolo_ospiti , req.body.singola, req.body.doppia, req.body.tripla, req.body.quadrupla, req.body.prezzo, req.body.tassa, req.body.distanza, req.body.indirizzo, req.body.civico, req.body.comune, req.body.cap, req.body.telefono, req.body.nome_str_vecchia, req.session.emailProp,
                servizi[0], servizi[1], servizi[2], servizi[3], servizi[4], servizi[5], servizi[6], servizi[7], servizi[8], servizi[9], servizi[10], servizi[11], servizi[12], req.session.emailProp, req.body.nome_str_nuova];


  let sqlQuery = ["UPDATE struttura SET nome_str = ?, descrizione_struttura = ?, num_ospiti = ?, camera_singola = ?, camera_doppia = ?, camera_tripla = ?, camera_quadrupla = ?, prezzo = ?, tassa_di_soggiorno = ?, distanza_km_centro = ?, indirizzo = ?, civico = ?, comune = ?, cap = ?, telefono = ? WHERE nome_str = ? AND ref_prop = ?",
                  "UPDATE servizi_struttura SET colazione = ?, wifi = ?, piscina = ?, giardino = ?, parcheggio = ?, tv = ?, libri = ?, palestra = ?, animali = ?, cucina = ?, fumare = ?, doccia = ?, condizionatore = ? WHERE ref_prop2 = ? AND nome_str2 = ?"
                 ];
  const db = await connectDB(configDB);
  try{
      await withTransaction(db, async()=>{
        results = await db.query(sqlQuery.join(';'), valori).catch(err=>{ throw err; });
      });
      db.end();
  }
  catch (err) {
  }
  const db1 = await connectDB(configDB);
  try{
    await withTransaction(db1, async()=>{
      sqlQuery = ["SELECT *, DATE_FORMAT(data_ultimo_rendiconto, '%d/%m/%Y') AS data_rendiconto, DATE_FORMAT(DATE_ADD(data_ultimo_rendiconto, INTERVAL 90 DAY), '%d/%m/%Y') AS data_rendiconto_successivo FROM struttura,immagine,servizi_struttura WHERE ref_prop = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str AND ref_prop2 = ref_prop AND nome_str2 = nome_str GROUP BY nome_str",
                  "SELECT MONTHNAME(data_ritorno) as mesi,DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, nome_str, pagato, confermato, num_ospiti, ospitiPrenotati, importo FROM prenotazione,struttura WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop = ?"];
      let results = await db1.query(sqlQuery.join(';'), [req.session.emailProp, req.session.emailProp]).catch(err=>{ throw err; });
      req.session.struttura = results[0];
      req.session.guadagni = results[1];
      res.render('gestioneStrutture/selezioneModificaStruttura.ejs', {
        errormessage : 'La struttura è stata modificata con successo',
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


async function ModificaStruttura(req,res){
  let nome_str_modifica = req.query.nome_str;
  let struttura_modifica = {};
  let strutture = req.session.struttura;
  for(i=0; i < strutture.length ;i++){
    if (strutture[i].nome_str == nome_str_modifica){
      struttura_modifica = strutture[i];
    } 
  };
  res.render('gestioneStrutture/modificaStruttura.ejs', {
    errormessage : '',
    emailProprietario : req.session.emailProp,
    struttura : struttura_modifica
  });
}

async function EliminaStruttura(req,res){
  const db = await connectDB(configDB);
  try{
    await withTransaction(db, async()=> {
      let sqlQuery="DELETE FROM struttura WHERE ref_prop = ? AND nome_str = ?";
      results=await db.query(sqlQuery, [req.session.emailProp, req.body.nome_str]).catch(err=>{ throw err; });
    });
    db.end();
  } 
  catch (err){
  }
  const db1 = await connectDB(configDB);
  try{
          await withTransaction(db1, async()=>{
            let sqlQuery2 = ["SELECT *, DATE_FORMAT(data_ultimo_rendiconto, '%d/%m/%Y') AS data_rendiconto, DATE_FORMAT(DATE_ADD(data_ultimo_rendiconto, INTERVAL 90 DAY), '%d/%m/%Y') AS data_rendiconto_successivo FROM struttura,immagine WHERE ref_prop = ? AND ref_prop = ref_prop1 AND ref_nome_str = nome_str GROUP BY nome_str",
                             "SELECT MONTHNAME(data_ritorno) as mesi,DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit, nome_str, pagato, confermato, num_ospiti, ospitiPrenotati, importo FROM prenotazione,struttura WHERE str_prop1 = ref_prop AND str_prenotata = nome_str AND ref_prop = ?"];
            results = await db1.query(sqlQuery2.join(';'), [req.session.emailProp, req.session.emailProp]).catch(err=>{ throw err; });
            req.session.struttura = results[0];
            req.session.guadagni = results[1];
          }); 
          db1.end();
    }
    catch (err) {
    }
    res.render('gestioneStrutture/selezioneModificaStruttura.ejs', {
      errormessage : 'Hai eliminato la struttura con successo',
      emailProprietario : req.session.emailProp,
      struttura : req.session.struttura,
      guadagni : req.session.guadagni,
    });
}


module.exports = app;

