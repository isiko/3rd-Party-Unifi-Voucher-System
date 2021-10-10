import React from "react";
import Cookies from "universal-cookie";
import {Link, Route, Switch} from "react-router-dom";
import {Redirect} from "react-router";
import addUserScreen from "./addUser";
import userListScreen from "./userList";
import adminTicketListScreen from "./ticketList";
import adminUserDataScreen from "./userData";

const cookies = new Cookies();

class AdminScreen extends React.Component {
    render(){
        return(
            cookies.get("privilege_level") >= 2 ?
                <div>
                    <nav className="navbar navbar-expand-lg navbar-light bg-light">
                        <ul className="navbar-nav mr-auto">
                            <li style={{float: "center"}}><Link to={'/admin/userList'} className="nav-link">User List</Link>
                            </li>
                            <li style={{float: "center"}}><Link to={'/admin/addUser'} className="nav-link">Add new User</Link>
                            </li>
                            <li style={{float: "center"}}><Link to={'/admin/ticketList'} className="nav-link">Complete Ticket
                                List</Link></li>
                        </ul>
                    </nav>
                    <Switch>
                        <Route exact path='/admin' component={() => {
                            return (<Redirect to='/admin/addUser'/>)
                        }}/>
                        <Route exact path='/admin' component={addUserScreen}/>
                        <Route exact path='/admin/addUser' component={addUserScreen}/>
                        <Route exact path='/admin/userList' component={userListScreen}/>
                        <Route exact path='/admin/ticketList' component={adminTicketListScreen}/>
                        <Route exact path='/admin/user/:id' component={adminUserDataScreen}/>
                        <Route><h1>Sry :(</h1></Route>
                    </Switch>
                </div>
            : <Redirect to='/'/>
        )
    }
}

export default AdminScreen