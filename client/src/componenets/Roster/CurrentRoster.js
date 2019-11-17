import React, { Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import './currrentRosterStyle.css';

//TODO I need to start by updating the userRoster in a way that I can save it down to the DB
//I'm thinking of having the Available players saved down as an array
//But have the Current Roster of players saved down as "dbReadyRoster" is saved on the roster page

const CurrentRoster = (props) => {
    return (
        <Fragment>
            {console.log(props)}
            <Row>
                <Col xs='12'>
                    Roster
                </Col>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    QB
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    RB
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    RB
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    WR
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    WR
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    Flex
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    TE
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    K
                </div>
                <div className='player'>
                    Player Name, Team
                </div>
            </Row>

        </Fragment>
    )
};



export default CurrentRoster;