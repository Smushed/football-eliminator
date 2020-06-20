require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const groupHandler = require(`../handlers/groupHandler`);

module.exports = app => {
    app.get(`/api/getuser/`, async (req, res) => {
        const userProfile = await userHandler.getProfile(req.user._id);

        res.json(userProfile);
    });

    //User adds a new group, fills out a form on the book name & description
    //Then adds the current book they're reading
    //THEN hits this route to complete the group
    app.post(`/api/creategroup`, async (req, res) => {
        const { groupName, groupDescription, currentUserID } = req.body;
        //If 500 is returned a group with that name already exists
        //Else it returns the new group
        const response = await groupHandler.createGroup(currentUserID, groupName, groupDescription);
        res.status(200).send(response);

    });

    //Need to find a way for this to approve the user to the group
    app.put(`/api/addusertogroup`, async (req, res) => {
        const { userID, groupID, isAdmin } = req.body;

        if (isAdmin) {
            const added = await groupHandler.addUser(userID, groupID);
            res.status(200).send(added);
        } else {
            //TODO Need to have some sort of display on the front end 
            return "You need to be a moderator to add users to the group";
        };
    });

    //Everything is singular on the backend
    app.get(`/api/getgroupdata/:groupID`, async (req, res) => {
        try {
            const groupID = req.params.groupID;
            const groupData = await groupHandler.getGroupData(groupID);
            if (groupData) {
                res.status(200).send(groupData);
            } else {
                res.status(500).send({ 'error': `No Group Found` })
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });

    //Adds the amount of pages or chapters to the Club
    app.put(`/api/updatepagesetup/`, async (req, res) => {
        const { totalCount, groupID, isAdmin } = req.body;

        if (isAdmin) {
            const updatedGroup = await groupHandler.setPageOrChapter(groupID, totalCount);
            res.json(updatedGroup);
        } else {
            //TODO Add something to show if they tried to update a group they weren't a mod for
            res.json({ 'error': `Moderator needed to update book` });
        };
    });

    app.get(`/api/getLeaderboard/:groupId/:season`, async (req, res) => {
        const { groupId, season } = req.params;

        const leaderboardArray = await groupHandler.getLeaderBoard(groupId, season);

        res.status(200).send(leaderboardArray);
    });

    app.post(`/api/createAllGroup/:pass`, async (req, res) => {
        const { pass } = req.params;
        groupHandler.createAllGroup();
        userHandler.initSeasonAndWeekInDB();
        console.log(`Group Created`)
        // if (pass === process.env.INIT_DB) {
        // };
        res.status(200).send(`success`);
    });
};