const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster()

        res.status(200).send(response);
    });

    app.get(`/api/availableplayers`, async (req, res) => {
        //req.query passes the array as an object. We turn this back to an array
        const { userId, searchedPosition } = req.query
        //Then iterate over the array and turn the strings into numbers to compare it to the DB
        const availablePlayers = await rosterHandler.availablePlayers(userId, searchedPosition);

        res.status(200).send(availablePlayers)
    });

    app.get(`/api/userroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        const { week, season } = req.query;
        if (userId !== 'undefined' && week !== 0 && season !== ``) { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const userRoster = await rosterHandler.userRoster(userId, week, season);
            res.status(200).send(userRoster);
        } else {
            //TODO Do something with this error
            res.status(400).send(`userId is undefined. Try refreshing if this persists`);
        };
    });

    app.put(`/api/dummyRoster/`, async (req, res) => {
        const { userId, week, season, dummyRoster } = req.body;
        const dbResponse = await rosterHandler.dummyRoster(userId, week, season, dummyRoster)

        res.status(200).send(dbResponse);
    });

    app.put(`/api/updateUserRoster/`, async (req, res) => {
        const { userId, dbReadyRoster, droppedPlayer, week, season, saveWithNoDrop } = req.body;

        const dbResponse = await rosterHandler.updateUserRoster(userId, dbReadyRoster, droppedPlayer, week, season, saveWithNoDrop);

        res.status(200).send(dbResponse);
    });
};