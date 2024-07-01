import mySportsHandler from '../handlers/mySportsHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import nflTeams from '../constants/nflTeams.js';
import s3Handler from '../handlers/s3Handler.js';
import { authMiddleware } from '../handlers/authHandler.js';

export default (app) => {
  app.put(
    '/api/nfldata/updatePlayers/:season/:week',
    authMiddleware,
    async (req, res) => {
      const { season, week } = req.params;
      try {
        await mySportsHandler.getWeeklyData(season, week);
        res.sendStatus(200);
      } catch (err) {
        console.log('Error updating players by week: ', { season, week, err });
        res
          .status(err.status || 500)
          .send(err.message || 'Error updating players by week');
      }
    }
  );

  app.put(
    '/api/nfldata/massPlayerUpdate/:season',
    authMiddleware,
    async (req, res) => {
      const { season } = req.params;
      try {
        const dbResponse = await mySportsHandler.getMassData(season);
        res.status(200).send(dbResponse.text);
      } catch (err) {
        console.log('Error updating players for season: ', { season, err });
        res
          .status(err.status || 500)
          .send(err.message || 'Error updating players for whole season');
      }
    }
  );

  app.put(
    '/api/nfldata/updateTeams/:season',
    authMiddleware,
    async (req, res) => {
      const { season } = req.params;
      let { teams } = req.body;
      if (!teams) {
        teams = nflTeams.teams;
      }
      try {
        const dbResponse = mySportsHandler.updateTeamRoster(season, teams);
        res.status(200).send(dbResponse);
      } catch (err) {
        console.log('Error updating current roster: ', { season, teams, err });
        res
          .status(err.status || 500)
          .send(err.message || 'Error updating roster');
      }
    }
  );

  app.put(
    '/api/nfldata/rankPlayers/:season/:week/:groupId',
    authMiddleware,
    async (req, res) => {
      const { season, week, groupId } = req.params;
      try {
        const groupScore = await groupHandler.getGroupScore(groupId);
        const rankedPlayersByPosition = await mySportsHandler.rankPlayers(
          season,
          week,
          groupScore,
          true
        );

        const dbResponse = await mySportsHandler.savePlayerRank(
          rankedPlayersByPosition
        );

        res.status(200).send(dbResponse);
      } catch (err) {
        console.log('Error ranking players: ', { season, week, groupId, err });
        res
          .status(err.status || 500)
          .send(err.message || 'Error ranking players');
      }
    }
  );

  app.get(
    '/api/nfldata/matchups/:season/:week',
    authMiddleware,
    async (req, res) => {
      const { season, week } = req.params;
      try {
        const matchups = await mySportsHandler.getMatchups(season, week);
        const sortedMatchups = await mySportsHandler.sortMatchups(
          matchups.matchups
        );
        res.status(200).send({ matchups: matchups.matchups, sortedMatchups });
      } catch (err) {
        console.log('Error getting nfl matchups for all season: ', {
          season,
          week,
          err,
        });
        res
          .status(err.status || 500)
          .send(err.message || 'Error getting NFL matchups');
      }
    }
  );

  app.post(
    '/api/nfldata/pullMatchUpsForDB/:season/:week',
    authMiddleware,
    async (req, res) => {
      const { season, week } = req.params;
      try {
        const matchups = await mySportsHandler.pullMatchUpsForDB(season, week);
        res.status(200).send(matchups);
      } catch (err) {
        console.log('Error getting updating matchups : ', {
          season,
          week,
          err,
        });
        res
          .status(err.status || 500)
          .send(err.message || 'Error updating NFL matchups');
      }
    }
  );

  app.put(
    '/api/nfldata/updatePlayerAvatar',
    authMiddleware,
    async (req, res) => {
      let { teams } = req.body;
      if (!teams) {
        teams = nflTeams.teams;
      }
      try {
        const playerArrayFromDB =
          await mySportsHandler.getAllPlayersMySportsIdByTeamNonZeroESPNID(
            teams
          );
        console.log('Updating Player Avatars');
        s3Handler.updatePlayerAvatars(playerArrayFromDB);
        res.sendStatus(200);
      } catch (err) {
        console.log('Error updating player avatars: ', { teams, err });
        res
          .status(err.status || 500)
          .send(err.message || 'Error updating player avatars');
      }
    }
  );

  app.get('/api/nfldata/currentSeasonAndWeek', async (req, res) => {
    try {
      const seasonAndWeek = await mySportsHandler.pullSeasonAndWeekFromDB();
      res.status(200).send(seasonAndWeek);
    } catch (err) {
      console.log('Error getting current NFL time: ', { err });
      res
        .status(err.status || 500)
        .send(err.message || 'Error getting current week');
    }
  });
};
