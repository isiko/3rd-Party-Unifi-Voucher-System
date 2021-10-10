import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch} from "react-router-dom";
import PublicRoute from "./components/publicRoute";
import PrivateRoute from "./components/privateRoute";
import homeScreen from "./Screens/home";
import Login from "./Screens/login";
import './index.css'

ReactDOM.render(
    <Router>
        <Switch>
            <PublicRoute restricted={true} component={Login} path="/login" exact/>
            <PrivateRoute component={homeScreen} path="/"/>
        </Switch>
    </Router>,
    document.getElementById('root')
);