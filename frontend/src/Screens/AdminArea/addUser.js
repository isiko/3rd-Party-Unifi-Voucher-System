import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import {Redirect} from "react-router";

class addUserScreen extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            username:"",
            password:""
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
    }

    handleFieldChange(event) {
        let tempstate = this.state
        tempstate[event.target.id] = event.target.value
        this.setState(tempstate)
    }
    
    handleSubmit(event){
        voucherToolbox.addUser((code) => {
            //TODO add error on failiour
            this.setState({redirect: true, username:"", password:""})
        }, this.state.username, this.state.password)
        event.preventDefault()
    }
    
    render() {
        return(
            this.state.redirect === false
            ? <div className="center centerFullscreen">
                    <h1>Hier Nutzer hinzufügen</h1>
                    <form onSubmit={this.handleSubmit}>
                        <input type="text" id="username" onChange={this.handleFieldChange} placeholder="Name"/>
                        <input type="password" id="password" onChange={this.handleFieldChange} placeholder="Passwort"/>
                        <input type="submit" value="Hinzufügen"/>
                    </form>
                </div>
            : <Redirect to="/admin/userList"/>
        )
    }
}

export default addUserScreen