import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import * as Routes from '../../constants/routes';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

class UpdateWeek extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dbPass: ``,
            currentWeek: 1,
            lockWeek: 0,
            season: `2020-2021-regular`
        };
    }

    updateWeekSeason = async () => {
        if (this.state.dbPass === ``) {
            this.handleWrongPass(`No!`);
            return;
        }
        try {
            const response = await axios.put(`/api/updateWeekSeason/${this.state.dbPass}/${this.state.season}/${this.state.currentWeek}/${this.state.lockWeek}`);
            await Alert.fire(response.data)
        } catch (err) {
            this.handleWrongPass(`Get Outta Here!`);
        }
        this.setState({ dbPass: `` });
    };

    async handleWrongPass(message) {
        await Alert.fire({
            type: 'error',
            title: message,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'X'
        });
        this.props.history.push(Routes.home);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <div>
                Don&apos;t enter this if you don&apos;t know!
                <div>
                    Current Week
                    <select value={this.state.week} onChange={this.handleChange} name='currentWeek'>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                        <option value={11}>11</option>
                        <option value={12}>12</option>
                        <option value={13}>13</option>
                        <option value={14}>14</option>
                        <option value={15}>15</option>
                        <option value={16}>16</option>
                        <option value={17}>17</option>
                    </select>
                </div>
                <div>
                    Lock Week
                    <select value={this.state.week} onChange={this.handleChange} name='lockWeek'>
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                        <option value={11}>11</option>
                        <option value={12}>12</option>
                        <option value={13}>13</option>
                        <option value={14}>14</option>
                        <option value={15}>15</option>
                        <option value={16}>16</option>
                        <option value={17}>17</option>
                    </select>
                </div>
                <div>
                    <select value={this.state.season} onChange={this.handleChange} name='season'>
                        <option value='2020-2021-regular'>2020-2021-regular</option>
                        <option value='2021-2022-regular'>2021-2022-regular</option>
                    </select>
                </div>
                <div>
                    <input type='text' value={this.state.dbPass} name='dbPass' onChange={this.handleChange} />
                </div>
                <div>
                    <button className='btn btn-info' onClick={this.updateWeekSeason}>
                        Submit
                </button>
                </div>
            </div>
        )
    }
}

UpdateWeek.propTypes = {
    history: PropTypes.any
};

export default compose(withRouter)(UpdateWeek);