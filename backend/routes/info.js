const router = require('express').Router();
const fs = require('fs');
/**
 * This Router handles all Requests sendt to /
 * @type {Router}
 */

/**
 * Returns basic information about the Instance
 */
router.get('/', (req,res) => {
    defaultLogger.info('Got Request for info route')
    res.status(418).json({
        version: JSON.parse(fs.readFileSync('./package.json')).version,
        port: config.port,
        date: new Date()
    });
})

module.exports = router;

defaultLogger.info('Loaded Info-Route')