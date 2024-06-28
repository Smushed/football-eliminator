import rosterHandler from '../handlers/rosterHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import mySportsHandler from '../handlers/mySportsHandler.js';
import positions from '../constants/positions.js';
import userHandler from '../handlers/userHandler.js';

export default (app) => {
  app.get('/api/roster/players/available', async (req, res) => {
    const { userId, searchedPosition, season, groupname } = req.query;
    const groupId = await groupHandler.getGroupData(groupname);
    const availablePlayers = await rosterHandler.availablePlayers(
      userId,
      searchedPosition,
      season,
      groupId
    );
    res.status(200).send(availablePlayers);
  });

  app.get('/api/roster/user/:season/:week/:groupname/:username', (req, res) => {
    const { groupname, username, week, season } = req.params;

    //Checks if this route received the userId before it was ready in react
    //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
    if (
      username === 'undefined' ||
      week === 0 ||
      season === '' ||
      groupname === 'undefined'
    ) {
      console.log({ groupname, username, week, season });
      res
        .status(400)
        .send(
          'Bad URL. Try refreshing or going home and coming back if this persists'
        );
      return;
    }
    Promise.all([
      groupHandler.findGroupIdByName(groupname),
      userHandler.getUserByUsername(username),
    ])
      .then(([groupId, user]) => {
        Promise.all([
          rosterHandler.getUserRoster(user._id, week, season, groupId),
          groupHandler.getGroupPositions(groupId),
        ])
          .then(([playerIdRoster, groupPositions]) => {
            Promise.all([
              groupHandler.mapGroupPositions(
                groupPositions,
                positions.positionMap
              ),
              mySportsHandler.fillUserRoster(playerIdRoster),
            ])
              .then(([groupMap, userRoster]) => {
                res.status(200).send({
                  userRoster: userRoster,
                  groupPositions: groupPositions,
                  groupMap: groupMap,
                  positionArray: positions.positionArray,
                });
              })
              .catch((err) => console.log('User Roster Layer 3', err));
          })
          .catch((err) => console.log('User Roster Layer 2', err));
      })
      .catch((err) => console.log('User Roster Layer 1', err));
  });

  app.put('/api/roster/dummyRoster/', async (req, res) => {
    const { userId, groupId, week, season, dummyRoster } = req.body;
    if (userId === undefined || groupId === '') {
      res.status(500).send('Select Someone!');
      return;
    }
    const dbResponse = await rosterHandler.dummyRoster(
      userId,
      groupId,
      week,
      season,
      dummyRoster
    );

    res.status(200).send(dbResponse);
  });

  app.put('/api/roster/user/update', async (req, res) => {
    const {
      userId,
      roster,
      droppedPlayer,
      addedPlayer,
      week,
      season,
      groupname,
      position,
    } = req.body;
    const groupId = await groupHandler.findGroupIdByName(groupname);
    try {
      const updatedRoster = await rosterHandler.updateUserRoster(
        userId,
        groupId,
        roster,
        droppedPlayer,
        addedPlayer,
        week,
        season,
        position
      );
      const response = await mySportsHandler.fillUserRoster(updatedRoster);
      res.status(200).send(response);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.get('/api/roster/lock/general', async (req, res) => {
    const lockWeek = await rosterHandler.lockPeroid();
    res.status(200).send(lockWeek);
  });

  app.get('/api/roster/lock/:season/:week/:team', async (req, res) => {
    const { season, week, team } = req.params;
    const lockPeriod = await rosterHandler.checkTeamLock(season, +week, team);
    res.status(200).send(lockPeriod);
  });

  app.get(
    '/api/roster/players/used/:username/:season/:groupname/:position',
    async (req, res) => {
      const { username, season, groupname, position } = req.params;
      Promise.all([
        groupHandler.findGroupIdByName(groupname),
        userHandler.getUserByUsername(username),
      ])
        .then(async ([groupId, user]) => {
          const usedPlayers = await rosterHandler.usedPlayersByPosition(
            user._id,
            season,
            groupId,
            position
          );
          res.status(200).send(usedPlayers);
        })
        .catch((err) => console.log(err));
    }
  );

  app.get(
    '/api/roster/getPlayersByTeam/:season/:username/:groupname/:team',
    async (req, res) => {
      const { groupname, username, team, season } = req.params;

      const groupId = await groupHandler.findGroupIdByName(groupname);
      const playersByTeam = await rosterHandler.searchAvailablePlayerByTeam(
        groupId,
        username,
        team,
        season
      );

      res.status(200).send(playersByTeam);
    }
  );

  app.get(
    '/api/roster/fullSeason/:userId/:groupId/:season',
    async (req, res) => {
      const { userId, groupId, season } = req.params;
      const allPlayers = await rosterHandler.userAllRostersForSeason(
        userId,
        groupId,
        season
      );

      res.status(200).send(allPlayers);
    }
  );

  app.get('/api/roster/positions', async (req, res) => {
    const { rosterPositions, positionMap, maxOfPosition } = positions;
    res.status(200).send({ rosterPositions, positionMap, maxOfPosition });
  });

  app.get('/api/roster/group/all/:season/:week/:groupId', async (req, res) => {
    const { season, week, groupId } = req.params;
    const allRosters = await rosterHandler.getAllRostersForGroup(
      season,
      week,
      groupId
    );
    res.status(200).send(allRosters);
  });

  app.get('/api/roster/ideal/:season/:week/:groupId', async (req, res) => {
    const { season, week, groupId } = req.params;
    const previousWeek = +week - 1;
    if (previousWeek === 0) {
      const blankRoster = await groupHandler.getBlankRoster(groupId);
      res.status(200).send(blankRoster);
      return;
    }
    const idealRoster = await groupHandler.getIdealRoster(
      groupId,
      season,
      +previousWeek
    );
    const response = await mySportsHandler.fillUserRoster(idealRoster.roster);
    res.status(200).send(response);
  });
};
