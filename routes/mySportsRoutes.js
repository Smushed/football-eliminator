import mySportsHandler from '../handlers/mySportsHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import nflTeams from '../constants/nflTeams.js';
import s3Handler from '../handlers/s3Handler.js';

export default (app) => {
  app.get('/api/nfldata/updatePlayers/:season/:week', async (req, res) => {
    const { season, week } = req.params;

    await mySportsHandler.getWeeklyData(season, week);

    res.sendStatus(200);
  });

  app.get('/api/nfldata/massPlayerUpdate/:season', async (req, res) => {
    const { season } = req.params;
    const dbResponse = await mySportsHandler.getMassData(season);

    if (dbResponse.status === 200) {
      res.status(200).send(dbResponse.text);
    } else {
      res.status(500).send(dbResponse.text);
    }
  });

  app.put('/api/nfldata/updateTeams/:season', async (req, res) => {
    const { season } = req.params;
    let { teams } = req.body;

    if (!teams) {
      teams = nflTeams.teams;
    }
    const dbResponse = mySportsHandler.updateTeamRoster(season, teams);

    res.status(200).send(dbResponse);
  });

  app.put('/api/nfldata/updateTeams/:season/:team', (req, res) => {
    const { season, team } = req.params;

    const dbResponse = mySportsHandler.updateTeamRoster(season, [team]);

    res.status(200).send(dbResponse);
  });

  app.get(
    '/api/nfldata/rankPlayers/:season/:week/:groupId',
    async (req, res) => {
      const { season, week, groupId } = req.params;

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
    }
  );

  app.get('/api/nfldata/matchups/:season/:week', async (req, res) => {
    const { season, week } = req.params;
    const matchups = await mySportsHandler.getMatchups(season, week);
    const sortedMatchups = await mySportsHandler.sortMatchups(
      matchups.matchups
    );
    res.status(200).send({ matchups: matchups.matchups, sortedMatchups });
  });

  app.post('/api/nfldata/pullMatchUpsForDB/:season/:week', async (req, res) => {
    const { season, week } = req.params;
    const matchups = await mySportsHandler.pullMatchUpsForDB(season, week);
    res.status(200).send(matchups);
  });

  app.put('/api/nfldata/updatePlayerAvatar', async (req, res) => {
    let { teams } = req.body;
    if (!teams) {
      teams = nflTeams.teams;
    }
    const playerArrayFromDB =
      await mySportsHandler.getAllPlayersMySportsIdByTeamNonZeroESPNID(teams);
    console.log('Updating Player Avatars');
    s3Handler.updatePlayerAvatars(playerArrayFromDB);
    res.sendStatus(200);
  });

  app.get('/api/nfldata/currentSeasonAndWeek', async (req, res) => {
    const seasonAndWeek = await mySportsHandler.pullSeasonAndWeekFromDB();
    res.status(200).send(seasonAndWeek);
  });
};
