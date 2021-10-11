const exec = require("child_process").execSync;
const express = require('express')
const log4js = require('log4js')
const cors = require('cors');

//Loading Config file
require('dotenv').config()
global.config = JSON.parse(require('fs').readFileSync('./config.json'));

//Setting up Loggers
config.log4js.appenders.fileAppender.filename = "./logs/" + new Date().toISOString().replace(':', '-') + ".log"
log4js.configure(config.log4js);
global.defaultLogger        = log4js.getLogger();
global.databaseLogger       = log4js.getLogger("database");
global.databaseCheckLogger  = log4js.getLogger('database.databaseCheck');
global.authenticationLogger = log4js.getLogger("authentication");
global.vouchersLogger       = log4js.getLogger("vouchers");
global.administrationLogger = log4js.getLogger("administration");
global.unifiLogger          = log4js.getLogger("administration");

//Setup Database
exec("node databaseSetup.js")

//Loading Toolboxes
global.authTools = require('./toolboxes/authToolbox')
global.dbTools = require('./toolboxes/databaseToolbox')
global.unifiTools = require('./toolboxes/unifiToolbox')

app = express()
app.use(express.json())
app.use(cors())

//Setting up Routes
app.use('/',        require('./routes/info'));
app.use('/auth',    require('./routes/auth'));
app.use('/internal',require('./routes/internal'));
app.use((req, res) => {
    res.sendStatus(404)
})

//Start Server
app.listen(config.port, () => {defaultLogger.info('Started server on port ' + config.port)});