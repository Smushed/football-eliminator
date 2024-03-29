import React from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { RosterDisplay } from '../Roster/RosterDisplay';

const RosterCarousel = ({
  week,
  bestRosterUser,
  bestRoster,
  groupPositions,
  idealRoster,
}) => (
  <Carousel autoPlay infiniteLoop interval={10000} showThumbs={false}>
    <div className='row d-flex justify-content-center'>
      <div className='text-center fs-3 fw-bold col-11'>
        Best from Week {week - 1} - {bestRosterUser}
      </div>
      <div className='col-10'>
        <RosterDisplay
          groupPositions={groupPositions}
          roster={bestRoster}
          pastLockWeek={true}
        />
      </div>
    </div>
    <div className='row d-flex justify-content-center'>
      <div className='text-center fs-3 fw-bold col-11'>
        Last Week&apos;s Ideal Roster
      </div>
      {idealRoster.length > 0 && (
        <div className='col-10'>
          <RosterDisplay
            groupPositions={groupPositions}
            roster={idealRoster}
            pastLockWeek={true}
          />
        </div>
      )}
    </div>
  </Carousel>
);

RosterCarousel.propTypes = {
  week: PropTypes.number,
  bestRosterUser: PropTypes.string,
  groupPositions: PropTypes.array,
  bestRoster: PropTypes.array,
  idealRoster: PropTypes.array,
  leaderboard: PropTypes.array,
  leaderRoster: PropTypes.array,
};

export default RosterCarousel;
