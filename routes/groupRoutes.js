require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);

module.exports = app => {
    app.get(`/api/getuser/`, async (req, res) => {
        const userProfile = await userHandler.getProfile(req.user._id);

        res.json(userProfile);
    });

    app.post(`/api/creategroup`, async (req, res) => {
        const { groupName, groupDescription, currentUserID } = req.body;
        //If 500 is returned a group with that name already exists
        //Else it returns the new group
        const response = await groupHandler.createGroup(currentUserID, groupName, groupDescription);
        res.status(200).send(response);

    });

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

    app.post(`/api/createAllGroup/:pass`, async (req, res) => {
        const { pass } = req.params;
        if (pass !== process.env.DB_ADMIN_PASS) {
            res.status(401).send(`Get Outta Here!`);
            return;
        };
        groupHandler.createAllGroup();
        userHandler.initSeasonAndWeekInDB();
        console.log(`Group Created`)
        res.sendStatus(200);
    });
};