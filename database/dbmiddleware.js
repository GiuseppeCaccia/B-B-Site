const mysql = require('mysql');
const util = require('util');   //modulo per le promise

exports.connectDB = async function(config) {  //creo una funzione che prendendo le configurazioni del db come parametri istanzia la connessione a mySQL

    let pool = mysql.createPool(config);  //createPool è per gestire piu richieste al DB contemporaneamente
    console.log('Pool creato dalla configurazione');
    let getConnection = () => {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    return reject(err);
                }
                resolve(connection);
            });
        });
    };
    const connection = await getConnection();
    console.log('connessione al DB creata: ');

    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        connRelease() {
            return util.promisify(connection.release)
                .call(connection);
        },
        beginTransaction() {
            return util.promisify(connection.beginTransaction)
                .call(connection);
        },
        commit() {
            return util.promisify(connection.commit)
                .call(connection);
        },
        rollback() {
            return util.promisify(connection.rollback)
                .call(connection);
        },
        end() {
            return pool.end.call(pool);
        }
    };
}

// Funzione asincrona di gestione di una transazione generica
// callback conterrà le effettive operazioni CRUD da eseguire
exports.withTransaction = async function(db, callback) {
    try {
        await db.beginTransaction();
        await callback();
        await db.commit();
    } catch (err) {
        await db.rollback();
        throw err;
    } finally {
        db.end();
    }
}
