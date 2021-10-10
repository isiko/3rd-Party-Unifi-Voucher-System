const {removeUser} = require("../../toolboxes/databaseToolbox");
const router = require('express').Router()
/**
 * This Router handles all Request that are sent to /vouchers
 * @type {Router}
 */

/**
 * Creates a new Token when given the right Parameters. See @unifiToolbox.createVoucher for more Information
 */
router.post('/', (req, res) => {
    vouchersLogger.info('Got request to generate Ticket from user ' + req.user.username)
    if (req.user.privilege_level >=1) {
        unifiTools.createVoucher((err, result) => {
            if (err) unifiLogger.error(err)
            res.status(200).json(result[0])
        }, req.user.id, req.body.minutes, req.body.count, req.body.quota, req.body.note, req.body.up, req.body.down, req.body.mb)
    } else res.sendStatus(403)
})

/**
 * Deletes a Token when given a Unifi privided ID
 */
//TODO: Check if this really invalidates the Token, as /listall still shows deleted Vouchers
router.delete('/', (req, res) => {
    vouchersLogger.info('Got request to delete ticket from user ' + req.user.username)
    if (req.user.privilege_level >=1) {
        dbTools.sqliProtectedQuerry("SELECT userid FROM vouchers WHERE _id = ?", [req.body.id],
            (err, result) => {
                if (result.length > 0) {
                    if (result[0].userid === req.user.id) {
                        unifiTools.deleteVoucher((result)=>{
                            dbTools.sqliProtectedQuerry("DELETE FROM vouchers WHERE _id = ?", [req.body.id], (err) => {
                                res.sendStatus(200)
                            })
                        })
                    } else res.sendStatus(403)
                } else res.sendStatus(404)
            }
        )
    } else res.sendStatus(403)
})

// OLD CODE
// /**
//  * Get List of all Tickets (just for Admins)routes
//  */
// router.get('/listAll', (req, res) => {
//     vouchersLogger.info('Got request to list all tickets from user ' + req.user.username)
//     if (req.user.privilege_level >=2) {
//         unifiTools.getAllVouchers((err, result) => {
//             if (err) unifiLogger.error(err)
//             res.status(200).json(result[0])
//         })
//     } else res.sendStatus(403)
//     if (req.user.privilege_level >=2) {
//
//     } else res.sendStatus(403)
// })

router.get('/listAll', (req, res) => {
    vouchersLogger.info('Got request to list all tickets from user ' + req.user.username)
    if (req.user.privilege_level >=2) {
        dbTools.sqliProtectedQuerry("SELECT * FROM vouchers", [],
            (err, result) => {
                if (err) databaseLogger.error(err)
                result = result.filter(result => {
                    if (req.query.id && Number(req.query.id) !== result.id) return false
                    if (req.query.userid && Number(req.query.userid) !== result.userid) return false
                    if (req.query.code && Number(req.query.code) !== Number(result.code)) return false
                    if (req.query.note && !result.note.includes(req.query.note)) return false
                    return true;
                })
                res.status(200).json(result)
            }
        )
    } else res.sendStatus(403)
})

/**
 * Get own Tickets
 */
router.get('/own', (req, res) => {
    vouchersLogger.info('Got request to list tickets of user ' + req.user.username)
    if (req.user.privilege_level >=1) {
        dbTools.sqliProtectedQuerry("SELECT * FROM vouchers WHERE userid = ?", [req.user.id],
            (err, result) => {
                if (err) databaseLogger.error(err)
                res.status(200).json(result)
            }
        )
    } else res.sendStatus(403)
})

/**
 * Get Information about a particular Ticket
 */
router.get('/info/:id', (req, res) => {
    dbTools.sqliProtectedQuerry("SELECT * FROM vouchers WHERE userid = ? AND _id = ?", [req.user.id, req.params.id], (err, data)=>{
        if (data.length > 0) {
            res.status(200).json(data[0])
        } else res.sendStatus(204)
    })
})

module.exports = router;

defaultLogger.info('Loaded Tickets-Route')