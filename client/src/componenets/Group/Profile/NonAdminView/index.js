import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ChartLeaderboard from '../../../Leaderboard/ChartLeaderboard';

const NonAdminView = ({ groupInfo, avatar, leaderboard, scoringDetails }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  //TODO add this in
  //https://www.embla-carousel.com/get-started/react/
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

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
              {console.log({ scoringDetails })}
              {scoringDetails.scoringBucketDescription && (
                <Carousel infiniteLoop interval={10000} showThumbs={false}>
                  {Object.keys(scoringDetails.scoringBucketDescription).map(
                    (bucket) => (
                      <div className='row justify-content-center pb-3'>
                        <div className='col-xs-12 col-md-8'>
                          <table
                            key={bucket}
                            className='table table-striped table-hover'
                          >
                            <thead>
                              <th colSpan={2} scope='row'>
                                {
                                  scoringDetails.scoringBucketDescription[
                                    bucket
                                  ]
                                }
                              </th>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope='row'>Play</th>
                                <th scope='row'>Points</th>
                              </tr>
                              {Object.keys(
                                scoringDetails.scoringDetailDescription[bucket]
                              ).map((detail) => (
                                <tr key={detail}>
                                  <td>
                                    {
                                      scoringDetails.scoringDetailDescription[
                                        bucket
                                      ][detail]
                                    }
                                  </td>
                                  <td>
                                    {
                                      scoringDetails.scoringPoints[bucket][
                                        detail
                                      ]
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  )}
                </Carousel>
              )}
            </div>
          </div>
          {/* {Object.keys(scoringDetails.scoringBucketDescription).map(
                (bucket) => (
                  <div key={bucket}>
                    <div>
                      {scoringDetails.scoringBucketDescription[bucket]} -----
                    </div>
                    {Object.keys(
                      scoringDetails.scoringDetailDescription[bucket]
                    ).map((detail) => (
                      <div key={detail}>
                        {
                          scoringDetails.scoringDetailDescription[bucket][
                            detail
                          ]
                        }
                      </div>
                    ))}
                  </div>
                )
              )} */}
        </div>
      </div>
    </>
  );
};

export default NonAdminView;
