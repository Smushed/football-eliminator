import rosterHandler from '../handlers/rosterHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import mySportsHandler from '../handlers/mySportsHandler.js';
import positions from '../constants/positions.js';
import userHandler from '../handlers/userHandler.js';
import {
  authMiddleware,
  verifyUserIsSameEmailUserId,
} from '../handlers/authHandler.js';

export default (app) => {
  app.get('/api/roster/players/available', authMiddleware, async (req, res) => {
    const { username, searchedPosition, season, groupname } = req.query;
    Promise.all([
      groupHandler.getGroupData(groupname),
      userHandler.getUserByUsername(username),
    ])
      .then(([group, user]) => {
        rosterHandler
          .availablePlayers(user._id, searchedPosition, season, group._id)
          .then((availablePlayers) => res.status(200).send(availablePlayers));
      })
      .catch((err) => {
        console.log('Error finding available players: ', {
          username,
          searchedPosition,
          season,
          groupname,
          err,
        });
        res
          .status(err.status || 500)
          .send(err.message || 'Error finding available players');
      });
  });

  app.get(
    '/api/roster/user/:season/:week/:groupname/:username',
    authMiddleware,
    (req, res) => {
      const { groupname, username, week, season } = req.params;

      //Checks if this route received the userId before it was ready in react
      //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
      if (
        username === 'undefined' ||
        week === 0 ||
        season === '' ||
        groupname === 'undefined'
      ) {
        console.log('Trying to pull roster before data is populated: ', {
          groupname,
          username,
          week,
          season,
        });
        res
          .status(400)
          .send(
            'Bad URL. Try refreshing or going home and coming back if this persists'
          );
        return;
      }
      Promise.all([
        groupHandler.getGroupData(groupname),
        userHandler.getUserByUsername(username),
      ])
        .then(([group, user]) => {
          Promise.all([
            rosterHandler.getUserRoster(user._id, week, season, group._id),
            groupHandler.getGroupPositions(group._id),
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
                .catch((err) => {
                  console.log('User Roster Layer 3', {
                    groupname,
                    username,
                    week,
                    season,
                    err,
                  });
                  res
                    .status(err.status || 500)
                    .send(err.message || 'Error getting group and user data');
                });
            })
            .catch((err) => {
              console.log('User Roster Layer 2', {
                groupname,
                username,
                week,
                season,
                err,
              });
              res
                .status(err.status || 500)
                .send(err.message || 'Error getting group and user data');
            });
        })
        .catch((err) => {
          console.log('User Roster Layer 1', {
            groupname,
            username,
            week,
            season,
            err,
          });
          res
            .status(err.status || 500)
            .send(err.message || 'Error getting group and user data');
        });
    }
  );

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

  app.put('/api/roster/user/update', authMiddleware, async (req, res) => {
    try {
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
      await verifyUserIsSameEmailUserId(req.currentUser, userId);
      const group = await groupHandler.getGroupData(groupname);
      const updatedRoster = await rosterHandler.updateUserRoster(
        userId,
        group._id,
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
      res
        .status(err.status || 500)
        .send(err.message || 'Error updating roster, please refresh');
    }
  });

  app.get('/api/roster/lock/general', async (req, res) => {
    try {
      const lockWeek = await rosterHandler.lockPeroid();
      res.status(200).send(lockWeek);
    } catch (err) {
      console.log('Error pulling general lock week data: ', { err });
      res
        .status(err.status || 500)
        .send(err.message || 'Error getting lock week data');
    }
  });

  app.get('/api/roster/lock/:season/:week/:team', async (req, res) => {
    const { season, week, team } = req.params;
    try {
      const lockPeriod = await rosterHandler.checkTeamLock(season, +week, team);
      res.status(200).send(lockPeriod);
    } catch (err) {
      console.log('Error checking if team has started: ', {
        season,
        week,
        team,
        err,
      });
      res
        .status(err.status || 500)
        .send(err.message || 'Error checking if team has started');
    }
  });

  app.get(
    '/api/roster/players/used/:username/:season/:groupname/:position',
    authMiddleware,
    async (req, res) => {
      const { username, season, groupname, position } = req.params;
      Promise.all([
        groupHandler.getGroupData(groupname),
        userHandler.getUserByUsername(username),
      ])
        .then(async ([group, user]) => {
          const usedPlayers = await rosterHandler.usedPlayersByPosition(
            user._id,
            season,
            group._id,
            position
          );
          res.status(200).send(usedPlayers);
        })
        .catch((err) => {
          console.log('Error getting roster for player: ', {
            username,
            season,
            groupname,
            position,
            err,
          });
          res
            .status(err.status || 500)
            .send(err.message || 'Error pulling roster');
        });
    }
  );

  app.get(
    '/api/roster/getPlayersByTeam/:season/:username/:groupname/:team',
    authMiddleware,
    async (req, res) => {
      try {
        const { groupname, username, team, season } = req.params;

        const group = await groupHandler.getGroupData(groupname);
        const playersByTeam = await rosterHandler.searchAvailablePlayerByTeam(
          group._id,
          username,
          team,
          season
        );

        res.status(200).send(playersByTeam);
      } catch (err) {
        console.log('Error getting available players by team: ', {
          params: req.params,
          err,
        });
        res
          .status(err.status || 500)
          .send(err.message || 'Error searching for available players by team');
      }
    }
  );

  app.get(
    '/api/roster/fullSeason/:userId/:groupId/:season',
    async (req, res) => {
      const { userId, groupId, season } = req.params;
      try {
        const allPlayers = await rosterHandler.userAllRostersForSeason(
          userId,
          groupId,
          season
        );
        res.status(200).send(allPlayers);
      } catch (err) {
        console.log('Error getting full seasons worth of rosters: ', {
          userId,
          groupId,
          season,
          err,
        });
        res.status(err.status || 500).send(err.message || 500);
      }
    }
  );

  app.get('/api/roster/positions', async (req, res) => {
    const { rosterPositions, positionMap, maxOfPosition } = positions;
    res.status(200).send({ rosterPositions, positionMap, maxOfPosition });
  });

  app.get(
    '/api/roster/group/all/:season/:week/:groupId',
    authMiddleware,
    async (req, res) => {
      try {
        const { season, week, groupId } = req.params;
        const allRosters = await rosterHandler.getAllRostersForGroup(
          season,
          week,
          groupId
        );
        res.status(200).send(allRosters);
      } catch (err) {
        console.log('Error getting all rosters for group: ', {
          params: req.params,
          err,
        });
        res
          .status(err.status || 500)
          .send(err.message || 'Error finding roster data for group');
      }
    }
  );

  app.get(
    '/api/roster/ideal/:season/:week/:groupId',
    authMiddleware,
    async (req, res) => {
      try {
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
        const response = await mySportsHandler.fillUserRoster(
          idealRoster.roster
        );
        res.status(200).send(response);
      } catch (err) {
        console.log('Error getting ideal roster ', { params: req.params, err });
        res.status(500).send('Error getting ideal roster');
      }
    }
  );
};
