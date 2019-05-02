const testHandler = require(`../handlers/testHandler`);


module.exports = app => {
    app.get(`/api/testroster`, async (req, res) => {
        const testing = await testHandler.getRosterData()
        console.log(testing)
        res.status(200).send(testing)
    });

    app.get(`/api/testgame`, async (req, res) => {
        const testing = await testHandler.getGameData(`2018-regular`, 17)
        console.log(testing)
        res.status(200).send(testing)
    });
}