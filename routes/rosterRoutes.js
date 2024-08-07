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
    async (req, res) => {
      try {
        const { groupname, username, week, season } = req.params;
        const [group, user] = await Promise.all([
          groupHandler.getGroupDataByName(groupname),
          userHandler.getUserByUsername(username),
        ]);
        const [playerIdRoster, groupPositions] = await Promise.all([
          rosterHandler.getUserRoster(user._id, week, season, group._id),
          groupHandler.getGroupPositions(group._id),
        ]);
        let userRoster = [];
        if (
          user.email !== req.currentUser &&
          (await groupHandler.shouldRostersBeHidden(season, week, group._id))
        ) {
          userRoster = await mySportsHandler.fillBlankUserRoster(
            playerIdRoster
          );
        } else {
          userRoster = await mySportsHandler.fillUserRoster(playerIdRoster);
        }
        const groupMap = await groupHandler.mapGroupPositions(
          groupPositions,
          positions.positionMap
        );

        res.status(200).send({
          userRoster: userRoster,
          groupPositions: groupPositions,
          groupMap: groupMap,
          positionArray: positions.positionArray,
        });
      } catch (err) {
        console.log('Error getting user roster data', {
          groupname,
          username,
          week,
          season,
          err,
        });
        returnError(res, err, 'Error getting group and user data');
      }
    }
  );

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
      console.log('inside router ', { err });
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
        let [rosters, hideRosters] = await Promise.all([
          rosterHandler.getAllRostersForGroup(season, week, groupId),
          groupHandler.shouldRostersBeHidden(season, week, groupId),
        ]);
        if (hideRosters) {
          rosters = await rosterHandler.getBlankRostersForGroup(
            rosters,
            groupId
          );
        }
        res.status(200).send(rosters);
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
