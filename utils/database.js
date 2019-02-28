const mysql = require('mysql');

class database{
    constructor() {
        this.connection = mysql.createConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, results, fields) => {
                if (err)
                    return reject(err);
                
                resolve(results);
            })
        });
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

exports.database = database;

exports.execute = (sql, args) => {
    return new Promise( (resolve, reject) => {
        const db = new database();
        db.query(sql, args)
            .then(
                (res) => {
                    //console.log(res);
                    db.close();
                    resolve(res);
                },
                (err) => {
                    reject(err);
                    db.close();
                }
            )
    })
}