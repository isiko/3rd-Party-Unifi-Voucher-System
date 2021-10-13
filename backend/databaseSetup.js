//TODO Probably redo this
const mysql = require('mysql')
const log4js = require('log4js')
require('dotenv').config()
const config = JSON.parse(require('fs').readFileSync('./config.json'));

/**
 * Sets up the Database and creates all necessary Tables
 */

//Setting up Logger
config.log4js.appenders.fileAppender.filename = "./logs/databaseSetup/" + new Date().toISOString().replace(':', '-') + ".log"
log4js.configure(config.log4js);
databaseCheckLogger = log4js.getLogger('database.databaseCheck');

let tables = [
    {
        "name":"refreshTokens",
        "SQL": `(
            id int AUTO_INCREMENT NOT NULL,
            userid int NOT NULL,
            token text NOT NULL,
            PRIMARY KEY (id),
            Foreign KEY (userid) REFERENCES users(id)
        );`
    },
    {
        "name":"users",
        "SQL":`(
            id int AUTO_INCREMENT NOT NULL,
            username text NOT NULL,
            password text NOT NULL,
            privilege_level int,
            PRIMARY KEY (id)
        );`
    },
    {
        "name":"vouchers",
        "SQL":`(
            id int AUTO_INCREMENT NOT NULL,
            userid int NOT NULL,
            _id char(24),
            create_time int,
            code char(10),
            quota int,
            duration int,
            qos_usage_quota int,
            qos_rate_max_up int, 
            qos_rate_max_down int,
            qos_overwrite bool,
            note text,
            status_expires int,
            PRIMARY KEY (id),
            FOREIGN KEY (userid) REFERENCES users(id)
        );`
    }
]

//Create Connection object
const dbCheck = mysql.createConnection({
    "host": process.env.DB_HOST,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
})

//Connect to Database
dbCheck.connect((err) => {
    if (err) databaseCheckLogger.error(err)
    databaseCheckLogger.info('[DBCHECK] Connected to Database')
})

//Check if Database exists
dbCheck.query("CREATE DATABASE IF NOT EXISTS " + process.env.DB_DATABASE + ";", (err) => {
    if (err) databaseCheckLogger.error(err)
    databaseCheckLogger.info('[DBCHECK] Creating Database')
})

//Use Database
dbCheck.query("Use " + process.env.DB_DATABASE + ";", (err) => {
    if (err) databaseCheckLogger.error(err)
    databaseCheckLogger.info('[DBCHECK] Using Database')
})

//Create Tables
tables.forEach(element => {
    dbCheck.query(`CREATE TABLE IF NOT EXISTS ${element.name} ${element.SQL}`, (err) => {
        if (err) databaseCheckLogger.error(err)
        databaseCheckLogger.info('[DBCHECK] Creating Table ' + element.name)
    })
})

dbCheck.end()