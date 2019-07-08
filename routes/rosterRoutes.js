const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster()

        res.status(200).send(response);
    });

    app.get(`/api/availablePlayers/:userid`, async (req, res) => {
        const userID = req.params.userid;
        const availablePlayers = await rosterHandler.availablePlayers(userID);
        res.status(200).send(availablePlayers);
    });
}