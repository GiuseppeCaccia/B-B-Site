const express = require('express');
const app = express();
const session = require('express-session');  
const multiparty = require('multiparty');    
const fs = require('fs');                     //libreria per la gestione di file stream in input (leggere dati)

app.use(session({
  secret: 'XANAX12',
  resave: false,
  saveUninitialized: true
}));

const { configDB } = require('../database/configDB');
const { connectDB, withTransaction } = require('../database/dbmiddleware');

app.post('/inserimentoStruttura', inserimentoStruttura);

async function inserimentoStruttura(req,res){
    let form = new multiparty.Form();

    form.parse(req, async function(err,fields,files){
      let imgArray = files.foto;
      let nomefotostruttura = fields.nome_struttura;
      var nomefix = nomefotostruttura[0].replace(/\s/g,'');
      let calcolo_ospiti = +fields.singola + +fields.doppia*2 + +fields.tripla*3 + +fields.quadrupla*4
      for (var i = 0; i < imgArray.length; i++) {
        let r = Math.random().toString(36).substring(3);
        imgArray[i].originalFilename = nomefix + r + i + ".jpg";
        var newPath = __dirname + '\\..\\public\\images\\filesystem\\' + imgArray[i].originalFilename;
        var singleImg = imgArray[i];
        readAndWriteFile(singleImg, newPath);
      }
      var servizi = [fields.booking1, fields.booking2, fields.booking3, fields.booking4, fields.booking5, fields.booking6, fields.booking7, fields.booking8, fields.booking9, fields.booking10, fields.booking11, fields.booking12, fields.booking13];
      for(var j = 0; j <= 12; j++){
        if(servizi[j] == 'on'){
          servizi[j] = 0;
        }
        else{
          servizi[j] = 1;
        }
      }
      let oggi = new Date()
      let valoriStruttura = {ref_prop : req.session.emailProp, nome_str : fields.nome_struttura, tipologia : fields.tipologia, descrizione_struttura : fields.descrizione, num_ospiti : calcolo_ospiti , camera_singola : fields.singola, camera_doppia : fields.doppia, camera_tripla : fields.tripla, camera_quadrupla : fields.quadrupla, prezzo : fields.prezzo, tassa_di_soggiorno : fields.tassa, distanza_km_centro : fields.distanza, indirizzo : fields.indirizzo, civico : fields.civico, comune : fields.comune, cap : fields.cap, telefono : fields.telefono, data_ultimo_rendiconto : oggi}; 
      let valoriImmagine = {id_immagine : 0, nome_imm1 : imgArray[0].originalFilename, nome_imm2 : imgArray[1].originalFilename, nome_imm3 : imgArray[2].originalFilename, nome_imm4 : imgArray[3].originalFilename, nome_imm5 : imgArray[4].originalFilename, ref_prop1 : req.session.emailProp, ref_nome_str : fields.nome_struttura};
      let valoriServizi = {ref_prop2 : req.session.emailProp, nome_str2 : fields.nome_struttura, colazione : servizi[0], wifi : servizi[1], piscina : servizi[2], giardino : servizi[3], parcheggio : servizi[4], tv : servizi[5], libri : servizi[6], palestra : servizi[7], animali : servizi[8], cucina : servizi[9], fumare : servizi[10], doccia : servizi[11], condizionatore : servizi[12]}
      const db = await connectDB(configDB);
      try{
              await withTransaction(db, async()=>{
              let sqlQuery = ["INSERT INTO struttura SET ?",
                              "INSERT INTO immagine SET ?",
                              "INSERT INTO servizi_struttura SET ?"  
                            ];
              await db.query(sqlQuery.join(';'), [valoriStruttura,valoriImmagine,valoriServizi]).catch(err=>{ throw err; });
              });
              db.end();
      }
      catch (err) {
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
          res.render('gestioneStrutture/paginaProprietario.ejs', {
            errormessage: 'Struttura inserita correttamente',
            emailProprietario : req.session.emailProp,
            struttura : req.session.struttura,
            guadagni : req.session.guadagni,
          });
    });
}

function readAndWriteFile(singleImg, newPath) {
  fs.readFile(singleImg.path , function(err,data) {
    fs.writeFile(newPath,data, function(err) {
      if (err) console.log('ERR!! :'+err);
    })
  })
}

module.exports = app;