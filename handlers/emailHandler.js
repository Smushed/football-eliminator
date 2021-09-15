const userHandler = require(`./userHandler`);
const groupHandler = require(`./groupHandler`);
const { leaderBoardRowBuilder, leaderboardTemplate } = require(`../constants/leaderBoardBuilder`);

const AWS = require(`aws-sdk`);
AWS.config.update({
    region: `us-east-2`,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const sendEmail = (user, leaderBoard) => {
    var sesEmailBuilder = {
        Destination: { /* required */
            ToAddresses: [
                `smushedcode@gmail.com`
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: `UTF-8`,
                    Data: leaderBoard
                },
            },
            Subject: {
                Charset: `UTF-8`,
                Data: `TestING BABY email`
            }
        },
        Source: `kevin@eliminator.football`
    };

    const sendPromise = new AWS.SES({ apiVersion: `2010-12-01` }).sendEmail(sesEmailBuilder).promise();

    sendPromise.then(
        function (data) {
            console.log(`Email sent to ${user}`);
        }).catch(
            function (err) {
                console.error(err, err.stack);
            });
};

module.exports = {
    sendLeaderBoardEmail: async (group, season, week) => {
        const emailList = [];
        for (let user of group.UL) {
            const emailPermission = await userHandler.getEmailSettings(user.ID);
            if (emailPermission.LE) {
                const { E } = await userHandler.getUserByID(user.ID);
                emailList.push(E);
            }
            //     users = await Promise.all(group.UL.map(user => userHandler.getUserByID(user._id).exec()))
        }
        console.log(emailList)
        const subject = `Eliminator Leaderboard - Week ${+week - 1}`;
        const leaderBoard = await groupHandler.getLeaderBoard(group._id, season, +week);
        const rows = await leaderBoardRowBuilder(leaderBoard);
        const leaderBoardHTML = leaderboardTemplate(rows, group.N, week);

        sendEmail(emailList[0], leaderBoardHTML)
    }
}