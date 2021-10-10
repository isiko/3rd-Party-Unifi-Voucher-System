import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import LoadingIndicator from "../../components/loader";
import UserListEntry from "../../components/userSummary";

class userListScreen extends React.Component{
    
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: true
        }
        this.loadUsers = this.loadUsers.bind(this)
    }
    
    //Add Search Params
    loadUsers() {
        voucherToolbox.listUsers((code, data) => {
            this.setState({
                users:data,
                loading: false
            })
        })
    }
    
    componentDidMount() {
        this.loadUsers()
        this.intervalID = setInterval(this.loadUsers, 10*1000)
    }
    
    componentWillUnmount() {
        if (this.intervalID !== null) clearInterval(this.intervalID)
    }

    render() {
        return(
            <div className="center">
                <h1>Userlist</h1>
                {
                    this.state.loading === true
                    ? <LoadingIndicator/>
                    : this.state.users && this.state.users.length>0
                        ? this.state.users && this.state.users.slice(0).map((user,index) => <UserListEntry userData={user}/>)
                        : <h3>Sorry, wir haben nix gefunden :'(</h3>
                }
            </div>
        )
    }
}
export default userListScreen