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
databaseLogger = log4js.getLogger('database.databaseCheck');

let tables = [
    {
        "name":"refreshTokens",
        "sqlArguments":"id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT(6) NOT NULL, token TEXT NOT NULL"
    },
    {
        "name":"users",
        "sqlArguments":"id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL, `privilege_level` INT(1)"
    },
    {
        "name":"vouchers",
        "sqlArguments":"id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT(6), `_id` CHAR(24), `create_time` INT(11) UNSIGNED, `code` CHAR(10), `quota` int, `duration` int, `qos_usage_quota` int, `qos_rate_max_up` int, `qos_rate_max_down` int, `qos_overwrite` boolean, note text, `status_expires` int(11)"
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
    if (err) databaseLogger.error(err)
    databaseLogger.info('[DBCHECK] Connected to Database')
})

//Check if Database exists
dbCheck.query("CREATE DATABASE IF NOT EXISTS " + process.env.DB_DATABASE + ";", (err) => {
    if (err) databaseLogger.error(err)
    databaseLogger.info('[DBCHECK] Creating Database')
})

//Use Database
dbCheck.query("Use " + process.env.DB_DATABASE + ";", (err) => {
    if (err) databaseLogger.error(err)
    databaseLogger.info('[DBCHECK] Using Database')
})

//Create Tables
tables.forEach(element => {
    dbCheck.query("Create table IF NOT EXISTS " + element.name + " ( " + element.sqlArguments + " ) ;", (err) => {
        if (err) databaseLogger.error(err)
        databaseLogger.info('[DBCHECK] Creating Table ' + element.name)
    })
})

dbCheck.end()