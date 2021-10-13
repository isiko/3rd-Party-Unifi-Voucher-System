const mysql = require('mysql2');
const bcrypt = require('bcrypt');

//Connecting to Database
databaseLogger.info('Connecting to Database')
global.db = mysql.createPool({
    "host": process.env.DB_HOST,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE
})

//region Database Checks
databaseLogger.info("Checking Connection")

//Check amount of Users
sqliProtectedQuerry("SELECT * FROM users;", [], (err, data)=>{
    databaseLogger.info("Users in the Database: " + data.length)
    if (data.length === 0){
        dbTools.addUser(() => {
            databaseLogger.warn("Created Default Admin Account  because there was no User in the Database")
        }, "root", "root", 2)
    }
})

//Check amount of Refresh Tokens
sqliProtectedQuerry("SELECT * FROM refreshTokens;", [], (err, data)=>{
    databaseLogger.info("Active Sessions: " + data.length)
})

//Check amount of Vouchers
sqliProtectedQuerry("SELECT * FROM vouchers;", [], (err, data)=>{
    databaseLogger.info("Active Vouchers: " + data.length)
})
//endregion

function limitChars(string){
    return string.selectSubString(0, config.maxTextLength)
}

function checkStringLength(str){
    return str.length > config.maxTextLength
}

async function sqliProtectedQuerry(query, data, callback = function (err){if (err) databaseLogger.error(err)}){
    let sql = mysql.format(query, data)
    databaseLogger.info('Sending Query of type "' + sql.split(' ')[0] + '"')
    await db.query(sql, callback)
}

//Todo Decide what to do when more than one user is found
async function searchUser(username, callback) {
    if (checkStringLength(username)) callback("name To Long", false)
    databaseLogger.info('Searching user ' + username)
    await sqliProtectedQuerry("SELECT * FROM users WHERE username = ?;", [username],
        (err, users) => {
            if (err) databaseLogger.error(err)
            if (users.length === 0) return callback()
            callback(null, users[0])
        }
    )
}

async function listUsers(callback) {
    databaseLogger.info("Listing all Users")
    await sqliProtectedQuerry("SELECT * FROM users;", [],
        (err, users) => {
            if (err) databaseLogger.error(err)
            users.forEach(user => {
                user.password = undefined
            })
            callback(null, users)
        }
    )
}

/**
 * Removes User with a given username
 * @param username
 */
async function removeUser(username){
    databaseLogger.warn('Deleting user ' + username)
    await dbTools.sqliProtectedQuerry("DELETE FROM users WHERE username = ?",[username])
}

/**
 * Adds a User to the Database with a salted Password
 * @param username          the new Username. If it allready exists, an Error is returned
 * @param password          The unhashed Password
 * @param callback          The privilige Level the new User is given. Defaults to a normal user
 * @param privilegeLevel
 */
async function addUser(callback, username, password, privilegeLevel = 1){
    if (checkStringLength(username)) callback("name To Long", false)
    databaseLogger.info('Creating user')
    await hashPassword(password, async (hashedPassword) => {
        await dbTools.sqliProtectedQuerry("INSERT INTO users (username, password, privilege_level) values (?, ?, ?)",[username,hashedPassword, privilegeLevel])
        databaseLogger.info('Created user ' + username)
        callback(null, {username: username, password:hashedPassword})
    })
}

/**
 * Changes the password of a given User
 * @param userid
 * @param password  The Unhashed version of the new Password
 */
async function changeUserPassword(userid, password, callback){
    databaseLogger.info('Changing password of user with ID' + userid)
    await hashPassword(password, async (passwordHash) => {
        await sqliProtectedQuerry('UPDATE users SET password = ? WHERE id = ?;', [passwordHash, userid])
        callback()
    })
}

/**
 * Changes the Privilege Level of a given User
 * @param userID            The User ID given by the Database
 * @param privilegeLevel    The new Privilege level for the User
 */
async function changeUserPrivilegs (userID, privilegeLevel = 1){
    databaseLogger.info('Changing privileg level for user' + userID + ' to ' + privilegeLevel)
    await dbTools.sqliProtectedQuerry("UPDATE users SET privilege_level = ? WHERE id = ?;",[privilegeLevel, userID])
}

/**
 * Authenticates a given User with the Database
 * @param username          The Username of the User
 * @param password          The unhashed password
 * @param callback
 */
async function authenticateUser(username, password, callback){
    if (checkStringLength(username)) callback("name To Long", false)
    databaseLogger.info('Autheticating user ' + username)
    //Check if User exists
    await dbTools.searchUser(username, async (err, user) => {
        if (user){
            //Check if Password is Correct
            try {
                let userValid = await bcrypt.compare(password, user.password);
                if (userValid) {
                    databaseLogger.info('User was valid')
                } else databaseLogger.warn('User was invalid')
                callback(null, userValid, user)
            } catch (err){
                callback(err)
            }
        } else {
            callback(null, false)
        }
    })
}

/**
 * Hashes the Password and returns it via the callback function
 * @param password
 * @param callback
 */
async function hashPassword(password, callback){
    callback(await bcrypt.hash(password, 10))
}

async function getUserID(username, callback){
    if (checkStringLength(username)) callback("name To Long", false)
    await sqliProtectedQuerry('SELECT id FROM users WHERE username = ?;', [username], (err, id) => {
        if (err) databaseLogger.error(err)
        callback(id[0].id)
    })
}

module.exports = {
    checkStringLength,
    limitChars,
    sqliProtectedQuerry,
    searchUser,
    listUsers,
    removeUser,
    addUser,
    changeUserPassword,
    changeUserPrivilegs,
    authenticateUser,
    hashPassword,
    getUserID
}

defaultLogger.info('Loaded Database-Toolbox')