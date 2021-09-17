const userHandler = require(`./userHandler`);
const groupHandler = require(`./groupHandler`);
const mySportsHandler = require(`./mySportsHandler`);
const leaderBoardBuilder = require(`../constants/leaderBoardBuilder`);
const idealRosterBuilder = require(`../constants/idealRosterBuilder`);

const AWS = require(`aws-sdk`);
AWS.config.update({
    region: `us-east-2`,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const sendEmail = (user, subject, html, text) => {
    var sesEmailBuilder = {
        Destination: {
            ToAddresses: [
                user
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: `UTF-8`,
                    Data: html
                },
                Text: {
                    Charset: `UTF-8`,
                    Data: text
                }
            },
            Subject: {
                Charset: `UTF-8`,
                Data: subject
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

const composeWeeklyEmail = async (firstItem, secondItem, week) => {
    return `Congrats on making it another week in the Eliminator! Onto week ${week}

    ${firstItem}
    
    ${secondItem}`;
};

const createLeaderBoard = async (group, season, week) => {
    const leaderBoard = await groupHandler.getLeaderBoard(group._id, season, +week);
    const rows = await leaderBoardBuilder.leaderBoardRowBuilder(leaderBoard);
    const leaderBoardHTML = leaderBoardBuilder.leaderBoardTemplate(rows, group.N, +week - 1);

    const textRows = await leaderBoardBuilder.leaderBoardTextRows(leaderBoard);
    const leaderBoardText = leaderBoardBuilder.leaderBoardTextTemplate(textRows, group.N, +week);

    return { leaderBoardHTML, leaderBoardText };
};

const createIdealRoster = async (group, season, week) => {
    const convWeek = +week - 1;
    const idealRoster = await groupHandler.getIdealRoster(group._id, season, convWeek);
    const filledRoster = await mySportsHandler.fillUserRoster(idealRoster.R);
    const groupPos = await groupHandler.getGroupPositions(group._id.toString());

    const idealRosterRows = await idealRosterBuilder.idealRosterRow(filledRoster, groupPos);
    const idealRosterHTML = await idealRosterBuilder.idealRosterBuilder(idealRosterRows, convWeek);

    const textRows = await idealRosterBuilder.idealRosterTextRows(filledRoster, groupPos);
    const idealRosterText = await idealRosterBuilder.idealRosterTextTemplate(textRows, convWeek);

    return { idealRosterHTML, idealRosterText };
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
        }
        const subject = `Eliminator Leaderboard - Week ${+week - 1}`;

        const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(group, season, week);

        //Grab the ideal roster from last week

        const { idealRosterText, idealRosterHTML } = await createIdealRoster(group, season, week);

        const HTMLEmail = await composeWeeklyEmail(leaderBoardHTML, idealRosterHTML, week);
        const textEmail = await composeWeeklyEmail(leaderBoardText, idealRosterText, week);

        sendEmail(emailList[0], subject, HTMLEmail, textEmail);
        // sendEmail(emailList[0], subject, leaderBoardHTML, leaderBoardText);
    }
}