import React, { Component } from 'react';
import { withAuthorization } from './Session';
import axios from 'axios';
import 'react-table/react-table.css';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

class SeasonLongScore extends Component {
    constructor(props) {
        super(props)
        this.state = {
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            console.log(this.props.match.params.userId)
        };
    };

    render() {
        return (
            <div>
                BAZINGA

            </div>
        );
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(SeasonLongScore);