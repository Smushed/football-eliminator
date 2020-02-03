const mySportsHandler = require(`../handlers/mySportsHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {

    app.get(`/api/updatePlayers/:season/:week`, async (req, res) => {
        const { season, week } = req.params;

        await mySportsHandler.getWeeklyData(season, week);

        //TODO Refactor this out so it's not just a copy
        // const userRosters = await rosterHandler.getAllRosters(season);
        // const status = await mySportsHandler.calculateWeeklyScore(userRosters, season, week, `allUsers`);
        // await mySportsHandler.rankPlayers(season);


        res.sendStatus(200);

    });

    app.get(`/api/massPlayerUpdate`, async (req, res) => {
        //This runs the same thing as the route above but iterates over every season and week currently on the app
        const dbResponse = await mySportsHandler.getMassData();

        if (dbResponse.status === 200) {
            res.status(200).send(dbResponse.text);
        } else {
            //TODO Better error handling
            console.log(dbResponse.text);
        };
    });

    //This iterates through all the teams (all 32) and pulls mySportsFeeds for the current rosters
    //It then takes the rosters it gets from mySportsFeeds and updates the players it finds
    app.get(`/api/updateTeams`, async (req, res) => {
        //TODO make the season dynamic
        const season = `2019-2020-regular`;

        const dbResponse = await mySportsHandler.updateRoster(season);

        res.status(200).send(dbResponse);
    });

    app.get(`/api/weeklyRosterScore`, async (req, res) => {
        //This takes the userRoster object which is all the previous weeks from the current week and plugs them into the DB to get the total scores for that user for the week
        const { userRoster, season, week } = req.query;

        const userScore = await mySportsHandler.weeklyScore(JSON.parse(userRoster), season, week);

        res.status(200).send(userScore);
    });

    app.get(`/api/calculateScore/:season/:week/`, async (req, res) => {
        const { season, week } = req.params;
        //TODO Add a loop to iterate over every group in the app
        const group = `allUsers`;

        console.log(`Calculating scores for `, group);

        const userRosters = await rosterHandler.getAllRosters(season);
        const status = await mySportsHandler.calculateWeeklyScore(userRosters, season, week, group);

        console.log(group, ` scores completed`);

        res.sendStatus(status);
    });

    app.get(`/api/rankPlayers/:season/`, async (req, res) => {
        const { season } = req.params;

        const dbResponse = await mySportsHandler.rankPlayers(season);

        res.sendStatus(dbResponse);
    });
};