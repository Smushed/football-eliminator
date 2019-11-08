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
            return "You need to be a moderator to add users to the group"
        };
    });

    //Before post gets to here validate that there isn't a blank field
    app.post(`/api/newpost`, async (req, res) => {
        const { userID, groupID, userPost } = req.body;

        const newPost = await postHandler.createPost(userID, groupID, userPost);
        res.status(200).send(newPost);
    });

    app.post(`/api/newcomment`, async (req, res) => {
        const { userID, postID, comment } = req.body;

        const newComment = await postHandler.createComment(userID, postID, comment);
        res.json(newComment);
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

    //Everything is singular on the backend
    app.get(`/api/getallgrouppost/:group`, async (req, res) => {
        const groupID = req.params.group;
        const groupPosts = await postHandler.getAllGroupPost(groupID);
        const sortedPosts = await postHandler.sortPostByDate(groupPosts);
        res.json(sortedPosts);
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

    app.put(`/api/updatebenchmark`, async (req, res) => {
        const { nextBenchmark, groupID, isAdmin } = req.body;

        //Checks if the user is a mod of the group they're currently trying to update
        if (isAdmin) {
            //TODO if error returned show
            const updatedGroup = await groupHandler.updateBenchmark(groupID, nextBenchmark);
            if (updatedGroup.error) {
                res.status(501).send(updatedGroup)
            } else {
                res.status(200).send(updatedGroup);
            }
        } else {
            //TODO Add something to show if they tried to update a group they weren't a mod for
            res.json({ 'error': `Moderator needed to update benchmark` });
        };

    });

    app.delete(`/api/deletepost`, async (req, res) => {
        const { postID } = req.body;

        //Gets the full post data so we can check if the user is either a moderator of the group or the owner of the post
        const userPost = await postHandler.getPostData(postID);
        const isMod = await groupHandler.checkGroupMod(req.user._id, userPost.group);

        await postHandler.deletePost(req.user._id, userPost, isMod)
        const groupPosts = await postHandler.getAllGroupPost(userPost.group);

        res.json(groupPosts);
    });

    //TODO FOR THE PROJECT THIS IS OK
    //TODO After the project, this will be moved to a post
    //Posts and comments are a different route since comments are nested inside posts
    app.delete(`/api/deletecomment`, async (req, res) => {
        const { commentID } = req.body;

        //Gets the full post data so we can check if the user is either a moderator of the group or the owner of the post
        const foundPost = await postHandler.getCommentForPost(commentID);
        const isMod = await groupHandler.checkGroupMod(req.user._id, foundPost.group);

        //Comment ID is the ID of the comment that is to be deleted
        const newPost = await postHandler.deleteComment(foundPost.comment, foundPost._id, commentID, isMod)

        //TODO probable need to return the group posts instead of just the new post
        res.json(newPost);
    });

    app.get(`/api/getLeaderboard/:groupId`, async (req, res) => {
        const { groupId } = req.params;

        const leaderboardArray = await groupHandler.getLeaderBoard(groupId);

        res.status(200).send(leaderboardArray);
    });
};