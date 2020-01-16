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

            this.seasonData(this.props.match.params.userId, this.props.season);
        };
    };

    seasonData(userId, season) {
        this.loading();
        axios.get(`/api/seasonLongScore/${userId}/${season}`)
            .then(res => {
                this.doneLoading();
                console.log(res.data)
            }).catch(err => {
                console.log(`roster data error`, err); //TODO better error handling
            });
    };

    loading() {
        Alert.fire({
            title: 'Loading',
            text: 'Loading available players',
            imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading Football',
            showConfirmButton: false,
            showCancelButton: false
        });
    };

    doneLoading() {
        Alert.close()
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