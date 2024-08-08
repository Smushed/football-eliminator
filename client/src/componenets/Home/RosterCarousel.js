import React from 'react';
import { RosterDisplay } from '../Roster/RosterDisplay';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { CarouselButtonRow } from '../Tools/EmblaCarouselButtons';

const RosterCarousel = ({
  week,
  bestRosterUser,
  bestRoster,
  groupPositions,
  idealRoster,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <div className='embla mb-2'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          <div className='embla__slide row d-flex justify-content-center me-3 ms-3'>
            <div className='text-center fs-3 fw-bold col-11'>
              Best from Week {week - 1} - {bestRosterUser}
            </div>
            <div className='col-12 col-md-10'>
              <RosterDisplay
                groupPositions={groupPositions}
                roster={bestRoster}
                pastLockWeek={true}
              />
            </div>
          </div>
          <div className='embla__slide row d-flex justify-content-center me-3'>
            <div className='text-center fs-3 fw-bold col-11'>
              Last Week&apos;s Ideal Roster
            </div>
            {idealRoster.length > 0 && (
              <div className='col-12 col-md-10'>
                <RosterDisplay
                  groupPositions={groupPositions}
                  roster={idealRoster}
                  pastLockWeek={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <CarouselButtonRow emblaApi={emblaApi} />
    </div>
  );
};

export default RosterCarousel;
