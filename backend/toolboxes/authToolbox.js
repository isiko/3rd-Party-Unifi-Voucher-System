/**
 * Contains all functions related to Authentication and Authorisation
 */
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

/**
 * Handles Errors of invalid JWTs
 * @param err
 */
function handleJwtError(err) {
    let reason = ""
    if (err.name === "TokenExpiredError") reason = "Expired"
    else if (err.message === "jwt malformed") reason = "malformed"
    else if (err.message === "jwt must be provided") reason = "no JWT provided"
    else {
        authenticationLogger.error(err)
        reason = "Unknown Reason"
    }
    authenticationLogger.warn(`Provided Token isn\'t a valid JWT (${reason})`)
}

/**
 * Creates a new Access Token for a given User
 * @param user Has to contain the username and password
 * @returns {*} The Access Token
 */
function createAccessToken(user) {
    authenticationLogger.info('Creating Access Token for user ' + user.username)
    return jwt.sign({user: user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: config.accessTokenRefreshRate})
}

/**
 * Generates a new Refresh Token for a given User and puts it into the Database
 * @param user  Has to contain the username and password of the User
 * @param callback
 */
function createRefreshToken(user, callback) {
    authenticationLogger.info('Creating Refresh Token for user ' + user.username)
    let token = crypto.randomBytes(64).toString('hex');
    dbTools.sqliProtectedQuerry("INSERT INTO refreshTokens (userid, token) VALUE (?, ?);",[user.id, token], (err, output) => {
        let refreshToken = jwt.sign({
            user: user,
            token: {
                id: output.insertId,
                token: token
            }
        }, process.env.REFRESH_TOKEN_SECRET)
        callback(refreshToken)
    })
}

/**
 * Verifies a JWT and returns the content of it in a Callback function
 * @param token     The JWT
 * @param callback
 */
function verifyRefreshToken(token, callback) {
    authenticationLogger.info('Verifying Refresh Token')
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, content) => {
        if (err) {
            handleJwtError(err)
            callback(false)
            return
        }
        dbTools.sqliProtectedQuerry("SELECT userid FROM refreshTokens WHERE token = ? AND id = ?", [content.token.token, content.token.id],
            (err, result)=>{
                if (err) databaseLogger.error(err)
                if (result.length > 0) {
                    dbTools.sqliProtectedQuerry("SELECT * FROM users WHERE id = ?", [result[0].userid],
                        (err, user) => {
                            if (err) databaseLogger.error(err)
                            let fountUser = user !== undefined
                            authenticationLogger.info('Verified Refresh Token for user ' + user[0].username)
                            user[0].password = content.user.password
                            callback(fountUser, user[0])
                        }
                    )
                } else {
                    authenticationLogger.warn('Refresh Token could not be verified')
                    callback(false)
                }
            }
        )
    })
}

/**
 * Verifies a Access Token
 * @param token     The Token to verify
 * @param callback
 * @returns {null}  Returns the user the Token belongs to, or null
 */
function verifyAccessToken(token, callback) {
    authenticationLogger.info('Verifying Access Token')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, content) => {
        if(err){
            handleJwtError(err);
            callback(false)
            return;
        }
        dbTools.authenticateUser(content.user.username, content.user.password, (err, result, user) => {
            if (err) databaseLogger.error(err)
            if (result === true) {
                authenticationLogger.info('Verified Access Token for user ' + user.username)
                callback(user)
            } else {
                authenticationLogger.warn('Access Token could not be verified')
                callback(false)
            }
        })
    })
}

function verifyBearerToken(token, callback) {
    if (token && token.startsWith("Bearer ")){
        authTools.verifyAccessToken(token.split('Bearer ')[1], (user) => {
            if (user === false){
                callback(false)
            } else {
                let reqUser = {
                    id: user.id,
                    username: user.username,
                    privilege_level: user.privilege_level
                }
                authenticationLogger.info('Autheticated Access Token for user ' + user.username)
                callback(true, reqUser)
            }
        });
    } else {
        authenticationLogger.info('No Bearer Token was specified')
        callback(null)
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken,
    verifyAccessToken,
    verifyBearerToken
}

defaultLogger.info('Loaded Authentication-Toolbox')