const rosterHandler = require(`../handlers/rosterHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const positions = require(`../constants/positions`);
const userHandler = require(`../handlers/userHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster();

        res.status(200).send(response);
    });

    app.get(`/api/roster/players/available`, async (req, res) => {
        const { userId, searchedPosition, season, groupId } = req.query;
        const availablePlayers = await rosterHandler.availablePlayers(userId, searchedPosition, season, groupId);
        res.status(200).send(availablePlayers);
    });

    app.get(`/api/roster/user/:season/:week/:groupname/:username`, (req, res) => {
        const { groupname, username, week, season } = req.params;
        if (username !== `undefined` && week !== 0 && season !== `` && groupname !== `undefined`) { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly

            //This can be broken out into sets, where one set is needed for the next set
            //Rather than making this all await calls we can batch together calls that can go at the same time. Speeding up the process considerably
            Promise.all([
                groupHandler.findGroupIdByName(groupname),
                userHandler.getUserByUsername(username)
            ])
                .then(([groupId, user]) => {
                    Promise.all([
                        rosterHandler.getUserRoster(user._id, week, season, groupId),
                        groupHandler.getGroupPositions(groupId)
                    ])
                        .then(([playerIdRoster, groupPositions]) => {
                            Promise.all([
                                groupHandler.mapGroupPositions(groupPositions, positions.positionMap),
                                mySportsHandler.fillUserRoster(playerIdRoster)
                            ])
                                .then(([groupMap, userRoster]) => {
                                    const response = { userRoster, groupPositions, groupMap, positionArray: positions.positionArray };
                                    res.status(200).send(response);
                                }).catch(err => console.log(`User Roster Layer 3`, err));

                        }).catch(err => console.log(`User Roster Layer 2`, err));
                }).catch(err => console.log(`User Roster Layer 1`, err));
        } else {
            //TODO Do something with this error
            res.status(400).send(`Bad URL. Try refreshing or going home and coming back if this persists`);
        }
    });

    app.put(`/api/dummyRoster/`, async (req, res) => {
        const { userId, groupId, week, season, dummyRoster } = req.body;
        if (userId === undefined || groupId === '') {
            res.status(500).send(`Select Someone!`);
            return;
        }
        const dbResponse = await rosterHandler.dummyRoster(userId, groupId, week, season, dummyRoster);

        res.status(200).send(dbResponse);
    });

    app.put(`/api/user/roster/`, async (req, res) => {
        const { userId, roster, droppedPlayer, addedPlayer, week, season, groupname } = req.body;
        const groupId = await groupHandler.findGroupIdByName(groupname);
        const updatedRoster = await rosterHandler.updateUserRoster(userId, groupId, roster, droppedPlayer, addedPlayer, week, season);
        const response = await mySportsHandler.fillUserRoster(updatedRoster);
        res.status(200).send(response);
    });

    app.get(`/api/lock/general`, async (req, res) => {
        const lockWeek = await rosterHandler.lockPeroid();
        res.status(200).send(lockWeek);
    });

    app.get(`/api/lock/:season/:week/:team`, async (req, res) => {
        const { season, week, team } = req.params;
        const lockPeriod = await rosterHandler.checkTeamLock(season, +week, team);
        res.status(200).send(lockPeriod);
    });

    app.get(`/api/players/used/:username/:season/:groupname`, async (req, res) => {
        const { username, season, groupname } = req.params;
        Promise.all([groupHandler.findGroupIdByName(groupname), userHandler.getUserByUsername(username)])
            .then(async ([groupId, user]) => {
                const usedPlayers = await rosterHandler.usedPlayersByPosition(user._id, season, groupId);
                res.status(200).send(usedPlayers);
            });
    });

    app.get(`/api/getPlayersByTeam/:groupId/:userId/:team/:season`, async (req, res) => {
        const { groupId, userId, team, season } = req.params;

        const playersByTeam = await rosterHandler.searchPlayerByTeam(groupId, userId, team, season);

        res.status(200).send(playersByTeam);
    });

    app.get(`/api/seasonLongScore/:userId/:season`, async (req, res) => {
        const { userId, season } = req.params;
        const allPlayers = await rosterHandler.allSeasonRoster(userId, season);

        res.status(200).send(allPlayers);
    });

    app.get(`/api/getPositionData`, async (req, res) => {
        res.status(200).send(positions.orderOfDescription);
    });

    app.get(`/api/roster/positions`, async (req, res) => {
        const { rosterPositions, positionMap, maxOfPosition } = positions;
        res.status(200).send({ rosterPositions, positionMap, maxOfPosition });
    });

    app.get(`/api/roster/group/all/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        const allRosters = await rosterHandler.getAllRostersForGroup(season, week, groupId);
        res.status(200).send(allRosters)
    });

    app.get(`/api/roster/ideal/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        const previousWeek = +week - 1;
        if (previousWeek === 0) {
            const blankRoster = await groupHandler.getBlankRoster(groupId);
            res.status(200).send(blankRoster);
            return;
        }
        const idealRoster = await groupHandler.getIdealRoster(groupId, season, +previousWeek);
        const response = await mySportsHandler.fillUserRoster(idealRoster.R);
        res.status(200).send(response);
    });
};