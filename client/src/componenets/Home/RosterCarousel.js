import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { RosterDisplay } from '../Roster/RosterDisplay';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const RosterCarousel = ({
  week,
  bestRosterUser,
  bestRoster,
  groupPositions,
  idealRoster,
}) => {
  //TODO add this in
  //https://www.embla-carousel.com/get-started/react/
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  return (
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
};

export default RosterCarousel;
