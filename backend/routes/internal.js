//Create Router
const router = require('express').Router();

//Authenticate Token
router.use((req, res, next) => {
    authenticationLogger.info('Authenticating Token')
    authTools.verifyBearerToken(req.headers['authorization'], (result, user) => {
        req.user = user;
        switch (result){
            case true:
                next()
                break
            case false:
                res.sendStatus(403)
                break
            case null:
                res.sendStatus(401)
        }
    })
    // let authHeader = req.headers['authorization'];
    // if (authHeader && authHeader.startsWith("Bearer ")){
    //     authTools.verifyAccessToken(authHeader.split('Bearer ')[1], (user) => {
    //         if (user === false){
    //             res.sendStatus(403)
    //         } else {
    //             req.user = {
    //                 id: user.id,
    //                 username: user.username,
    //                 privilege_level: user.privilege_level
    //             }
    //             authenticationLogger.info('Autheticated Access Token for user ' + user.username)
    //             next()
    //         }
    //     });
    // } else {
    //     authenticationLogger.info('No Bearer Token was specified')
    //     res.sendStatus(401)
    // }
})

router.use('/admin', require('./internal/admin'))
router.use('/vouchers', require('./internal/tickets'))

//Export Router
module.exports = router;
defaultLogger.info('Loaded Internal Routes')
