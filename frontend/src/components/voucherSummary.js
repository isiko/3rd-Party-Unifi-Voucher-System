import React from "react";
import {Link} from "react-router-dom";

class TicketListEntry extends React.Component {
    constructor(props) {
        super(props);
        // console.log(props.ticketData.create_time)
        props.ticketData.create_time = new Date(props.ticketData.create_time*1000)
        this.state = props.ticketData
    }

    render() {
        return (
            <Link to={`/tickets/${this.state._id}`} className="darkContainer">
                <h3>{this.state.code.substring(0,5)} - {this.state.code.substring(5,11)}</h3>
                {this.state.note !== "" ? <h5>{this.state.note}</h5>: null}
                <div className="center" id="entryData">
                    <p>{this.state.duration}min</p>
                    <p>{this.state.create_time.toLocaleDateString()}</p>
                    <p>{this.state.quota === 0 ? "Unbegrenzt nutzbar":`${this.state.quota} mal nutzbar`}</p>
                </div>
            </Link>
        );
    }
}

export default TicketListEntry