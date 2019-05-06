const mySportsHandler = require(`../handlers/mySportsHandler`);


module.exports = app => {
    app.get(`/api/testroster`, async (req, res) => {
        const testing = await mySportsHandler.getRosterData()
        console.log(testing)
        res.status(200).send(testing)
    });

    app.get(`/api/testgame`, async (req, res) => {
        //This is a route which pulls in weekly data (should use params in the future)
        const weeklyPlayerData = await mySportsHandler.getWeeklyData(`2018-regular`, 17)
        //getWeeklyData returns all player data for that week in an array
        res.status(200).send(weeklyPlayerData)
    });
}