import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Container, Row, Col } from 'reactstrap';
import { RosterDisplay } from '../Roster';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PropTypes from 'prop-types';

import './seasonLongScoreStyle.css';

const Alert = withReactContent(Swal);

class SeasonLongScore extends Component {
    constructor(props) {
        super(props)
        this.state = {
            displayReadyRosters: []
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            this.seasonData(this.props.match.params.userId, this.props.season);
        }
    }

    componentDidMount() {
        if (this.props.season !== `` && this.props.match.params.userId !== ``) {
            this.seasonData(this.props.match.params.userId, this.props.season);
        }
    }

    seasonData(userId, season) {
        this.loading();
        axios.get(`/api/seasonLongScore/${userId}/${season}`)
            .then(res => {
                this.doneLoading();
                this.sortRoster(res.data);
            }).catch(err => {
                console.log(`roster data error`, err); //TODO better error handling
            });
    }

    sortRoster(seasonRostersArray) {
        const displayReadyRosters = [];
        for (let i = 0; i < seasonRostersArray.length; i++) {
            displayReadyRosters[i] = this.sortWeek(seasonRostersArray[i]);
        }
        this.setState({ displayReadyRosters });
    }

    sortWeek(weekArray) {
        const displayReadyRoster = {}; //It's saved as an object in the database

        //Here we iterate through the roster of the player and put them into an object for the order we want
        for (const player of weekArray) {
            const position = player.position;
            //If the position is QB, TE, or K then we can just put them directly in
            if (position === `QB`) {
                displayReadyRoster.QB = player;
                //If it's RB or WR then we need to assign it manually to the 1, 2 and flex spots
                //First we need to check the RB/WR 1 & 2 spots then assign it into the flex spot
            } else if (position === `RB`) {
                if (!displayReadyRoster.RB1) {
                    displayReadyRoster.RB1 = player;
                } else if (!displayReadyRoster.RB2) {
                    displayReadyRoster.RB2 = player;
                } else if (!displayReadyRoster.Flex) {
                    displayReadyRoster.Flex = player;
                }
            } else if (position === `WR`) {
                if (!displayReadyRoster.WR1) {
                    displayReadyRoster.WR1 = player;
                } else if (!displayReadyRoster.WR2) {
                    displayReadyRoster.WR2 = player;
                } else if (!displayReadyRoster.Flex) {
                    displayReadyRoster.Flex = player;
                }
            } else if (position === `TE`) {
                displayReadyRoster.TE = player;
            } else if (position === `K`) {
                displayReadyRoster.K = player;
            }
        }
        return displayReadyRoster;
    }

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
    }

    doneLoading() {
        Alert.close()
    }


    render() {
        const rosterPlayers = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'Flex', 'TE', 'K'];

        return (
            <div>
                <Container fluid={true}>
                    <Row>
                        {this.state.displayReadyRosters.map((weekRoster, i) => (
                            //The +1 in the week is because arrays begin at 0
                            <WeekDisplay weekRoster={weekRoster} week={i + 1} key={i} rosterPlayers={rosterPlayers} />
                            // <RosterDisplay rosterPlayers={rosterPlayers} addDropPlayer={null} currentRoster={weekRoster} nameCol={'12'} />
                        ))}
                    </Row>
                </Container>
            </div >
        );
    }
}

const WeekDisplay = (props) => (
    <Col xs='3'>
        <Row>
            <Col xs='12' className={'weekHeader'}>
                Week {props.week}
            </Col>
        </Row>
        <RosterDisplay rosterPlayers={props.rosterPlayers} addDropPlayer={false} currentRoster={props.weekRoster} nameCol={'9'} scoreCol={'3'} />
    </Col>
);

SeasonLongScore.propTypes = {
    season: PropTypes.string,
    match: PropTypes.any
};

WeekDisplay.propTypes = {
    week: PropTypes.number,
    rosterPlayers: PropTypes.array,
    weekRoster: PropTypes.array
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(SeasonLongScore);