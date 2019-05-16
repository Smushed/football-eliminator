const displayPlayers = require(`../handlers/displayPlayers`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await displayPlayers.byRoster()

        res.status(200).send(response);
    })
}