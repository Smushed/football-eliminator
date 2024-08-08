import { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ChartLeaderboard from '../../../Leaderboard/ChartLeaderboard';
import {
  NextCarouselButton,
  PrevCarouselButton,
} from '../../../Tools/EmblaCarouselButtons';

const NonAdminView = ({ groupInfo, avatar, leaderboard, scoringDetails }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };
  return (
    <>
      <div className='mt-5 justify-content-center row'>
        <div className='col-xs-12 col-lg-8 border rounded shadow'>
          <div className='row mt-3 mb-3'>
            <div className='col-md-12 col-lg-6 mt-1 text-center'>
              <img
                name='avatar'
                className='rounded'
                alt='Group Avatar'
                src={avatar}
              />
            </div>
            <div className='col-md-12 col-lg-6 mt-1'>
              <div className='row mt-2'>
                <div className='col-xs-12 col-md-11 border rounded pb-1'>
                  <small className='row'>
                    <div className=' col-12 text-decoration-underline'>
                      Group Name:
                    </div>
                  </small>
                  <div className='row justify-content-center'>
                    <div className='col-11'>
                      {groupInfo.name && groupInfo.name}
                    </div>
                  </div>
                </div>
              </div>
              <div className='row mt-2'>
                <div className='col-xs-12 col-md-11 border rounded pb-1'>
                  <div className='row'>
                    <small className='col-12 text-decoration-underline'>
                      Description:
                    </small>
                  </div>
                  <div className='row justify-content-center'>
                    <div className='col-11 groupDescriptionHeight lh-sm'>
                      <div>
                        {groupInfo.description && groupInfo.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row mt-2 mt-md-2 justify-content-center'>
                <div className='col-6 text-center'>
                  <button
                    className='btn btn-primary btn-sm'
                    onClick={() => toggleLeaderboard()}
                  >
                    Toggle Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLeaderboard && (
        <div className='row popInAnimation mt-4 justify-content-center'>
          <div className='justify-content-center col-xs-12 col-md-8 leaderboardContainter border rounded shadow'>
            <ChartLeaderboard leaderboard={leaderboard} />
          </div>
        </div>
      )}
      <div className='row justify-content-center mt-4'>
        <div className='col-xs-12 col-md-8 border rounded shadow pb-3'>
          <div className='row mt-2 mb-2'>
            <h5 className='col-12 text-center'>Group Scoring System:</h5>
          </div>
          <div className='row justify-content-center'>
            <div className='col-xs-12 col-md-6'>
              {scoringDetails.scoringBucketDescription && (
                <div className='embla'>
                  <div className='embla__viewport' ref={emblaRef}>
                    <div className='embla__container ps-2'>
                      {Object.keys(scoringDetails.scoringBucketDescription).map(
                        (bucket) => (
                          <div className='embla__slide row justify-content-center pb-1'>
                            <div className='col-12 col-md-10'>
                              <table
                                key={bucket}
                                className='table table-striped table-hover border border-light rounded'
                              >
                                <thead>
                                  <th
                                    colSpan={2}
                                    scope='row'
                                    className='text-center'
                                  >
                                    {
                                      scoringDetails.scoringBucketDescription[
                                        bucket
                                      ]
                                    }
                                  </th>
                                </thead>
                                <tbody>
                                  {Object.keys(
                                    scoringDetails.scoringDetailDescription[
                                      bucket
                                    ]
                                  ).map((detail) => (
                                    <tr key={detail}>
                                      <td className='ps-5 ps-md-4 w-75'>
                                        {
                                          scoringDetails
                                            .scoringDetailDescription[bucket][
                                            detail
                                          ]
                                        }
                                      </td>
                                      <td>
                                        {
                                          scoringDetails.scoringPoints[bucket][
                                            detail
                                          ]
                                        }{' '}
                                        pt
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className='row justify-content-center'>
                    <div className='col-3 text-center'>
                      <PrevCarouselButton scrollPrev={scrollPrev} />
                    </div>
                    <div className='col-3 text-center'>
                      <NextCarouselButton scrollNext={scrollNext} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NonAdminView;
