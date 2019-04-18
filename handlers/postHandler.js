const db = require(`../models`);
const uuidv4 = require(`uuid/v4`)

module.exports = {
    createPost: async (userID, groupID, userPost) => {

        const newPost = {
            user: userID,
            group: groupID,
            date: Date.now(),
            benchmark: userPost.benchmark,
            title: userPost.title,
            text: userPost.text,
            isSpoiler: userPost.isSpoiler
        };

        const addedPost = await db.Post.create(newPost);

        return addedPost;
    },
    getAllGroupPost: async (groupID) => {
        const groupPosts = await db.Post.find({ group: groupID });
        return groupPosts;
    },
    sortPostByDate: async (groupPosts) => {
        const sortedPosts = groupPosts.sort((a, b) => b.date - a.date);
        return sortedPosts;
    },
    createComment: async (userID, postID, comment) => {
        //We must give comments an ID on our own since they are nested underneath the post
        const commentID = uuidv4();
        const postedComment = await db.Post.findByIdAndUpdate([postID], {
            $push: { comment: { 'user': userID, 'text': comment, 'date': Date.now(), '_id': commentID } }
        }, { new: true });

        return postedComment
    },
    getPostData: async (postID) => {
        const foundPost = await db.Post.findById([postID]);
        return foundPost;
    },
    getCommentForPost: async (commentID) => {
        console.log(commentID)
        const foundPost = await db.Post.findOne({ 'comment._id': commentID });
        return foundPost;
    },
    deletePost: async (userID, userPost, isMod) => {
        if (isMod || userID === userPost.user) {
            await db.Post.findByIdAndDelete([userPost._id]);
            return 200;
        } else {
            //Not authorized to delete the post
            return 500;
        };
    },
    deleteComment: async (commentArray, postID, commentID, isMod) => {
        if (isMod || userID === userPost.user) {
            const arrayAfterDelete = commentArray.filter(comment => comment._id !== commentID);
            const newPost = await db.Post.findByIdAndUpdate([postID], { $set: { comment: arrayAfterDelete } }, { new: true })
            return newPost;
        } else {
            return 500;
        }
    }
}