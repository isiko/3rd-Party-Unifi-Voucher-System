//TODO ad error handling for when the backend is offline
import Cookies from "universal-cookie";
const cookies = new Cookies();
const axios = require('axios')

function backendRequest(callback, url, method, content = {}, accessToken = "", params = undefined){
    axios.request({
        url: url,
        method: method,
        baseURL: `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": 'application/json'
        },
        params: params || null,
        data: content
    })
    .then(res => {
        callback(res.status, res.data)
    })
    .catch(error => {
        if (error.response) {
            callback(error.response.status)
        } else {
            //TODO Backend is down, so display that to the user
        }
    })
}

function removeCookies(){
    cookies.remove('refreshToken')
    cookies.remove('username')
    cookies.remove('accessToken')
    cookies.remove('privilege_level')
    window.$tickets=null
}

//region /auth

function isLoggedIn() {
    if (cookies.get('refreshToken') === undefined) removeCookies()
    return cookies.get('refreshToken') !== undefined;
}

//TODO Update Backend to send Auth-Level
function login(callback, username, password) {
    console.log("Logging in")
    backendRequest((code, data)=>{
        switch (code) {
            case 200:
                cookies.set('refreshToken', data.refreshToken, {path: '/'})
                cookies.set('accessToken', data.accessToken, {path: '/'})
                cookies.set("privilege_level", data.privilege_level, {path:"/", maxAge:10*1000})
                callback(code, data.accessToken, data.refreshToken, true);
                break;
            case 403:
            case 500:
            default:
                removeCookies()
                callback(code, null, null, false)
        }
    }, '/auth/login/', 'POST', {
        user:{
            name: username,
            password: password,
        }
    })
}

function logout(callback){
    console.log("Logging Out")
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(true)
                break
            case 204:
            case 500:
            default:
                callback(false)
        }
    }, "/auth/logout", "DELETE", {token: cookies.get("refreshToken")})
    removeCookies()
}

//TODO Update Backend to send Userdata
function refreshAccessToken(callback) {
    console.log("Refreshing Access Token")
    backendRequest((code, data) => {
        switch(code){
            case 200:
                cookies.set("accessToken", data.token, {path:"/", maxAge:10*1000})
                cookies.set("privilege_level", data.privilege_level, {path:"/", maxAge:10*1000})
                callback(true, data.accessToken)
                break
            case 401:
            case 403:
            case 500:
            default:
                callback(false)
        }
    },"/auth/token", "POST", {token:cookies.get("refreshToken")})
}

function changePasswordAsUser(callback, oldPassword, newPassword) {
    console.log("Changing Password")
    backendRequest((code) => {
        switch(code){
            case 200:
                callback(true)
                break
            case 403:
            case 500:
            default:
                callback(false)
        }
    },"/auth/change/password", "POST", {
        user:{
            name:cookies.get("username"),
            password:oldPassword
        },
        password:newPassword
    })
}

//Not Tested
function changePasswordAsAdmin(callback, username, newPassword) {
    console.log("Changing Password for other User")
    backendRequest((code)=>{
        switch (code) {
            case 200:
                callback(true)
                break
            case 403:
            default:
                callback(false)
        }
    }, "/auth/change/password", "POST", {
        username,
        password: newPassword
    }, cookies.get("accessToken"))
}
//endregion

//region /vouchers
function createVoucher(callback, {
    minutes = null,
    count = null,
    quota = null,
    note = null,
    up = null,
    down = null,
    mb = null
}) {
    console.log("Creating Voucher")
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code, data)
                break
            case 403:
            case 500:
            default:
                callback()
        }
        if (code === 200) {
            callback(code, data)
        } else callback()
    },"/internal/vouchers", "POST", {
        minutes,
        count,
        quota,
        note,
        up,
        down,
        mb
    }, cookies.get("accessToken"))
}

function getOwnVouchers(callback) {
    console.log("Getting Own Vouchers")
    backendRequest((code, data) => {
        switch (code){
            case 200:
                callback(code, data)
                break
            case 403:
            case 500:
            default:
                callback()
        }
    },"/internal/vouchers/own", "GET", null, cookies.get("accessToken"))
}

function listAllVouchers(callback, inputParams = {id: undefined, userid: undefined, code: undefined, note: undefined}) {
    console.log("Listing All Vouchers")

    let searchParams = {}
    if (inputParams.id) searchParams.id = inputParams.id
    if (inputParams.userid) searchParams.userid = inputParams.userid
    if (inputParams.code) searchParams.code = inputParams.code
    if (inputParams.note) searchParams.note = inputParams.note
    console.log(searchParams)
    
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code, data)
            case 403:
            case 500:
            default:
                callback()
        }
        if (code === 200) {
            callback(code, data)
        } else callback()
    },"/internal/vouchers/listAll", "GET", null, cookies.get('accessToken'), searchParams)
}

function deleteVouchers(callback, voucherID) {
    console.log(`Deleting Voucher ${voucherID}`)
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code)
                break;
            case 403:
            case 404:
            case 500:
            default:
                callback()
        }
    },"/internal/vouchers", "DELETE", {
        "id":voucherID
    }, cookies.get("accessToken"))
}

function getVoucherInfo(callback, voucherID) {
    console.log(`Getting Info about Voucher ${voucherID}`)
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code, data)
                break;
            case 204:
                callback(code, {})
                break
            case 403:
            case 500:
            default:
                callback(code)
                break
        }
    },`/internal/vouchers/info/${voucherID}`,"GET", null, cookies.get("accessToken"))
}
//endregion
//region /internal/admin
function addUser(callback, username, password) {
    addUsers(callback, [{username, password}])
}

function addUsers(callback, users) {
    console.log(`Creating Users`)
    console.log(users)
    backendRequest((code, data) => {
        switch(code){
            case 201:
                callback(code, true)
                break;
            case 403:
            case 409:
            case 500:
            default:
                callback(code, false)
        }
        if (code === 200) {
            callback(code, true)
        } else callback(code, false)
    },"/internal/admin/user", "POST", users, cookies.get("accessToken"))
}

function deleteUser(callback, name) {
    deleteUsers(callback, [name])
}

function deleteUsers(callback, names){
    console.log(`Deleting User(s)`)
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code, true)
                break;
            case 403:
            case 404:
            case 500:
            default:
                callback(code, false)
        }
    },"/internal/admin/user", "DELETE", names, cookies.get("accessToken"))
}

function changePrivilegs(callback, name, privilege_level) {
    console.log(`Setting Privilege Level of user ${name} to ${privilege_level}`)
    backendRequest((code, data) => {
        switch(code){
            case 200:
                callback(code, data)
                break;
            case 403:
            case 404:
            case 500:
            default:
                callback(code)
        }
    },"/internal/admin/changePrivilegs", "POST", {
        "privilege_level":privilege_level,
        "username":name
    }, cookies.get("accessToken"))
}

function listUsers(callback, inputParams = {id: undefined, username: undefined, privilege_level: undefined}){
    console.log(`Listing Users`)
    
    let searchParams = {}
    if (inputParams.id) searchParams.id = inputParams.id
    if (inputParams.username) searchParams.username = inputParams.username
    if (inputParams.privilege_level) searchParams.privilege_level = inputParams.privilege_level
    
    backendRequest((code, data) => {
        switch (code){
            case 200: 
                callback(code, data)
                break
            default:
                callback(code)
        }
    }, "/internal/admin/users", "GET", undefined, cookies.get("accessToken"), searchParams)
}
//endregion

let exports = {
    isLogedIn: isLoggedIn,

    login,
    logout,
    refreshAccessToken,
    changePasswordAsUser,
    changePasswordAsAdmin,

    createVoucher,
    deleteVouchers,
    getOwnVouchers,
    listAllVouchers,
    getVoucherInfo,

    addUser,
    addUsers,
    deleteUser,
    deleteUsers,
    changePrivilegs,
    listUsers
}

export default exports