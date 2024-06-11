
const express = require('express');
const app = express();
const session = require('express-session');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');
const fs = require('fs');
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

app.post("/comunicazione", comunicazione);
app.post("/inviaForm", inviaForm);


async function comunicazione(req, res ){
  let num_pren=req.body.prenotati;
  let via = req.body.via;
  let comune = req.body.comune;
  req.session.ref_cliente=req.body.ref_cliente;
  req.session.nome_str=req.body.nome_str;
  req.session.data_arr=req.body.data_arr;
  req.session.data_rit=req.body.data_rit;

  let prenotati={num_prenotati:num_pren, email_cliente:req.session.ref_cliente, data_arrivo: req.session.data_arr, data_ritorno : req.session.data_rit, nome_str : req.session.nome_str, via : via, comune : comune, ospiti : req.body.ospitiPrenotati};
  res.render('gestioneStrutture/comunicazione.ejs', {
     errormessage : '',
     prenotati: prenotati,
     struttura : req.session.struttura,
     emailProprietario : req.session.emailProp
  });
}

async function inviaForm(req, res ){
  let form = new multiparty.Form();
  form.parse(req, async function(err,fields,files){
    let imgArray = files.foto;
    var imgPath=[];
    var nomeImg=[];
    var attachments=[];
    for (var i = 0; i < imgArray.length; i++) {
      var newPath = "public\\images\\filesystem\\" + imgArray[i].originalFilename;
      var singleImg = imgArray[i];
      nomeImg+=imgArray[i].originalFilename;
      imgPath+=newPath;
      var object= {filename:imgArray[i].originalFilename, path:newPath};
      attachments.push(object);
      readAndWriteFile(singleImg, newPath);
    }
  let nome=fields.nome;
  let cognome=fields.cognome;
  let data_nascita=fields.dataNascita;
  let via=fields.via;
  let citta=fields.citta;
  let provincia=fields.provincia;
  let regione=fields.regione;
  let cap=fields.cap;
  let civico=fields.civico;
  let email=fields.email;
  let numero=fields.numero;
  var oggi = new Date();
  req.session.dati=[];
  var content=[];
  for(var i=0; i<nome.length; i++){
    content += '<tr> <td>'+ nome[i] +'</td> <td>'+ cognome[i] +'</td> <td>'+ data_nascita[i] +'</td>   <td>'+ via[i] +'</td>  <td>'+ citta[i] +'</td>  <td>'+ provincia[i] +'</td>  <td>'+ regione[i] +'</td>  <td>'+ cap[i] +'</td>  <td>'+ civico[i] +'</td> <td>'+ email[i] +'</td>  <td>'+ numero[i] +'</td> </tr>'
  }
  const db = await connectDB(configDB);
  try{
    await withTransaction(db, async()=> {
      arrivo = req.session.data_arr.split('/');
      ritorno = req.session.data_rit.split('/');
      data_arrivo = arrivo[2] + '/' +  arrivo[1] + '/' + arrivo[0];
      data_ritorno = ritorno[2] + '/' +  ritorno[1] + '/' + ritorno[0];
      let sqlQuery="UPDATE prenotazione SET comunicato = 1 WHERE comunicato = 0 AND ref1_client = ? AND str_prop1 = ?  AND str_prenotata=?  AND pagato = 1 AND  data_arrivo=? AND data_ritorno=? ";
      results= await db.query(sqlQuery, [req.session.ref_cliente, req.session.emailProp, req.session.nome_str, data_arrivo, data_ritorno]).catch(err=> {throw err;});
    });
    db.end();
    let info = await transporter.sendMail({
      from: 'TeamMaag12@gmail.com', //Soggetto
      to: 'alextorre95@gmail.com',  // Destinatari
      subject: 'Comunicazione Ospiti: ' + fields.data_arrivo + '-' + fields.data_ritorno + 'da parte della struttura:' + req.session.nome_str, // Oggetto della Mail
      text: 'Comunicato',
      html:'Comunicazione dalla struttura ' + req.session.nome_str + ' ' + fields.via_str + ' ' + fields.comune_str + '. Ospiti ricevuti in data: ' + fields.data_arrivo + ' - ' + fields.data_ritorno + '\n\n' +
      '<style>  td, th { border: 1px solid #dddddd; text-align: left; padding: 8px;} </style> <table> <tr> <th>Nome </th> <th>Cognome </th> <th>Data di Nascita</th>  <th>Via </th> <th>Città </th> <th>Provincia</th><th>Regione </th> <th>Cap </th> <th>Civico</th><th>Email </th> <th>Numero </th>  </tr>' + content + '</table>' +
      '\n\n\nper maggiori informazioni contattare il proprietario della struttura alla seguente email: ' + req.session.emailProp, // Testo da inserire nel corpo della mail
      attachments: attachments
    });
  }
  catch (err){

  }
  const db1 = await connectDB(configDB);
    try{
      await withTransaction(db1, async()=> {
        let sqlQuery2="SELECT *, DATE_FORMAT(data_arrivo, '%d/%m/%Y') AS data_arr, DATE_FORMAT(data_ritorno, '%d/%m/%Y') AS data_rit from struttura, prenotazione, immagine WHERE  str_prenotata=nome_str AND str_prop1=?  AND ref_prop1=str_prop1 AND  ref_nome_str=nome_str AND comunicato=0 AND pagato=1";
        results= await db1.query(sqlQuery2, req.session.emailProp).catch(err=> {throw err;});
        res.render("gestioneStrutture/datiOspite.ejs", {
          errormessage : 'Comunicazione Inviata con successo',
          prenotazione : results,
          data : oggi,
          emailProprietario : req.session.emailProp
        });
      });
      db1.end();
    }
    catch (err){
    }
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
