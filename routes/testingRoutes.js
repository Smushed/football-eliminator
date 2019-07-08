const testingHandler = require(`../handlers/testingHandler`);

module.exports = app => {
    app.get(`/api/currenttesting`, async (req, res) => {
        try {
            const testing = await testingHandler.currentRoster();
            res.status(200).send(testing);
        } catch (err) {
            console.log(err)
        }


    });
}