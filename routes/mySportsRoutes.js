const mySportsHandler = require(`../handlers/mySportsHandler`);


module.exports = app => {

    app.get(`/api/updatePlayers/:season/:week`, async (req, res) => {
        const { season, week } = req.params;

        //getWeeklyData returns all player data for that week in an array
        //It is updating the  players in the DB but it is not sending the data back
        //Currently if this runs while there is no new players to add the front end will break
        const response = await mySportsHandler.getWeeklyData(season, week);

        res.status(200).send(response.text);

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
}