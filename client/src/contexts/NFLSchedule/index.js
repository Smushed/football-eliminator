import { useState, createContext } from 'react';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler';

const NFLScheduleContext = createContext();

const NFLScheduleWrapper = ({ children }) => {
  const [currentNFLTime, setCurrentNFLTime] = useState({
    season: '',
    week: 1,
    lockWeek: 0,
  });

  const getSeasonAndWeek = async () => {
    try {
      const { data } = await axiosHandler.get(
        '/api/nfldata/currentSeasonAndWeek'
      );
      setCurrentNFLTime({
        season: data.season,
        week: data.week,
        lockWeek: data.lockWeek,
        seasonOver: data.seasonOver,
      });
    } catch (err) {
      httpErrorHandler(err);
    }
  };
  return (
    <NFLScheduleContext.Provider value={{ currentNFLTime, getSeasonAndWeek }}>
      {children}
    </NFLScheduleContext.Provider>
  );
};

export { NFLScheduleContext };

export default NFLScheduleWrapper;
