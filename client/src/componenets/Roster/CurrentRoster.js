import React, { Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import './columnRosterStyle.css';

const CurrentRoster = (props) => {
    return (
        <Fragment>
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
                    {props.userRoster.QB !== 0 ?
                        props.userRoster.QB.full_name + `, ` + props.userRoster.QB.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    RB
                </div>
                <div className='player'>
                    {props.userRoster.RB1 !== 0 ?
                        props.userRoster.RB1.full_name + `, ` + props.userRoster.RB1.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    RB
                </div>
                <div className='player'>
                    {props.userRoster.RB2 !== 0 ?
                        props.userRoster.RB2.full_name + `, ` + props.userRoster.RB2.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    WR
                </div>
                <div className='player'>
                    {props.userRoster.WR1 !== 0 ?
                        props.userRoster.WR1.full_name + `, ` + props.userRoster.WR1.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    WR
                </div>
                <div className='player'>
                    {props.userRoster.WR2 !== 0 ?
                        props.userRoster.WR2.full_name + `, ` + props.userRoster.WR2.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    Flex
                </div>
                <div className='player'>
                    {props.userRoster.Flex !== 0 ?
                        props.userRoster.Flex.full_name + `, ` + props.userRoster.Flex.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    TE
                </div>
                <div className='player'>
                    {props.userRoster.TE !== 0 ?
                        props.userRoster.TE.full_name + `, ` + props.userRoster.TE.team : ``
                    }
                </div>
            </Row>

            <Row className='playerRow'>
                <div className='positionBox'>
                    K
                </div>
                <div className='player'>
                    {props.userRoster.K !== 0 ?
                        props.userRoster.K.full_name + `, ` + props.userRoster.K.team : ``
                    }
                </div>
            </Row>

        </Fragment>
    )
};



export default CurrentRoster;