import React from "react";
import voucherToolbox from "../toolboxes/voucherToolbox";
import TicketListEntry from "../components/voucherSummary";
import LoadingIndicator from "../components/loader";
import GeneralErrorMessage from "../components/errorMessage";

class GeneratorScreen extends React.Component {
    defaultConfig = {
        minutes: 45,
        count: 1,
        quota: 0,
        note: "",
        up: 1000,
        down: 1000,
        mb: 10000,
        tickets:[],
        loading:false,
        success:true
    }
    constructor(props) {
        super(props);
        this.state = this.defaultConfig

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleFormChange = this.handleFormChange.bind(this)
    }

    render() {
        //TODO Ad checkbox to show detailed options or not
        return (
            <div className={this.state.tickets.length>0 ? "center" : "centerFullscreen"}>
                <h1>Ticket-Generator</h1>
                <form onSubmit={this.handleSubmit} className="darkContainer">
                    <table>
                        <tr>
                            <th className="left outer">Anzahl</th>
                            <td className="left inner" ><input min={0} max={50} className="right" type="number" value={this.state.count} onChange={this.handleFormChange} id="count"/></td>
                            <td className="right inner"><input min={0} max={1440} className="left" type="number" value={this.state.minutes} onChange={this.handleFormChange} id="minutes"/></td>
                            <th className="right outer">Dauer</th>
                        </tr>
                        <tr>
                            <th className="left outer">Volumen</th>
                            <td className="left inner" ><input min={0} max={100_000_000}  className="right" type="number" value={this.state.mb} onChange={this.handleFormChange} id="mb"/></td>
                            <td className="right inner"><input min={0} max={100} className="left" type="number" value={this.state.quota} onChange={this.handleFormChange} id="quota"/></td>
                            <th className="right outer">Nutzungen</th>
                        </tr>
                        <tr>
                            <th className="left outer">Upload</th>
                            <td className="left inner" ><input min={0} max={50_000} className="right" type="number" value={this.state.up} onChange={this.handleFormChange} id="up"/></td>
                            <td className="right inner"><input min={0} max={50_000}  className="left" type="number" value={this.state.down} onChange={this.handleFormChange} id="down"/></td>
                            <th className="right outer">Download</th>
                        </tr>
                    </table>
                    <input type="text" id="note" placeholder={"Bemerkung"} maxLength={50} onChange={this.handleFormChange}/>
                    <input type="submit" value="Erstelle Voucher"/>
                    {this.state.success === true ? null : <GeneralErrorMessage/>}
                </form>
                <div id="tickets">
                    {this.state.loading? <LoadingIndicator/> : this.state.tickets && this.state.tickets.slice(0).reverse().map((ticket, index) => <TicketListEntry ticketData={ticket} key={index}/>)}
                </div>
            </div>
        );
    }

    handleFormChange(event){
        this.editState(event.target.id, event.target.value)
    }

    handleSubmit(event){
        this.editState("loading", true)
        voucherToolbox.createVoucher((code, data)=>{
            this.editState("loading", false)
            if (code === 200) {
                this.editState("tickets", data)
            } else {
                this.editState("success", false)
            }
        }, this.state)
        event.preventDefault();
    }

    editState(key, data){
        let tempState = this.state
        tempState[key] = data
        this.setState(tempState)
    }
}

export default GeneratorScreen