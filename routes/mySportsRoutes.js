const mySportsHandler = require(`../handlers/mySportsHandler`);


module.exports = app => {
    app.get(`/api/testroster`, async (req, res) => {
        const testing = await mySportsHandler.getRosterData(`2018-2019-regular`)
        console.log(testing)
        res.status(200).send(testing)
    });

    app.get(`/api/updatePlayers/:season/:week`, async (req, res) => {
        const { season, week } = req.params;
        //This is a route which pulls in weekly data (should use params in the future)
        const response = await mySportsHandler.getWeeklyData(season, week)
        //getWeeklyData returns all player data for that week in an array
        //TODO this is not working properly
        //It is updating the  players in the DB but it is not sending the data back
        //Currently if this runs while there is no new players to add the front end will break

        res.status(200).send(response.text)

    });

    app.get(`/api/massplayerupdate`, async (req, res) => {
        const dbResponse = await mySportsHandler.getMassData();
        console.log(dbResponse);
        if (dbResponse.status === 200) {
            res.status(200).send(dbResponse.text)
        } else {
            //TODO Better error handling
            console.log(dbResponse.text)
        }
    });
}