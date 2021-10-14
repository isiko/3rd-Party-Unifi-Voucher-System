import React from "react";
import voucherToolbox from "../../toolboxes/voucherToolbox";
import LoadingIndicator from "../../components/loader";
import NotFoundErrorMessage from "../../components/errorNotFound";
import {Link} from "react-router-dom";

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
                            ? <div style={{"width": "50%"}}>
                                <table className="highlightContainer userList">
                                    <tr>
                                        <th className="userListEntry">ID</th>
                                        <th className="userListEntry">Nutzername</th>
                                        <th className="userListEntry">Rang</th>
                                    </tr>
                                    {this.state.users && this.state.users.slice(0).map((user, index) => 
                                        <tr className="userListEntry">
                                            <td className="userListEntry">{user.id}</td>
                                            <td className="userListEntry">{user.username}</td>
                                            <td className="userListEntry">{user.privilege_level}</td>
                                            <td className="userListEntry">
                                                <Link to={`/admin/user/${user.id}`}>
                                                    Options
                                                </Link>
                                            </td>
                                        </tr>
                                    )}
                                </table>
                            </div>
                        : <NotFoundErrorMessage/>
                }
            </div>
        )
    }
}
export default userListScreen