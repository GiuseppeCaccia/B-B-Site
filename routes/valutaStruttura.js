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

app.post('/inserisciRecensione', inserisciRecensione);

async function inserisciRecensione(req,res){
    let punteggio = req.body.punteggio;
    let commento = req.body.commento;
    let media = 0;
    let dati = [];
    const db = await connectDB(configDB);
    try{
        await withTransaction(db, async()=>{
          let sqlQuery = "";
          if(req.body.conferma == 1){
            sqlQuery = "INSERT INTO recensione VALUES(?,?,?,?,?)";
            dati = [req.body.ref_prop, req.body.nome_str, req.session.emailCliente, punteggio, commento];
          }else{
            sqlQuery = "UPDATE recensione SET commento = ?, punteggio = ? WHERE str_prop = ? AND str_recensita = ? AND ref_client = ?";
            dati = [commento, punteggio, req.body.ref_prop, req.body.nome_str, req.session.emailCliente];
          }
        results = await db.query(sqlQuery, dati).catch(err=>{ throw err; });
        });
        db.end();
    }
    catch (err){
    }
    const db2 = await connectDB(configDB);
    try{
        await withTransaction(db2, async()=>{
        let sqlQuery2 = "SELECT AVG(punteggio) AS media_recensioni FROM recensione WHERE str_recensita = ? AND str_prop = ?;";
        results = await db2.query(sqlQuery2, [req.body.nome_str, req.body.ref_prop]).catch(err=>{ throw err; });
        media = results[0].media_recensioni;
        });
        db2.end();
    }
    catch (err) {
    }
    const db3 = await connectDB(configDB);
    try{
        await withTransaction(db3, async()=>{
            let sqlQuery3 = "UPDATE struttura SET valutazione_struttura = ? WHERE nome_str = ? AND ref_prop = ?;";
            results = await db3.query(sqlQuery3, [media, req.body.nome_str, req.body.ref_prop]).catch(err=>{ throw err; });
        });
        db3.end();
    }
    catch (err) {
    }
    const db4 = await connectDB(configDB);
    try{
      await withTransaction(db4, async()=>{
        let sqlQuery = ["SELECT * FROM struttura,prenotazione,cliente,immagine WHERE str_prenotata = nome_str AND ref_nome_str = nome_str AND ref1_client = email_client AND email_client = ? AND nome_str = ? GROUP BY nome_str",
                        "SELECT * FROM recensione, struttura WHERE  ref_prop = str_prop AND nome_str = str_recensita AND nome_str = ? AND ref_prop = ?"];
        results = await db4.query(sqlQuery.join(';'), [req.session.emailCliente, req.body.nome_str, req.body.nome_str, req.body.ref_prop]).catch(err=>{ throw err; });
        });
        db4.end();
    }
    catch (err) {
    }
    res.render("gestionePrenotazione/valutaStruttura.ejs", {
      errormessage : "Recensione inserita con successo!",
      immagine : req.session.topStrutture,
      sessione : req.session.cliente || undefined,
      totale:  req.session.totale,
      struttura : results[0],
      recensione : results[1],
      emailCliente : req.session.emailCliente
    });
}

module.exports = app;
