import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import TicketListEntry from "../../components/voucherSummary";
import LoadingIndicator from "../../components/loader";
import GeneralErrorMessage from "../../components/errorMessage";

class ticketScreen extends React.Component {
    intervalID = 0
    constructor(props) {
        super(props);
        this.state = {
            tickets: window.$tickets,
            loading: !(window.$tickets && window.$tickets.length >0)
        }
        this.loadTickets = this.loadTickets.bind(this)
    }

    //TODO add Search Parameters
    loadTickets() {
        voucherToolbox.getOwnVouchers((code, data)=>{
            this.setState({tickets: data, loading: false})
            window.$tickets = data
        })
    }

    componentDidMount() {
        if(!(window.$tickets && window.$tickets.length >0)) this.loadTickets()
        this.intervalID = setInterval(this.loadTickets, 10*1000)
    }

    componentWillUnmount() {
        if (this.intervalID !== null) clearInterval(this.intervalID)
    }

    render () {
        return (
            <div className="center">
                <h1> Ihre Tickets</h1>
                {
                    this.state.loading === true
                        ? <LoadingIndicator/>
                        : this.state.tickets && this.state.tickets.length>0
                            ? this.state.tickets && this.state.tickets.slice(0).reverse().map((ticket, index) => <TicketListEntry ticketData={ticket} key={index}/>)
                            :<GeneralErrorMessage/>
                }
            </div>
        );
    }
}

export default ticketScreen