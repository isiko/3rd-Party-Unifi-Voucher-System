import React from "react";
import {Link} from "react-router-dom";

class TicketListEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.ticketData
        this.state.create_time = new Date(this.state.create_time * 1000)
    }

    render() {
        return (
            <Link to={`/tickets/${this.state._id}`} className="darkContainer">
                <h3>{this.state.code.substring(0,5)} - {this.state.code.substring(5,11)}</h3>
                {this.state.note !== "" ? <h5>{this.state.note}</h5>: null}
                <div className="center" id="entryData">
                    <p>{this.state.duration}min</p>
                    <p>{this.state.create_time.getDay()}.{this.state.create_time.getMonth()}.{this.state.create_time.getFullYear()}</p>
                    <p>{this.state.quota === 0 ? "Unbegrenzt nutzbar":`${this.state.quota} mal nutzbar`}</p>
                </div>
            </Link>
        );
    }
}

export default TicketListEntry