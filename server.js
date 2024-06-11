const createError = require('http-errors');
const express = require('express');
  const app = express();
const path = require('path');
const session = require('express-session');   //libreria che salva le dati o variabili da usare in una sessione HTTP
const http = require('http');                 //modulo per creare un server basato su http
const https = require('https');               //modulo per creare un server basato su https
const port = 8080;                            //porta per il localhost HTTP
const port1 = 8081;                            //porta per il localhost HTTPs
const multiparty = require('multiparty');
const fs = require('fs');                     //libreria per la gestione di file stream in input (leggere dati)

// Uso una chiave privata necessaria per crittografare i dati di una connessione HTTPS
const privateKey = fs.readFileSync(__dirname + '/certificati/priv.pem', 'utf-8');
// Uso un certificato self-signed per impostare la connessione HTTPs
const certificate = fs.readFileSync(__dirname +'/certificati/certificate.pem', 'utf-8');
const credentials = {key : privateKey, cert : certificate};

const httpServer = http.createServer(app);          //creo il server http
const httpsServer = https.createServer(credentials, app);  //creo il server https

//file js per la modularizzazione del codice
const indexRouter = require('./routes/index');
const accessoRouter = require('./routes/accesso');
const registrazioneRouter = require('./routes/registrazione');
const proprietarioRouter = require('./routes/proprietario');
const inserimentoStrutturaRouter = require('./routes/inserimentoStruttura');
const modificaStrutturaRouter = require('./routes/modificaStruttura');
const ricercaRouter = require('./routes/search');
const richiestePropRouter = require('./routes/gestioneRichieste');
const ComunicazioneDatiRouter = require('./routes/comunicazione');
const valutaStrutturaRouter = require('./routes/valutaStruttura');
const cronologiaPrenotazioniRouter = require('./routes/cronologiaPrenotazioni');
const rendicontoRouter = require('./routes/rendiconto');
const pagamentoRouter = require('./routes/pagamento');
const prenotazioneRouter = require('./routes/prenota');

// __dirname rappresenta la cartella che contiene il file in esecuzione
app.use('/public', express.static(__dirname + '/'));                   // indico ad express di servire qualsiasi contenuto all'interno della cartella specificata
app.use('/public/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.use('/public/images', express.static(__dirname + '/public/images'));

// impostazioni dello strumento ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//indico ad express di usare la sessione express e di formattarlo secondo il formato json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  //l'opzione extended indica di fare il parsing tra i dati dell'url e la libreria querystring.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/views/autenticazione')));
app.use(express.static(path.join(__dirname, '/views/gestioneStrutture')));
app.use(express.static(path.join(__dirname, '/views/gestionePrenotazione')))

//indico ad express di servire tutte le rotte e le impostazioni all'interno dei file js delle relative pagine ejs
app.use('/', indexRouter);
app.use('/', accessoRouter);
app.use('/', registrazioneRouter);
app.use('/', proprietarioRouter);
app.use('/', inserimentoStrutturaRouter);
app.use('/', modificaStrutturaRouter);
app.use('/', ricercaRouter);
app.use('/', richiestePropRouter);
app.use('/', valutaStrutturaRouter);
app.use('/', cronologiaPrenotazioniRouter);
app.use('/', ComunicazioneDatiRouter);
app.use('/', rendicontoRouter);
app.use('/', pagamentoRouter);
app.use('/', prenotazioneRouter);

httpServer.listen(port, function() {
  console.log("*********INIZIO SESSIONE IN HTTP***********");
  console.log("In ascolto sulla porta: " + port);
});

httpsServer.listen(port1, function() {
  console.log("*********INIZIO SESSIONE IN HTTPS***********");
  console.log("In ascolto sulla porta: " + port1);
});

module.exports = app;
