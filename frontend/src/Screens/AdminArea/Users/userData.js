import React from "react";
import voucherToolbox from "../../../toolboxes/voucherToolbox";
import LoadingIndicator from "../../../components/loader";
import {Redirect} from "react-router";
import NotFoundErrorMessage from "../../../components/errorNotFound";

class adminUserDataScreen extends React.Component{
    options = {}
    constructor(props) {
        super(props);
        this.state = {
            id: props.match.params.id,
            loading: true,
            success: false,
            deleted: false
        }
        
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
    }
    
    componentDidMount() {
        this.getUser((success, user) => {
            if (success === true) {
                user.loading = false
                user.success = true
                user.deleted = false
                user.options = {
                    privilege_level: user.privilege_level,
                    newPassword: ""
                }
                this.setState(user)
            } else this.setState({
                id: this.state.id,
                loading: false,
                success: false,
                deleted: false
            })
        })
    }
    
    //TODO add function for Deleting User here
    
    getUser(callback) {
        voucherToolbox.listUsers((code, users) => {
            console.log("Loaded Users")
            console.log(users[0])
            if (users.length === 1) callback(true, users[0])
            else callback(false, null)
        }, {id:this.state.id})
    }
    
    deleteUser(){
        console.log("Deleting")
        voucherToolbox.deleteUser(()=>{}, this.state.username)
        this.setState({
            loading: false,
            success: true,
            deleted: true,
            id: this.state.id
        })
    }

    onChange(event){
        let tempState = this.state
        tempState.options[event.target.id] = event.target.value
        this.setState(tempState)
    }
    
    onSubmit(event){
        event.preventDefault()
        switch (event.nativeEvent.submitter.id) {
            case "privilege_level":
                //TODO Show errors
                if (String(this.state.options.privilege_level).length > 0) voucherToolbox.changePrivilegs((code, data)=>{
                    if (code === 200) console.log("Success")
                }, this.state.username, this.state.options.privilege_level)
                break;
            case "newPassword":
                //TODO Show error
                if (this.state.options.newPassword.length > 0) voucherToolbox.changePasswordAsAdmin((code)=>{
                    if (code === 200) console.log("Success")
                }, this.state.username, this.state.options.newPassword)
                break;
        }
    }
    
    render() {
        return(
            <div className="centerFullscreen">
                {this.state.loading === true ?
                    <LoadingIndicator/>
                    :
                    this.state.success === true ?
                        this.state.deleted === true ?
                            <Redirect to='/admin/userList'/>
                            :
                            <div className="center" id="specificUserContainer">
                                <h1>{this.state.username}#{this.state.id}</h1>
                                <form onSubmit={this.onSubmit}>
                                    <table>
                                        <tr>
                                            <td className="left"><input onChange={this.onChange} id="privilege_level" type="number" value={this.state.options.privilege_level}/></td>
                                            <td className="right"><input onChange={this.onChange} id="newPassword" type="password" placeholder="Neues Passwort" /></td>
                                        </tr>
                                        <tr>
                                            <td className="left"><input type="submit" value="Rang ändern" id="privilege_level"/></td>
                                            <td className="left"><input type="submit" value="Passwort ändern" id="newPassword"/></td>
                                        </tr>
                                        <tr><th colSpan="2"><input type="button" value="Nutzer entfernen" id="delete" onClick={this.deleteUser}/></th></tr>
                                        {/*TODO add button linking to Tickets*/}
                                    </table>
                                </form>
                            </div>
                        :
                        <NotFoundErrorMessage/>}
            </div>
        )
    }
}

export default adminUserDataScreen