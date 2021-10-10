//TODO Allways check if unify Controller is online
/**
 * Contains all functions interfacing with the Unifi Controller
 */
const unifi = require('node-unifi')
const controller = new unifi.Controller(
    process.env.UNIFI_HOST,
    process.env.UNIFI_PORT
);

/**
 * Creates a new Voucher with the Unifi Controllert
 * @param callback
 * @param userID    the userID the Voucher was created by
 * @param minutes   The amount ob Minutes the Voucher is valid for
 * @param count     The Amount of Vouchers that should be created
 * @param quota     The Uses the Voucher should have
 * @param note      A String that is saved with the Voucher
 * @param up        The max. Upload Speed
 * @param down      The max. Download Speed
 * @param mb        The max. Trafic in Megabyte
 */
function createVoucher(callback, userID, minutes = 45, count = 1, quota = 0, note = "", up = 1000, down = 1000, mb = 10000) {
    if (dbTools.checkStringLength(note)) callback("name To Long", false)
    unifiLogger.info('Creating Voucher for user No ' + userID)
    if (count>0) {
        controller.login(process.env.UNIFI_USER, process.env.UNIFI_PASS, async (err) => {
            if (err) unifiLogger.error(err)
            controller.getSitesStats(async (error, sites) => {
                controller.createVouchers(sites[0].name, minutes, (err, result) => {
                    if (err) unifiLogger.error(err)
                    if (result.length > 0) {
                        controller.getVouchers(sites[0].name, (err, vouchers) => {
                            if (err) unifiLogger.error(err)
                            vouchers[0].forEach(element => {
                                dbTools.sqliProtectedQuerry("INSERT INTO vouchers (`_id`, userid, `create_time`, `code`, `quota`, `duration`, `qos_usage_quota`, `qos_rate_max_up`, `qos_rate_max_down`, `qos_overwrite`, `note`, `status_expires`) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [element._id, userID, element.create_time, element.code, element.quota, element.duration, element.qos_usage_quota, element.qos_rate_max_up, element.qos_rate_max_down, element.qos_overwrite, element.note, element.status_expires])
                            })
                            callback(null, vouchers)
                        }, result[0][0].create_time)
                    } else callback("Didn't get anything from unify back", [])
                }, count, quota, note, up, down, mb)
            });
        });
    } else callback(null, [])
}

function deleteVoucher(callback, voucherId) {
    unifiLogger.warn('Deleting voucher with id \"' + voucherId + '\"')
    controller.login(process.env.UNIFI_USER, process.env.UNIFI_PASS, async (err) => {
        if (err) unifiLogger.error(err)
        controller.getSitesStats(async (error, sites) => {
            controller.revokeVoucher(sites[0].name, voucherId, (err, result) => {
                if (err) unifiLogger.error(err)
                callback(result)
            })

        });
    });
}

/**
 * Returns a list of all Vouchers that are known to the Unifi Controller
 * @param callback
 */
function getAllVouchers(callback){
    unifiLogger.warn('Getting all Vouchers')
    controller.login(process.env.UNIFI_USER, process.env.UNIFI_PASS, async err => {
        if (err) unifiLogger.error(err)
        controller.getSitesStats(async (err, sites) => {
            if (err) unifiLogger.error(err)
            controller.getVouchers(sites[0].name, (err, vouchers) => {
                if (err) unifiLogger.error(err)
                callback(null, vouchers)
            },)
        });
    });
}

module.exports = {
    createVoucher,
    deleteVoucher,
    getAllVouchers
}

defaultLogger.info('Loaded Unifi-Toolbox')