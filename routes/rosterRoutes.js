const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster()

        res.status(200).send(response);
    });

    app.get(`/api/userroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        const userRoster = await rosterHandler.userRoster(userId);
        res.status(200).send(userRoster);
    });

    app.put(`/api/dummyroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        const newRoster = await rosterHandler.dummyRoster(userId);
        res.status(200).send(newRoster)
    })
}