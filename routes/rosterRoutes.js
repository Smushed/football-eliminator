const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster()

        res.status(200).send(response);
    });

    //TODO This takes a very long time. Needs some serious optimization
    app.get(`/api/availableplayers`, async (req, res) => {
        //req.query passes the array as an object. We turn this back to an array
        let usedPlayerArray = Object.values(req.query);
        //Then iterate over the array and turn the strings into numbers to compare it to the DB
        usedPlayerArray = usedPlayerArray.map(Number)

        //TODO Make the position that is fed in dynamic
        const searchedPosition = `QB`;
        const availablePlayers = await rosterHandler.availablePlayers(usedPlayerArray, searchedPosition);
        res.status(200).send(availablePlayers)
    });

    app.get(`/api/userroster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        //TODO Currently we don't do anything with the currentUser field. We need to change this at some point
        if (userId !== 'undefined') { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const userRoster = await rosterHandler.userRoster(userId);
            res.status(200).send(userRoster);
        } else {
            //TODO Do something with this error
            res.status(400).send(`userId is undefined. Try refreshing if this persists`);
        };
    });

    app.put(`/api/dummyroster/:userid`, (req, res) => {
        const userId = req.params.userid;
        rosterHandler.dummyRoster(userId).then(newRoster => res.status(200).send(newRoster));
    });
};