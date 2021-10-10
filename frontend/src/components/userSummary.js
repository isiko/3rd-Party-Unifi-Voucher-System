import React from "react";
import {Link} from "react-router-dom";

class UserListEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.userData
    }

    render() {
        return (
            <Link to={`/admin/user/${this.state.id}`} className="darkContainer"> <h3>{this.state.username}#{this.state.id} (lvl {this.state.privilege_level})</h3> </Link>
        );
    }
}

export default UserListEntry