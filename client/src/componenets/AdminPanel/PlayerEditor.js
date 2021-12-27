import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import PropTypes from 'prop-types';

const Alert = withReactContent(Swal);

const PlayerEditor = ({ season, week, groupId }) => {

    const updateNFLRoster = () => {
        axios.get(`/api/updateTeams/${season}`)
    };

    const getMassData = () => {
        Alert.fire({
            type: `warning`,
            title: `Are you sure?`,
            text: `It will take a LONG time`,
            showCancelButton: true,
        }).then(async result => {
            if (result.value) {
                Alert.fire(`Success`, `This will be a while. Go play some games?`, `success`);
                const response = await axios.get(`/api/massPlayerUpdate/${season}/`);
                console.log(response);
            }
        });
    };

    const getWeeklyData = async () => {
        this.loading();
        try {
            await axios.get(`/api/updatePlayers/${season}/${week}`);

            this.doneLoading();
        } catch (err) {
            console.log(err)
        }
        this.doneLoading();
    };

    const rankPlayers = async () => {
        try {
            await axios.get(`/api/rankPlayers/${season}/${week}/${groupId}`)
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='row'>
            <div className='col-12'>
                <button className='btn btn-warning' onClick={() => getMassData()}>
                    Mass Update All Players
                </button>
                <br />
                <br />
                <button className='btn btn-secondary' onClick={() => updateNFLRoster()}>
                    Update NFL Roster
                </button>
                <br />
                <br />
                <button className='btn btn-secondary' onClick={() => getWeeklyData()}>
                    Update Get Weekly Data
                </button>
                <br />
                <br />
                <button className='btn btn-primary' onClick={() => rankPlayers()}>
                    Rank Players
                </button>
            </div>
        </div>
    );
};

PlayerEditor.propTypes = {
    season: PropTypes.string,
    week: PropTypes.number,
    groupId: PropTypes.string
};

export default PlayerEditor;