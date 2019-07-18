const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster()

        res.status(200).send(response);
    });

    app.get(`/api/userroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        const currentUser = req.query.currentUser;
        if (userId !== 'undefined') { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const userRoster = await rosterHandler.userRoster(userId, currentUser);
            res.status(200).send(userRoster);
        } else {
            //TODO Do something with this error
            res.status(400).send(`userId is undefined. Try refreshing if this persists`)
        }
    });

    app.put(`/api/dummyroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        rosterHandler.dummyRoster(userId).then(newRoster =>
            res.status(200).send(newRoster)
        );
    });

    //TODO Start here
    // app.get(`/api/playerdataforroster`, async (req, res) => {
    //     console.log(req.query.currentRoster);
    //     const filledRoster = rosterHandler.getRosterPlayers(req.query.currentRoster);
    //     res.status(200).send(filledRoster);
    // })
}