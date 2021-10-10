import React from "react";
import Cookies from "universal-cookie";
import {Link, Route, Switch} from "react-router-dom";
import voucherToolbox from "../toolboxes/voucherToolbox";
import generatorScreen from "./generator";
import adminScreen from "./AdminArea/admin";
import profileScreen from "./passwordChange";
import ticketScreen from "./Tickets/tickets";
import specificVoucher from "./Tickets/specificVoucher";
import {Redirect} from "react-router";

const cookies = new Cookies();

function logout() {
    //TODO maby ad someting if logout didn't work
    voucherToolbox.logout(()=>{})
}

class LogoutButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};
        // This binding is necessary to make `this` work in the callback
        this.logout = logout.bind(this)
    }

    render() {
        return (<Link to={'/login'} className="nav-link" onClick={this.logout}>Logout</Link>);
    }
}

class homeScreen extends React.Component {
    intervalID = null
    componentDidMount() {
        let updateInteval=10*1000
        setInterval(()=>{
            let refreshToken = cookies.get("refreshToken");
            if (refreshToken !== undefined) voucherToolbox.refreshAccessToken((code, token)=>{
                if (code){
                    cookies.set("accessToken", token, {path:"/", maxAge:updateInteval})
                } else logout()
            },refreshToken)
        },updateInteval)
    }

    componentWillUnmount() {
        if (this.intervalID !== null) clearInterval(this.intervalID)
    }

    render() {
        return (
            <div id="homeScreen">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <ul className="navbar-nav mr-auto">
                        <li style={{float: "left"}}><Link to={'/generator'} className="nav-link">Generator</Link></li>
                        <li style={{float: "left"}}><Link to={'/tickets'} className="nav-link">Tickets</Link></li>
                        {cookies.get("privilege_level") >= 2 ? <li style={{float: "left"}}><Link to={'/admin'} className="nav-link">Administration</Link></li> : null}
                        <li style={{float: "right"}}><LogoutButton/></li>
                        <li style={{float: "right"}}><Link to={'/profile'} className="nav-link">Passwort ändern</Link></li>
                    </ul>
                </nav>
                <Switch>
                    <Route exact path='/' component={()=> {
                        return (<Redirect to='/generator'/>)
                    }} />
                    <Route exact path='/generator' component={generatorScreen} />
                    <Route exact path='/profile' component={profileScreen} />
                    <Route exact path='/tickets' component={ticketScreen} />
                    <Route exact path='/tickets/:id' component={specificVoucher} />
                    <Route exact path='/about' component={ticketScreen} />
                    <Route exact path='/impressum' component={ticketScreen} />
                    <Route path='/admin' component={adminScreen} />
                    <Route><h1>Sorry, couldn't find this :'(</h1></Route>
                </Switch>
            </div>
        );
    }
}

export default homeScreen