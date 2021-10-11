import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import {Redirect} from "react-router";
import LoadingIcon from "../../components/loader";
import GeneralErrorMessage from "../../components/errorMessage";

class SpecificVoucherScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: props.match.params.id,
            loading: true,
            success: true
        }
        this.deleteThis = this.deleteThis.bind(this)
    }

    componentDidMount() {
        this.getTicket((success, ticket)=>{
            if (success === true){
                ticket.loading = false
                ticket.success = true
                ticket.deleted = false
                this.setState(ticket)
            } else this.setState({
                _id: this.state._id,
                loading: false,
                success: false,
                deleted: false
            })
        },this.state._id)
    }

    getTicket(callback){
        if (window.$tickets){
            let possibleTicket = window.$tickets.find(item=> item._id === this.state._id)
            if (possibleTicket !== null) {
                callback(true, possibleTicket)
                return;
            }
        }
        voucherToolbox.getVoucherInfo((code, data) => {
            console.log("Had to load Ticket from Backend")
            if(code === 200) callback(true, data)
            else callback(false, data);
        },this.state._id)
    }

    deleteThis(){
        voucherToolbox.deleteVouchers(()=>{}, this.state._id)
        if (window.$tickets) {
            window.$tickets.splice(window.$tickets.indexOf(window.$tickets.find(item => item._id === this.state._id)))
        }
        this.setState({
            loading: false,
            success: true,
            deleted: true,
            _id: this.state._id
        })
    }

    render() {
        return(
            <div className="centerFullscreen">
                {this.state.loading === true ?
                    <LoadingIcon/>
                    :
                    this.state.success === true ?
                        this.state.deleted === true ?
                            <Redirect to='/tickets' />
                            :
                            <div className="center" id="specificVoucherContainer">
                                <h1>{this.state.code.substring(0, 5)} - {this.state.code.substring(5, 11)}</h1>
                                {this.state.note !== "" ? <h3>{this.state.note}</h3>: null}
                                <table>
                                    <tr>
                                        <th className="left">Erstellt am:</th>
                                        <td className="right">{new Date(this.state.create_time * 1000).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th className="left">Nutzungen:</th>
                                        <td className="right">{this.state.quota === 0 ? "Unbegrenzt nutzbar":`${this.state.quota} mal nutzbar`}</td>
                                    </tr>
                                    <tr>
                                        <th className="left">Dauer:</th>
                                        <td className="right">{this.state.duration} Minuten</td>
                                    </tr>
                                    <tr>
                                        <th className="left">Datenvolumen:</th>
                                        <td className="right">{this.state.qos_usage_quota}MB</td>
                                    </tr>
                                </table>
                                <table className="highlightContainer">
                                    <tr>
                                        <th>Upload</th>
                                        <th>Donwload</th>
                                    </tr>
                                    <tr>
                                        <td>{this.state.qos_rate_max_up}Mbit/s</td>
                                        <td>{this.state.qos_rate_max_down}Mbit/s</td>
                                    </tr>
                                </table>
                                <input type="submit" value="Delete" id="delete" onClick={this.deleteThis}/>
                            </div>
                        :
                        <GeneralErrorMessage/>}
            </div>
        );
    }
}

export default SpecificVoucherScreen