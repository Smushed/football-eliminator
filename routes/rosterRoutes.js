import rosterHandler from '../handlers/rosterHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import mySportsHandler from '../handlers/mySportsHandler.js';
import positions from '../constants/positions.js';
import userHandler from '../handlers/userHandler.js';
import {
  authMiddleware,
  verifyUserIsSameEmailUserId,
} from '../handlers/authHandler.js';
import { returnError } from '../utils/ExpressUtils.js';

export default (app) => {
  app.get('/api/roster/players/available', authMiddleware, async (req, res) => {
    const { username, searchedPosition, season, groupname } = req.query;
    Promise.all([
      groupHandler.getGroupDataByName(groupname),
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
        returnError(res, err, 'Error finding available players');
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
        return;
      }
      Promise.all([
        groupHandler.getGroupDataByName(groupname),
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
                  returnError(res, err, 'Error getting group and user data');
                  return;
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
              returnError(res, err, 'Error getting group and user data');
              return;
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
          returnError(res, err, 'Error getting group and user data');
          return;
        });
    }
  );

  app.put('/api/roster/dummyRoster/', async (req, res) => {
    const { userId, groupId, week, season, dummyRoster } = req.body;
    if (userId === undefined || groupId === '') {
      res.status(500).send('Select Someone!');
      return;
    }

    try {
      const dbResponse = await rosterHandler.dummyRoster(
        userId,
        groupId,
        week,
        season,
        dummyRoster
      );

      res.status(200).send(dbResponse);
    } catch (err) {
      returnError(res, err);
    }
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
      const group = await groupHandler.getGroupDataByName(groupname);
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
      returnError(res, err, 'Error updating roster, please refresh');
    }
  });

  app.get('/api/roster/lock/general', async (req, res) => {
    try {
      const lockWeek = await rosterHandler.lockPeroid();
      res.status(200).send(lockWeek);
    } catch (err) {
      console.log('Error pulling general lock week data: ', { err });
      returnError(res, err, 'Error getting lock week data');
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
      returnError(res, err, 'Error checking if team has started');
    }
  });

  app.get(
    '/api/roster/players/used/:username/:season/:groupname/:position',
    authMiddleware,
    (req, res) => {
      const { username, season, groupname, position } = req.params;
      Promise.all([
        groupHandler.getGroupDataByName(groupname),
        userHandler.getUserByUsername(username),
      ])
        .then(([group, user]) => {
          rosterHandler
            .usedPlayersByPosition(user._id, season, group._id, position)
            .then((usedPlayers) => {
              res.status(200).send(usedPlayers);
            })
            .catch((err) => {
              returnError(res, err);
            });
        })
        .catch((err) => {
          console.log('Error getting roster for player: ', {
            username,
            season,
            groupname,
            position,
            err,
          });
          returnError(res, err, 'Error pulling roster');
        });
    }
  );

  app.get(
    '/api/roster/getPlayersByTeam/:season/:username/:groupname/:team',
    authMiddleware,
    async (req, res) => {
      try {
        const { groupname, username, team, season } = req.params;
        const group = await groupHandler.getGroupDataByName(groupname);
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
        returnError(res, err, 'Error searching for available players by team');
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
        returnError(res, err);
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
        returnError(res, err, 'Error finding roster data for group');
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
        returnError(res, err, 'Error getting ideal roster');
      }
    }
  );
};
