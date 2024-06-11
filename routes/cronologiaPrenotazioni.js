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

app.get('/valutaStruttura', valutaStruttura);
app.get('/FormPagamento', FormPagamento); 

async function valutaStruttura(req,res){
    const db = await connectDB(configDB);
    let nome_str = req.query.nome_str;
    let ref_prop = req.query.nome_prop;
    let results = {}
    try{
        await withTransaction(db, async()=>{
        let sqlQuery = ["SELECT * FROM struttura,prenotazione,cliente,immagine WHERE str_prenotata = nome_str AND ref_nome_str = nome_str AND ref1_client = email_client AND email_client = ? AND nome_str = ? GROUP BY nome_str",
                        "SELECT * FROM recensione, struttura WHERE ref_prop = str_prop AND nome_str = str_recensita AND nome_str = ? AND ref_prop = ?"];
        results = await db.query(sqlQuery.join(';'), [req.session.emailCliente, nome_str, nome_str, ref_prop]).catch(err=>{ throw err; });
        });
        db.end();
    }
    catch (err) {
    }
    res.render('gestionePrenotazione/valutaStruttura.ejs', {
      errormessage : '',
      immagine : req.session.topStrutture,
      sessione : req.session.cliente || undefined,
      totale:  req.session.totale,
      struttura : results[0],
      recensione : results[1],
      emailCliente : req.session.emailCliente,
    });
}

async function FormPagamento(req,res){
  let nome_str = req.query.nome_str;
  let ospiti = req.query.num_ospiti;
  let prezzo= req.query.prezzo;
  let tassa=req.query.tassa;
  let importo=req.query.importo; 
  let nome_imm1=req.query.nome_imm1; 
  let arrivo=req.query.data_arr;
  let ritorno= req.query.data_rit;  
  let nome_prop=req.query.nome_prop;
  let emailCliente=req.query.emailCl;
  let info={nome: nome_str, prezzo:prezzo, tassa:tassa, totale:importo, immagine:nome_imm1, ospiti : ospiti, arrivo: arrivo, ritorno:ritorno, emailProp:nome_prop, emailCliente:emailCliente }
  res.render('gestionePrenotazione/pagamento.ejs', {
   errormessage : '',
   info: info
  });
} 

module.exports = app;