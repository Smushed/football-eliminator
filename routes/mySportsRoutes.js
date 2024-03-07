const mySportsHandler = require(`../handlers/mySportsHandler`);
const groupHandler = require('../handlers/groupHandler');
const nflTeams = require(`../constants/nflTeams`);
const s3Handler = require('../handlers/s3Handler');

module.exports = (app) => {
  app.get(`/api/nfldata/updatePlayers/:season/:week`, async (req, res) => {
    const { season, week } = req.params;

    await mySportsHandler.getWeeklyData(season, week);

    res.sendStatus(200);
  });

  app.get(`/api/nfldata/massPlayerUpdate/:season`, async (req, res) => {
    const { season } = req.params;
    //This runs the same thing as the route above but iterates over every season and week currently on the app
    const dbResponse = await mySportsHandler.getMassData(season);

    if (dbResponse.status === 200) {
      res.status(200).send(dbResponse.text);
    } else {
      //TODO Better error handling
      console.log(dbResponse.text);
    }
  });

  //Takes in teams as an array then iterates through the list and updates the rosters for each
  app.put(`/api/nfldata/updateTeams/:season`, async (req, res) => {
    const { season } = req.params;
    let { teams } = req.body;

    if (!teams) {
      teams = nflTeams.teams;
    }
    const dbResponse = mySportsHandler.updateTeamRoster(season, teams);

    res.status(200).send(dbResponse);
  });

  app.put(`/api/nfldata/updateTeams/:season/:team`, (req, res) => {
    const { season, team } = req.params;

    const dbResponse = mySportsHandler.updateTeamRoster(season, [team]);

    res.status(200).send(dbResponse);
  });

  app.get(
    `/api/nfldata/rankPlayers/:season/:week/:groupId`,
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

  app.get(`/api/nfldata/matchups/:season/:week`, async (req, res) => {
    const { season, week } = req.params;
    const matchups = await mySportsHandler.getMatchups(season, week);
    const sortedMatchups = await mySportsHandler.sortMatchups(matchups.M);
    res.status(200).send({ matchups: matchups.M, sortedMatchups });
  });

  app.post(`/api/nfldata/pullMatchUpsForDB/:season/:week`, async (req, res) => {
    const { season, week } = req.params;
    const matchups = await mySportsHandler.pullMatchUpsForDB(season, week);
    res.status(200).send(matchups);
  });

  app.put(`/api/nfldata/updatePlayerAvatar`, async (req, res) => {
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

  app.get(`/api/nfldata/currentSeasonAndWeek`, async (req, res) => {
    const seasonAndWeek = await mySportsHandler.pullSeasonAndWeekFromDB();
    res.status(200).send(seasonAndWeek);
  });
};
