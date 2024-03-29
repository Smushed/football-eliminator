const userHandler = require(`./userHandler`);
const groupHandler = require(`./groupHandler`);
const mySportsHandler = require(`./mySportsHandler`);
const leaderBoardBuilder = require(`../constants/leaderBoardBuilder`);
const rosterBuilder = require(`../constants/rosterBuilder`);
const unsubscribe = require(`../constants/unsubscribe`);

const AWS = require(`aws-sdk`);
AWS.config.update({
  region: `us-east-2`,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const sendEmail = (user, subject, html, text) => {
  var sesEmailBuilder = {
    Destination: {
      ToAddresses: [user],
    },
    Message: {
      Body: {
        Html: {
          Charset: `UTF-8`,
          Data: html,
        },
        Text: {
          Charset: `UTF-8`,
          Data: text,
        },
      },
      Subject: {
        Charset: `UTF-8`,
        Data: subject,
      },
    },
    Source: `kevin@eliminator.football`,
  };

  const sendPromise = new AWS.SES({ apiVersion: `2010-12-01` })
    .sendEmail(sesEmailBuilder)
    .promise();

  sendPromise
    .then(function (data) {
      console.log(`Email sent to ${user}`);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
};

const composeWeeklyHTMLEmail = async (firstItem, secondItem, week) => {
  return `<div style='font-weight:600;
                        font-size: 24px;
                        margin-bottom: 15px;'>
    Onto week ${week + 1}
    </div>

    ${firstItem}
    
    ${secondItem}`;
};

const composeWeeklyTextEmail = async (firstItem, secondItem, week) => {
  return `Onto week ${week + 1}

    ${firstItem}
    
    ${secondItem}`;
};

const composeYearlyHTMLEmail = async (
  yearlyWinner,
  leaderboard,
  bestUserPlayer,
  bestUserWeek,
  bestUserWeekRoster,
  bestIdealRoster,
  bestIdealRosterFull
) => {
  let body = `<div style='font-size: 24px;
                        margin-bottom: 15px;'>
                        This is the end of the season for the Eliminator! First, congrats to <strong>${
                          yearlyWinner.UN
                        }</strong> for winning with a score of <strong>${yearlyWinner.TS.toFixed(
    2
  )}</strong>!
    </div>`;
  body +=
    `<div style='font-size: 18px;
                  margin-bottom: 15px;'>
                    Thank you to everyone for playing again for another year. This year there was a lot of back end work on my end to get the eliminator to a standard I'm happy with. (It was really easy to hack if you just tweak the right fields). Moving forward, I plan on keeping this going for another year and making a lot of improvements into next year. Some of my highest priorities are to redesign the UI to make it more user friendly and enjoyable to use. Another would be setting up email / text reminders for weekly rosters (something that I could really use). I hope you stick with me!
            </div>` +
    `<div style='font-size: 24px;
        margin-bottom: 15px;'>
          To wrap up, here's some insights to the last year:
        </div>`;

  body +=
    `<div style='font-size: 18px;
            margin-bottom: 15px;'>
              To start, the leaderboard for the whole season without all the weirdness of week 18:
          </div>` + leaderboard;

  body += `<div style='font-size: 18px;
          margin-bottom: 15px;'>
            The best play for a week was from ${bestUserPlayer.UN} in week ${bestUserPlayer.W} playing ${bestUserPlayer.P.N} with a score of ${bestUserPlayer.SC}!
          </div>`;

  body +=
    `<div style='font-size: 18px;
          margin-bottom: 15px;'>
            The best week for this year was from ${bestUserWeek.UN} in week ${bestUserWeek.W} with a score of ${bestUserWeek.SC}!
          </div>` + bestUserWeekRoster;

  body +=
    `<div style='font-size: 18px;
          margin-bottom: 15px;
          margin-top: 15px;'>
            Finally, the best ideal roster for this year was from week ${bestIdealRoster.W} with a whopping score of ${bestIdealRoster.SC}!
          </div>` + bestIdealRosterFull;

  return body;
};

const composeYearlyTextEmail = (
  yearlyWinner,
  leaderboard,
  bestUserPlayer,
  bestUserWeek,
  bestUserWeekRoster,
  bestIdealRoster,
  bestIdealRosterFull
) => {
  const spacer = `
  
  `;
  let body = `This is the end of the season for the Eliminator! First, congrats to ${
    yearlyWinner.UN
  } for winning with a score of ${yearlyWinner.TS.toFixed(2)}!`;
  body += spacer;
  body += `Thank you to everyone for playing again for another year. This year there was a lot of back end work on my end to get the eliminator to a standard I'm happy with. (It was really easy to hack if you just tweak the right fields). Moving forward, I plan on keeping this going for another year and making a lot of improvements into next year. Some of my highest priorities are to redesign the UI to make it more user friendly and enjoyable to use. Another would be setting up email / text reminders for weekly rosters (something that I could really use). I hope you stick with me!
  
  To wrap up, here's some insights to the last year:`;
  body += spacer;
  body +=
    `The leaderboard for the whole season:
  ` + leaderboard;
  body += spacer;
  body += `The best play for a week was from ${bestUserPlayer.UN} in week ${bestUserPlayer.W} playing ${bestUserPlayer.P.N} with a score of ${bestUserPlayer.SC}!`;
  body += spacer;
  body +=
    `The best week for this year was from ${bestUserWeek.UN} in week ${bestUserWeek.W} with a score of ${bestUserWeek.SC}!
  ` + bestUserWeekRoster;
  body += spacer;
  body +=
    `Finally, the best ideal roster for this year was from week ${bestIdealRoster.W} with a whopping score of ${bestIdealRoster.SC}!
  ` + bestIdealRosterFull;
  return body;
};

const createLeaderBoard = async (group, season, week) => {
  const leaderBoard = await groupHandler.getLeaderBoard(
    group._id,
    season,
    week
  );
  const rows = await leaderBoardBuilder.leaderBoardRowBuilder(leaderBoard);
  const leaderBoardHTML = leaderBoardBuilder.leaderBoardTemplate(
    rows,
    group.N,
    week
  );

  const textRows = await leaderBoardBuilder.leaderBoardTextRows(leaderBoard);
  const leaderBoardText = leaderBoardBuilder.leaderBoardTextTemplate(
    textRows,
    group.N,
    week
  );

  return { leaderBoardHTML, leaderBoardText };
};

const createRoster = async (groupPos, roster, week, username) => {
  const rosterRows = await rosterBuilder.rosterRow(roster, groupPos);
  const rosterHTML = await rosterBuilder.rosterBuilder(
    rosterRows,
    week,
    username
  );

  const textRows = await rosterBuilder.rosterTextRows(
    roster,
    groupPos,
    username
  );

  const rosterText = await rosterBuilder.rosterTextTemplate(
    textRows,
    week,
    username
  );

  return { rosterHTML, rosterText };
};

const createIdealRoster = async (groupPos, roster, week) => {
  const rosterRows = await rosterBuilder.rosterRow(roster, groupPos);
  const rosterHTML = await rosterBuilder.idealRosterBuilder(rosterRows, week);

  const textRows = await rosterBuilder.rosterTextRows(roster, groupPos);

  const rosterText = await rosterBuilder.idealRosterTextTemplate(
    textRows,
    week
  );

  return { idealRosterHTML: rosterHTML, idealRosterText: rosterText };
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
    const subject = `Eliminator - Week ${week}`;

    const groupPos = await groupHandler.getGroupPositions(group._id.toString());
    const idealRoster = await groupHandler.getIdealRoster(
      groupPos,
      season,
      week
    );

    const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(
      group,
      season,
      +week + 1
    );

    const { idealRosterText, idealRosterHTML } = await createIdealRoster(
      group,
      idealRoster,
      week
    );

    const HTMLTemplate = await composeWeeklyHTMLEmail(
      leaderBoardHTML,
      idealRosterHTML,
      +week
    );
    const textTemplate = await composeWeeklyTextEmail(
      leaderBoardText,
      idealRosterText,
      +week
    );

    for (let user of emailList) {
      const HTMLemail = await unsubscribe.appendHTML(HTMLTemplate, user.id);
      const textEmail = await unsubscribe.appendText(textTemplate, user.id);
      sendEmail(user.E, subject, HTMLemail, textEmail);
    }
  },
  sendYearlyRecapEmail: async (
    maxWeek,
    season,
    group,
    yearlyWinner,
    highestScoreUserWeek,
    bestIdealRoster,
    bestScorePlayerByUser
  ) => {
    const subject = `Yearly Recap for the Eliminator!`;
    const groupPos = await groupHandler.getGroupPositions(group._id.toString());
    const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(
      group,
      season,
      maxWeek
    );

    const highestUserWeekFullRoster = await createRoster(
      groupPos,
      highestScoreUserWeek.R,
      highestScoreUserWeek.W,
      highestScoreUserWeek.UN
    );
    const bestIdealRosterFull = await createIdealRoster(
      groupPos,
      bestIdealRoster.R,
      bestIdealRoster.W
    );

    const textTemplate = composeYearlyTextEmail(
      yearlyWinner,
      leaderBoardText,
      bestScorePlayerByUser,
      highestScoreUserWeek,
      highestUserWeekFullRoster.rosterText,
      bestIdealRoster,
      bestIdealRosterFull.idealRosterText
    );

    const HTMLTemplate = await composeYearlyHTMLEmail(
      yearlyWinner,
      leaderBoardHTML,
      bestScorePlayerByUser,
      highestScoreUserWeek,
      highestUserWeekFullRoster.rosterHTML,
      bestIdealRoster,
      bestIdealRosterFull.idealRosterHTML
    );

    const emailList = [];
    for (let user of group.UL) {
      const emailPermission = await userHandler.getEmailSettings(user.ID);
      if (emailPermission.LE) {
        const { response } = await userHandler.getUserByID(user.ID);
        emailList.push({ E: response.E, id: response._id });
      }
    }

    for (let user of emailList) {
      const HTMLemail = await unsubscribe.appendHTML(HTMLTemplate, user.id);
      const textEmail = await unsubscribe.appendText(textTemplate, user.id);
      sendEmail(user.E, subject, HTMLemail, textEmail);
    }
  },
};
