const router = require('express').Router();
/**
 * Registers a new User
 */
router.post('/user', async (req, res) => {
    if (req.user.privilege_level >= 2) {
        if (Array.isArray(req.body)) {
            let counter = 0
            if (req.body.length > 0){
                addUsers(req.body, (users)=>{res.json(users)})
            } else {
                res.json([])
            }
        } else {
            addUsers(req.body, (user) => res.json(user))
        }

        async function addUsers(newUsers, callback) {
            await dbTools.listUsers((err, users) => {
                if (err) {
                    databaseLogger.error(err)
                    callback(err)
                } else {
                    let counter = 0
                    users = users.concat(newUsers)
                    newUsers.forEach((newUser, index) => {
                        //Search for duplicates
                        let duplicateCounter = 0
                        for (const compUser of users) {
                            if (compUser.username === newUser.username) duplicateCounter++
                        }
                        
                        if (duplicateCounter === 1){
                            //If the User would exist only once, add it
                            dbTools.addUser((err, user) => {
                                if (err) {
                                    databaseLogger.error(err)
                                    user.success = false
                                } else newUser.success = true
                                newUser.password = undefined
                                newUsers[index] = newUser
                                counter++
                                if (counter === newUsers.length) callback(newUsers)
                            }, newUser.username, newUser.password)
                        } else {
                            //If adding would create a duplicate, dont add and just say it was a failure
                            newUsers[index] = {
                                username: newUser.username,
                                success: false
                            }
                            counter++
                            if (counter === newUsers.length) callback(newUsers)
                        }
                    })
                }
            })
        }
    } else {
        res.sendStatus(403)
    }
})

/**
 * Deletes a User
 */
router.delete("/user", async (req, res) => {
    if (req.user.privilege_level >=2) {
        counter = 0
        req.body.forEach((oldUser, index) => dbTools.searchUser(oldUser, (err, user) => {
            oldUser = {username: oldUser}
            if (err) {
                databaseLogger.error(err)
                oldUser.success = false
            } else {
                try {
                    dbTools.removeUser(user.username)
                    oldUser.success = true
                    
                } catch (err){
                    oldUser.success = false
                }
            }
            counter++
            req.body[index] = oldUser
            if (counter === req.body.length) res.json(req.body)
        }))
    } else {
        res.sendStatus(403)
    }
})

/**
 * Changes the Privilege Level of a given User
 */
router.post('/changePrivilegs', (req, res)=>{
    if (req.user.privilege_level >=2) {
        dbTools.searchUser(req.body.username, (err, user) => {
            if (err) {
                databaseLogger.error(err)
                res.sendStatus(500)
            } else if (user === undefined) {
                res.sendStatus(404)
            // } else if (result.length > 1) {
            //     res.sendStatus(409)
            } else {
                dbTools.changeUserPrivilegs(user.id, req.body.privilege_level)
                res.sendStatus(200)
            }
        })
    } else {
        res.sendStatus(403)
    }
})

/**
 * Lists all Users
 */
router.get('/users', (req, res)=>{
    if (req.user.privilege_level >=2) {
        dbTools.listUsers((err, users) => {
            users = users.filter(user => {
                if (req.query.id && Number(req.query.id) !== user.id) return false
                if (req.query.username && !user.username.includes(req.query.username)) return false
                if (req.query.privilege_level && Number(req.query.privilege_level) !== user.privilege_level) return false
                return true;
            })
            res.json(users)
        })
    }
})

module.exports = router;

defaultLogger.info('Loaded Administration-Route')