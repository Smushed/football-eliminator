import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-collapse';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { RosterDisplay } from '../Roster';

const RosterCarousel = ({
    rowOpen,
    week,
    bestRosterUser,
    bestRoster,
    groupPositions,
    idealRoster,
    leaderboard,
    leaderRoster
}) =>
    <Collapse isOpened={rowOpen}>
        <Carousel
            autoPlay
            infiniteLoop
            interval={10000}
            showThumbs={false}
        >
            <div>
                <div>
                    <div className='rosterHomePageTitle'>
                        Best from Week {week - 1} - {bestRosterUser}
                    </div>
                    <RosterDisplay
                        groupPositions={groupPositions}
                        roster={bestRoster}
                        pastLockWeek={true}
                    />
                </div>
            </div>
            <div >
                <div>
                    <div className='rosterHomePageTitle'>
                        Last Week&apos;s Ideal
                    </div>
                    {idealRoster.length > 0 &&
                        <RosterDisplay
                            groupPositions={groupPositions}
                            roster={idealRoster}
                            pastLockWeek={true}
                        />
                    }
                </div>
            </div>
            <div >
                <div>
                    <div className='rosterHomePageTitle'>
                        Current Lead Week {week} {leaderboard[0] && leaderboard[0].UN}
                    </div>
                    {leaderRoster.length > 0 &&
                        <RosterDisplay
                            groupPositions={groupPositions}
                            roster={leaderRoster}
                            pastLockWeek={true}
                        />
                    }
                </div>
            </div>
        </Carousel>
    </Collapse>


RosterCarousel.propTypes = {
    rowOpen: PropTypes.bool,
    week: PropTypes.number,
    bestRosterUser: PropTypes.string,
    groupPositions: PropTypes.array,
    bestRoster: PropTypes.array,
    idealRoster: PropTypes.array,
    leaderboard: PropTypes.array,
    leaderRoster: PropTypes.array
}

export default RosterCarousel;