import React from "react";
import voucherToolbox from "../toolboxes/voucherToolbox";
import Cookies from 'universal-cookie';
import {Redirect} from "react-router";

const cookies = new Cookies();

class Login extends React.Component {
    state = {
        redirectToReferrer: false
    }

    constructor(props) {
        super(props);
        this.state = {
            redirectToReferrer: false,
            username:"",
            password:""
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
    }

    handleUsernameChange(event){
        let tempState = this.state
        tempState.username = event.target.value
        this.setState(tempState)
    }

    handlePasswordChange(event){
        let tempState = this.state
        tempState.password = event.target.value
        this.setState(tempState)
    }

    handleSubmit(event){
        voucherToolbox.login((code, accessToken, refreshToken, success) => {
            if (success === true) {
                cookies.set('username', this.state.username, {path:'/'})
                let tempState = this.state
                tempState.redirectToReferrer = true
                this.setState(tempState)
            } else {
                //TODO add some indication that login didn't work
            }
        }, this.state.username, this.state.password)
        event.preventDefault();
    }

    render() {
        return (
            this.state.redirectToReferrer
                ?<Redirect to='/' />
                :<div className="center">
                    <div className="centerFullscreen" id="loginScreen">
                        <div id="title">
                            <h1>Login</h1>
                            <p>{process.env.REACT_APP_SYSTEM_NAME}</p>
                        </div>
                        <form onSubmit={this.handleSubmit} id="loginForm">
                            <input type="text" placeholder="Username" onChange={this.handleUsernameChange}/>
                            <input type="password" placeholder="Password" onChange={this.handlePasswordChange}/>
                            <input type="submit" value="Login" id="loginButton"/>
                        </form>
                    </div>
                </div>
        );
    }
}


export default Login