/**
 * This Router handles all Requests send to /auth
 * @type {Router}
 */
const router = require('express').Router();

/**
 * Returns a new Access and Refresh Token when given a valis username and password
 */
router.post('/login', (req, res) => {
    defaultLogger.info('Got request for Login route')
    let reqUser = req.body.user
    if (reqUser && reqUser.name && reqUser.password) {
        dbTools.authenticateUser(reqUser.name, reqUser.password, (err, result, user) => {
            if (err) {
                databaseLogger.error(err)
                res.sendStatus(500)
            } else if (result === true) {
                //generate Refreshtoken
                user.password = req.body.user.password
                authTools.createRefreshToken(user, (refreshToken)=>{
                    //Return refreshtoken and new Access Token to Client
                    res.status(200).json({
                        accessToken: authTools.createAccessToken(user),
                        refreshToken: refreshToken,
                        privilege_level: user.privilege_level
                    })

                    authenticationLogger.info(`Logged in user ${user.username}`)
                })
            } else {
                res.sendStatus(403)
            }
        })
    } else {
        defaultLogger.info('Request didn\'t provide required body')
        res.sendStatus(403)
    }
})

/**
 * Generates a new Access Token when given a valid Refresh Token
 */
router.post('/token', async (req, res) => {
    defaultLogger.info('Got request for generating new Access Token')
    if (req.body.token == null) {
        defaultLogger.info("Request didn't provide Refresh Token")
        res.sendStatus(401)
    } else {
        authTools.verifyRefreshToken(req.body.token, (isValid, user) => {
            if (isValid) {
                res.status(200).json({
                    accessToken: accessToken = authTools.createAccessToken(user),
                    privilege_level: user.privilege_level
                })
            } else return res.sendStatus(403)
        })
    }
})

/**
 * Logs a user out when given a Refresh Token. At the Moment it just deletes all Refresh Tokens from that User
 */
router.delete('/logout', (req, res) =>{
    defaultLogger.info('Got Request to loggout user')
    authTools.verifyRefreshToken(req.body.token, (userFound, user)=>{
        if (userFound){
            dbTools.sqliProtectedQuerry("DELETE FROM refreshTokens WHERE userid = ?", [user.id])
            authenticationLogger.info('Logged user out')
            res.sendStatus(200)
        } else {
            authenticationLogger.warn('No user found')
            res.sendStatus(204)
        }

    })
})

/**
 * Changes the Password of a given User
 */
//TODO Fix Error when given no valid JWT
router.post("/change/password", (req, res) => {
    
    if(req.body.password && req.body.user && req.body.user.name && req.body.user.password){
        dbTools.authenticateUser(req.body.user.name, req.body.user.password, (err, validity, user) => addUser(err, validity, req.body.user.name))
    } else if (req.body.password && req.body.username && req.header('authorization')) {
        authTools.verifyBearerToken(req.header('authorization'), (result, user) => {
            if (user.privilege_level >= 2) addUser(null, result, req.body.username)
            else res.sendStatus(403)
        })
    } else res.sendStatus(403)
    
    function addUser (err, result, username) {
        if (err){
            databaseLogger.error(err)
            res.sendStatus(500)
        } else if (result === true){
            dbTools.getUserID(username, (id) => dbTools.changeUserPassword(id, req.body.password, () => {
                res.sendStatus(200)
            }))
        } else {
            authenticationLogger.warn('Failed attempt to change the Password of user ' + username)
            res.sendStatus(403)
        }
    }
})

module.exports = router;

defaultLogger.info('Loaded Authentication-Route')