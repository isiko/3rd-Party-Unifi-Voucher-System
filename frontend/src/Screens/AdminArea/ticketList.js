import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import LoadingIndicator from "../../components/loader";
import TicketListEntry from "../../components/voucherSummary";
import NotFoundErrorMessage from "../../components/errorNotFound";

class adminTicketListScreen extends React.Component{
    intervalID = 0
    constructor(props) {
        super(props);
        this.state = {
            tickets: [],
            loading: true
        }
        
        this.loadTickets = this.loadTickets.bind(this)
    }
    
    //TODO add Search Parameters
    loadTickets(){
        voucherToolbox.listAllVouchers((code, data) => {
            this.setState({tickets:data, loading:false})
        })
    }
    
    componentDidMount() {
        this.loadTickets()
        this.intervalID = setInterval(this.loadTickets, 10*1000)
    }
    
    componentWillUnmount() {
        if (this.intervalID !== null) clearInterval(this.intervalID)
    }

    //TODO redo Entrys to add user
    render() {
        return(
            <div className="center">
                <h1>Ticketlist</h1>
                {
                    this.state.loading === true
                        ? <LoadingIndicator/>
                        : this.state.tickets && this.state.tickets.length > 0
                            ? this.state.tickets && this.state.tickets.slice(0).reverse().map((ticket, index) => <TicketListEntry ticketData={ticket} key={index}/>)
                            : <NotFoundErrorMessage/>
                }
            </div>
        )
    }
}

export default adminTicketListScreen