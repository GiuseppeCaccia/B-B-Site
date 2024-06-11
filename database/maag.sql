CREATE DATABASE IF NOT EXISTS dbmsMaag;

USE dbmsMaag;

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

CREATE TABLE IF NOT EXISTS cliente
(
	nome_client VARCHAR(20) NOT NULL,
	cognome_client VARCHAR(20) NOT NULL,
	data_di_nascita_c DATE NOT NULL,
	email_client VARCHAR(40) PRIMARY KEY,
	password_client VARCHAR(100) NOT NULL,
    telefono VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS proprietario
(
    nome_prop VARCHAR(20) NOT NULL,
	cognome_prop VARCHAR(20) NOT NULL,
	data_di_nascita_p DATE NOT NULL,
	email_prop VARCHAR(40) PRIMARY KEY,
	password_prop VARCHAR(100) NOT NULL,
    partita_iva CHAR(11) NOT NULL
);

CREATE TABLE IF NOT EXISTS struttura
(
    ref_prop VARCHAR(40),
	nome_str VARCHAR(40),
    tipologia CHAR(12) NOT NULL,  -- casa vacanza o B&B
    descrizione_struttura VARCHAR(2000),
    num_ospiti SMALLINT UNSIGNED DEFAULT 0,
    camera_singola SMALLINT UNSIGNED DEFAULT 0,
    camera_doppia SMALLINT UNSIGNED DEFAULT 0,
    camera_tripla SMALLINT UNSIGNED DEFAULT 0,
    camera_quadrupla SMALLINT UNSIGNED DEFAULT 0,
	prezzo MEDIUMINT UNSIGNED DEFAULT 0,
	tassa_di_soggiorno FLOAT(2) DEFAULT 0,
    valutazione_struttura FLOAT(2) DEFAULT NULL,
    distanza_km_centro FLOAT(2) DEFAULT 0,
    indirizzo VARCHAR(30) NOT NULL,
    civico CHAR(4) NOT NULL,
    comune VARCHAR(30) NOT NULL,
    cap CHAR(5) NOT NULL,
    telefono VARCHAR(12),
    data_ultimo_rendiconto DATE,
    PRIMARY KEY(ref_prop, nome_str),
    FOREIGN KEY(ref_prop) REFERENCES proprietario(email_prop) 
);

CREATE TABLE IF NOT EXISTS servizi_struttura
(
	ref_prop2 VARCHAR(40),
    nome_str2 VARCHAR(40),
    colazione BOOLEAN DEFAULT 0,
    wifi BOOLEAN DEFAULT 0,
    piscina BOOLEAN DEFAULT 0,
    giardino BOOLEAN DEFAULT 0,
    parcheggio BOOLEAN DEFAULT 0,
    tv BOOLEAN DEFAULT 0,
    libri BOOLEAN DEFAULT 0,
    palestra BOOLEAN DEFAULT 0,
    animali BOOLEAN DEFAULT 0,
    cucina BOOLEAN DEFAULT 0,
    fumare BOOLEAN DEFAULT 0,
    doccia BOOLEAN DEFAULT 0,
    condizionatore BOOLEAN DEFAULT 0,
	FOREIGN KEY (ref_prop2, nome_str2) REFERENCES struttura(ref_prop,nome_str) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recensione
(
    str_prop VARCHAR(40) NOT NULL,
    str_recensita VARCHAR(40) NOT NULL , 
    ref_client VARCHAR(40),
    punteggio SMALLINT UNSIGNED NOT NULL,
    commento VARCHAR(500),
    PRIMARY KEY (str_prop, str_recensita, ref_client),
    FOREIGN KEY (str_prop, str_recensita)  REFERENCES struttura(ref_prop,nome_str) ON UPDATE CASCADE ON DELETE CASCADE,  
    FOREIGN KEY(ref_client) REFERENCES cliente (email_client)
);

CREATE TABLE IF NOT EXISTS prenotazione
(
    ref1_client VARCHAR(40),
    str_prop1 VARCHAR(40) NOT NULL,
    str_prenotata VARCHAR(40) NOT NULL, 
    data_arrivo DATE,
    data_ritorno DATE NOT NULL,
    ospitiPrenotati SMALLINT NOT NULL,
    confermato BOOLEAN DEFAULT 0,
    pagato BOOLEAN DEFAULT 0,
    comunicato BOOLEAN DEFAULT 0,
    importo MEDIUMINT UNSIGNED,  -- tassa di soggiorno + prezzo
    PRIMARY KEY(ref1_client, str_prenotata ,str_prop1, data_arrivo),
    FOREIGN KEY(ref1_client) REFERENCES cliente (email_client),
    FOREIGN KEY (str_prop1, str_prenotata)  REFERENCES struttura(ref_prop,nome_str) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS immagine (
id_immagine INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
nome_imm1 VARCHAR(100) NOT NULL, 
nome_imm2 VARCHAR(100), 
nome_imm3 VARCHAR(100), 
nome_imm4 VARCHAR(100), 
nome_imm5 VARCHAR(100), 
ref_prop1 VARCHAR(40) NOT NULL,
ref_nome_str VARCHAR(40) NOT NULL , 
FOREIGN KEY (ref_prop1, ref_nome_str)  REFERENCES struttura(ref_prop,nome_str) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO cliente VALUES("Andrea", "Costa", "1997-06-16", "fixdo97@libero.it", "$2b$10$q7NbPj7SIiqjzqp4d1vMP.e.tKvnvf/bSAPRyLZFe/4eEtT9lbrOG", "3833938298");
INSERT INTO cliente VALUES("Giuseppe", "Cacciafeda", "1998-06-16", "giuseppecacciafeda1998@gmail.com", "$2b$10$AQxGth/hW.jMd8Y8DelbFutjXutR1ezAPUnieqq4IWB4MOEKRI2JO", "3834538298");
INSERT INTO proprietario VALUES("martina", "milazzo", "1997-12-01", "martina.milazzo97@outlook.com", "$2b$10$q7NbPj7SIiqjzqp4d1vMP.e.tKvnvf/bSAPRyLZFe/4eEtT9lbrOG","1111111");
INSERT INTO proprietario VALUES("giuseppe","cacciafeda", "1998-06-16", "giuseppecacciafeda1998@gmail.com","$2b$10$PIasP6ClVoWmrXx8JTeNWuiTAjfohkyZMrDMGNhOOpxpf4l5rr7Re","AAAAA");
INSERT INTO proprietario VALUES("alessandro","torregrossa", "1995-03-26", "alextorre95@gmail.com", "$2b$10$mPtd/ZISefd.Fqjli99SbOHDrAtajyHeEJPc9ZuBsdQoCc75rAhjm", "BBB");
INSERT INTO struttura VALUES("martina.milazzo97@outlook.com","Casa bianca","Casa vacanza", "a 2 passi dal centro", 12,0,0,0,0,68,2.50,1,3,"via duca della verdura", "94", "Palermo", "90143","38838394", "2020-08-29");
INSERT INTO struttura VALUES("martina.milazzo97@outlook.com","la casetta della nonna", "B&B", "rustica ed accogliente",10,1,0,2,2,30,1.50,NULL,3,"via marchese di villabianca","32","Palermo","90142","348308403", "2020-08-29");
INSERT INTO struttura VALUES("martina.milazzo97@outlook.com","La vie en rose", "B&B", "moderna e stilosa",10,1,0,2,2,40,1.50,3,1,"via wagner","32","Catania","90142","348308403", "2020-08-29");
INSERT INTO struttura VALUES("martina.milazzo97@outlook.com","La donna cannone", "Casa Vacanza", "di fronte la metropolitana",10,0,0,0,0,30,1.50,NULL,10,"via peppino","32","Catania","90142","348308403", "2020-08-29");
INSERT INTO struttura VALUES("giuseppecacciafeda1998@gmail.com","Moby dick", "Casa Vacanza", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , Moby dick offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio.",20,0,0,0,0,30,4.50,NULL,1,"via maqueda","543","Palermo","90142","348303303", "2020-08-29");
INSERT INTO struttura VALUES("alextorre95@gmail.com","Gioiosa marea", "Casa Vacanza", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , il Gioiosa Marea offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio.",6,0,0,0,0,30,4.50,4,1,"via roma","543","Palermo","90142","348303303", "2020-08-29");
INSERT INTO struttura VALUES ("alextorre95@gmail.com", "TVHOUSE", "B&B", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , TVHOUSE offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio.",20,2,1,0,0,30,4.50,5,1,"via roma","543","Palermo","90142","348303303", "2020-04-29");
INSERT INTO struttura VALUES ("alextorre95@gmail.com", "La rosa dei venti", "B&B", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , la rosa dei venti offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio.",15,0,3,1,0,30,4.50,5,1,"via roma","543","Messina","90142","348303303", "2020-08-29");
INSERT INTO struttura VALUES ("alextorre95@gmail.com", "La locanda", "B&B", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , la locanda offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio.",12,1,0,3,0,30,4,5,1,"via roma","543","Palermo","90142","348303303", "2020-08-29");
INSERT INTO struttura VALUES ("alextorre95@gmail.com", "Il brigantino", "B&B", "Situato nella zona dello shopping di via roma, a 8 minuti a piedi dalla piazza e a 500 metri dalla stazione della metropolitana , il Brigantino offre moderne camere climatizzate con bagno privato e WiFi gratuito.La struttura sorge in una posizione ideale per visitare la Palermo storica. Le sistemazioni vantano soffitti alti, eleganti pavimenti piastrellati, una TV LCD e un minibar. La maggior parte include un bagno interno, mentre altre sono dotate di bagno privato esterno, accanto all'alloggio. ",14,2,0,0,4,30,5,5,1,"via roma","543","Messina","90142","348303303", "2019-08-29");
INSERT INTO servizi_struttura VALUES("alextorre95@gmail.com", "Gioiosa marea",1,1,0,1,1,0,1,0,1,0,0,1,1);
INSERT INTO servizi_struttura VALUES("alextorre95@gmail.com", "TVHOUSE",1,1,1,1,0,1,1,0,1,1,1,1,1);
INSERT INTO servizi_struttura VALUES("alextorre95@gmail.com", "La rosa dei venti",0,1,0,1,1,0,1,0,1,0,1,1,1);
INSERT INTO servizi_struttura VALUES("alextorre95@gmail.com", "La locanda",1,0,0,0,1,0,1,0,1,1,0,1,0);
INSERT INTO servizi_struttura VALUES("alextorre95@gmail.com", "Il brigantino",0,1,0,1,1,0,1,0,1,0,1,0,0);
INSERT INTO servizi_struttura VALUES("giuseppecacciafeda1998@gmail.com", "Moby dick",1,1,0,1,1,0,1,0,1,0,1,0,1);
INSERT INTO servizi_struttura VALUES("martina.milazzo97@outlook.com", "La donna cannone",1,0,0,1,1,0,0,0,1,0,1,1,1);
INSERT INTO servizi_struttura VALUES("martina.milazzo97@outlook.com", "La vie en rose",1,1,1,1,1,0,1,1,1,0,1,1,1);
INSERT INTO servizi_struttura VALUES("martina.milazzo97@outlook.com", "La casetta della nonna",1,1,0,0,1,0,1,0,1,1,1,1,1);
INSERT INTO servizi_struttura VALUES("martina.milazzo97@outlook.com", "Casa Bianca",1,1,0,1,1,0,0,0,1,0,1,0,1);
INSERT INTO recensione VALUES("martina.milazzo97@outlook.com", "La vie en rose", "giuseppecacciafeda1998@gmail.com" ,3 ," Splendida stanza");
INSERT INTO recensione VALUES("alextorre95@gmail.com", "La rosa dei venti", "giuseppecacciafeda1998@gmail.com",3 ," Splendida stanza");
INSERT INTO recensione VALUES("alextorre95@gmail.com", "La rosa dei venti", "fixdo97@libero.it",3 ," Splendida stanza");
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-06-01", "2020-06-05",2, 1,1,1, 292);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-06-10", "2020-06-15",1, 1,1,1, 352.5);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-05-01", "2020-05-05",3, 1,1,1, 302);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-05-10", "2020-05-15",4, 1,1,1, 390);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-06-13", "2020-06-15",4, 0,0,0, 156);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","Casa Bianca", "2020-06-16", "2020-06-17",4, 1,1,1, 78);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","martina.milazzo97@outlook.com","La vie en rose", "2020-03-16", "2020-03-17", 2, 1,1,1, 83);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","martina.milazzo97@outlook.com","La vie en rose", "2020-03-16", "2020-03-17", 1, 1,1,1, 41.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","giuseppecacciafeda1998@gmail.com","Moby dick", "2020-03-18", "2020-03-21",2, 1,1,1,117);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-03-18", "2020-03-21",2, 1,1,1,207);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-04-18", "2020-04-21",2, 1,1,1,207);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-05-18", "2020-05-21",3,1,1,1,280.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-06-18", "2020-06-21",2,1,1,1,207);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-07-18", "2020-07-21",1,1,1,1,103.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-08-18", "2020-08-21",3,1,1,1,280.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "Gioiosa marea", "2020-08-18", "2020-08-21",3,1,1,1,103.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-08-29", "2020-09-05",3,1,1,1,724.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-11-20", "2020-11-21",3,1,1,0,103.5);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-08-20", "2020-08-21",3,1,1,0,103.5);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-06-13", "2020-06-15",2,0,0,0, 138);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-01-14", "2020-01-17",2,1,1,1, 117);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-02-14", "2020-02-17",2,1,1,1, 217);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-03-14", "2020-03-17",2,1,1,1, 517);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-04-14", "2020-04-17",2,1,1,1, 317);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-05-14", "2020-05-17",2,1,1,1, 1017);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-06-14", "2020-06-17",2,1,1,1, 417);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-07-14", "2020-07-17",2,1,1,1, 517);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","Gioiosa marea", "2020-08-14", "2020-08-17",2,1,1,1, 317);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-07-13", "2020-07-15",1,1,1,1, 69);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-08-13", "2020-08-15",1,1,1,1, 69);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-09-13", "2020-09-15",1,1,1,0, 69);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-10-13", "2020-10-15",2,1,1,0, 78);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","La rosa dei venti", "2020-11-13", "2020-11-15",3,1,1,0, 87);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","TVHOUSE", "2020-09-03", "2020-09-12",3,1,1,0, 931.5);
INSERT INTO prenotazione VALUES("fixdo97@libero.it","alextorre95@gmail.com","TVHOUSE", "2020-09-15", "2020-09-17",3,1,1,0, 117);
INSERT INTO prenotazione VALUES("giuseppecacciafeda1998@gmail.com","alextorre95@gmail.com", "TVHOUSE", "2020-09-18", "2020-09-19",3,0,0,0,103.5);
INSERT INTO immagine VALUES (1, "img1.jpg","img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg","martina.milazzo97@outlook.com","Casa Bianca");
INSERT INTO immagine VALUES (2, "imm1.jpg","imm2.jpg", "imm3.jpg", "imm4.jpg", "imm5.jpg","martina.milazzo97@outlook.com","la casetta della nonna");
INSERT INTO immagine VALUES (3, "immag1.jpg","immag2.jpg", "immag3.jpg", "immag4.jpg", "immag5.jpg","martina.milazzo97@outlook.com","La vie en rose");
INSERT INTO immagine VALUES (4, "imma1.jpg","imma2.jpg", "imma3.jpg", "imma4.jpg", "imma5.jpg","martina.milazzo97@outlook.com","La donna cannone");
INSERT INTO immagine VALUES (5, "im1.jpg","im2.jpg", "im3.jpg", "im4.jpg", "im5.jpg","giuseppecacciafeda1998@gmail.com","Moby dick");
INSERT INTO immagine VALUES (6, "i_uno.jpg","i_due.jpg", "i_tre.jpg", "i_quattro.jpg", "i_cinque.jpg","alextorre95@gmail.com","Gioiosa marea");
INSERT INTO immagine VALUES (7, "img_uno.jpg","img_due.jpg", "img_tre.jpg", "img_quattro.jpg", "img_cinque.jpg","alextorre95@gmail.com", "La rosa dei venti");
INSERT INTO immagine VALUES (8, "s_uno.jpg","s_due.jpg", "s_tre.jpg", "s_quattro.jpg", "s_cinque.jpg","alextorre95@gmail.com", "La locanda");
INSERT INTO immagine VALUES (9, "stanza_uno.jpg","stanza_due.jpg", "stanza_tre.jpg", "stanza_quattro.jpg", "stanza_cinque.jpg","alextorre95@gmail.com", "Il brigantino");
INSERT INTO immagine VALUES (10, "st_uno.jpg","st_due.jpg", "st_tre.jpg", "st_quattro.jpg", "st_cinque.jpg","alextorre95@gmail.com", "TVHOUSE");