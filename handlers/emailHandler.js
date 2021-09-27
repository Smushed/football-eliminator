const userHandler = require(`./userHandler`);
const groupHandler = require(`./groupHandler`);
const mySportsHandler = require(`./mySportsHandler`);
const leaderBoardBuilder = require(`../constants/leaderBoardBuilder`);
const idealRosterBuilder = require(`../constants/idealRosterBuilder`);
const unsubscribe = require(`../constants/unsubscribe`);

const AWS = require(`aws-sdk`);
AWS.config.update({
    region: `us-east-2`,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const sendEmail = (user, subject, html, text) => {
    console.log(user)
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

const composeWeeklyHTMLEmail = async (firstItem, secondItem, week) => {
    return `<div style='font-weight:600;
                        font-size: 24px;
                        margin-bottom: 15px;'>
    Congrats on making it another week in the Eliminator! Onto week ${week}
    </div>

    ${firstItem}
    
    ${secondItem}`;
};

const composeWeeklyTextEmail = async (firstItem, secondItem, week) => {
    return `Congrats on making it another week in the Eliminator! Onto week ${week}

    ${firstItem}
    
    ${secondItem}`;
};

const createLeaderBoard = async (group, season, week) => {
    const leaderBoard = await groupHandler.getLeaderBoard(group._id, season, +week);
    const rows = await leaderBoardBuilder.leaderBoardRowBuilder(leaderBoard);
    const leaderBoardHTML = await leaderBoardBuilder.leaderBoardTemplate(rows, group.N, +week - 1);

    const textRows = await leaderBoardBuilder.leaderBoardTextRows(leaderBoard);
    const leaderBoardText = await leaderBoardBuilder.leaderBoardTextTemplate(textRows, group.N, +week);

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
                const { response } = await userHandler.getUserByID(user.ID);
                emailList.push({ E: response.E, id: response._id });
            }
        }
        const subject = `Eliminator - Week ${+week - 1}`;

        const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(group, season, week);

        const { idealRosterText, idealRosterHTML } = await createIdealRoster(group, season, week);

        const HTMLTemplate = await composeWeeklyHTMLEmail(leaderBoardHTML, idealRosterHTML, week);
        const textTemplate = await composeWeeklyTextEmail(leaderBoardText, idealRosterText, week);


        for (let user of emailList) {
            const HTMLemail = await unsubscribe.appendHTML(HTMLTemplate, user.id);
            const textEmail = await unsubscribe.appendText(textTemplate, user.id);

            if (user.E === 'smushedcode@gmail.com' || user.E === 'tflerlage@comcast.net' || user.E === 'elstinkio33@gmail.com') {
                sendEmail(user.E, subject, HTMLemail, textEmail);
            }
        }
    }
}