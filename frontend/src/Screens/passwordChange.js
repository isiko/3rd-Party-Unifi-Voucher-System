import React from "react";
import voucherToolbox from "../toolboxes/voucherToolbox";
import GeneralErrorMessage from "../components/errorMessage";

class ProfileScreen extends React.Component{
    formData = {oldPassword: "", newPassword: ""}

    constructor(props) {
        super(props);
        this.state = {
            success: true
        }
        this.submit = this.submit.bind(this)
        this.handleFormChange = this.handleFormChange.bind(this)
    }

    submit(event){
        voucherToolbox.changePasswordAsUser((success)=>{
            this.setState({success})
        }, this.formData.oldPassword, this.formData.newPassword)
        event.preventDefault();
    }

    handleFormChange(event){
        this.formData[event.target.id] = event.target.value
    }

    render() {
        return (
            <div className="center">
                <div className="centerFullscreen">
                    <h1>Passwort ändern</h1>
                    <form onSubmit={this.submit}>
                        <input type="password" id="oldPassword" onChange={this.handleFormChange} placeholder="Old Password"/>
                        <input type="password" id="newPassword" onChange={this.handleFormChange} placeholder="New Password"/>
                        <input type="submit" value="Ändern"/>
                    </form>
                    {this.state.success === true ? null : <GeneralErrorMessage/>}
                </div>
            </div>
        );
    }
}

export default ProfileScreen