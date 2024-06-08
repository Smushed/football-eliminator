import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import userHandler from './userHandler.js';
import groupHandler from './groupHandler.js';
import leaderBoardBuilder from '../constants/leaderBoardBuilder.js';
import rosterBuilder from '../constants/rosterBuilder.js';
import unsubscribe from '../constants/unsubscribe.js';
import mySportsHandler from './mySportsHandler.js';

const client = new SESClient({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const sendEmail = async (user, subject, html, text) => {
  const sesEmailBuilder = {
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
    ReplyToAddresses: ['smushedcode@gmail.com'],
  };

  const sendEmail = new SendEmailCommand(sesEmailBuilder);
  try {
    await client.send(sendEmail);
  } catch (err) {
    console.log('Error Sending Email: ', { err });
  }
};

const composeWeeklyHTMLEmail = async (firstItem, secondItem, week) => {
  return `<div style='font-weight:600;
                        font-size: 24px;
                        margin-bottom: 15px;'>
    Week ${week} Eliminator Results
    </div>

    ${firstItem}
    
    ${secondItem}`;
};

const composeWeeklyTextEmail = async (firstItem, secondItem, week) => {
  return `Week ${week} Eliminator Results

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
                          yearlyWinner.username
                        }</strong> for winning with a score of <strong>${yearlyWinner.totalScore.toFixed(
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
            The best play for a week was from ${bestUserPlayer.username} in week ${bestUserPlayer.week} playing ${bestUserPlayer.player.name} with a score of ${bestUserPlayer.score}!
          </div>`;

  body +=
    `<div style='font-size: 18px;
          margin-bottom: 15px;'>
            The best week for this year was from ${bestUserWeek.uername} in week ${bestUserWeek.week} with a score of ${bestUserWeek.score}!
          </div>` + bestUserWeekRoster;

  body +=
    `<div style='font-size: 18px;
          margin-bottom: 15px;
          margin-top: 15px;'>
            Finally, the best ideal roster for this year was from week ${bestIdealRoster.week} with a whopping score of ${bestIdealRoster.score}!
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
    yearlyWinner.username
  } for winning with a score of ${yearlyWinner.totalScore.toFixed(2)}!`;
  body += spacer;
  body += `Thank you to everyone for playing again for another year. This year there was a lot of back end work on my end to get the eliminator to a standard I'm happy with. (It was really easy to hack if you just tweak the right fields). Moving forward, I plan on keeping this going for another year and making a lot of improvements into next year. Some of my highest priorities are to redesign the UI to make it more user friendly and enjoyable to use. Another would be setting up email / text reminders for weekly rosters (something that I could really use). I hope you stick with me!
  
  To wrap up, here's some insights to the last year:`;
  body += spacer;
  body +=
    `The leaderboard for the whole season:
  ` + leaderboard;
  body += spacer;
  body += `The best play for a week was from ${bestUserPlayer.username} in week ${bestUserPlayer.week} playing ${bestUserPlayer.player.name} with a score of ${bestUserPlayer.score}!`;
  body += spacer;
  body +=
    `The best week for this year was from ${bestUserWeek.username} in week ${bestUserWeek.week} with a score of ${bestUserWeek.score}!
  ` + bestUserWeekRoster;
  body += spacer;
  body +=
    `Finally, the best ideal roster for this year was from week ${bestIdealRoster.week} with a whopping score of ${bestIdealRoster.score}!
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
    group.name,
    week
  );

  const textRows = await leaderBoardBuilder.leaderBoardTextRows(leaderBoard);
  const leaderBoardText = leaderBoardBuilder.leaderBoardTextTemplate(
    textRows,
    group.name,
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

export default {
  sendLeaderBoardEmail: async (group, season, week) => {
    let userIdArray = group.userlist.map((user) => user.userId.toString());
    let emailList = await userHandler.getGroupEmailSettings(userIdArray);
    userIdArray = emailList.map((user) => user.userId.toString());
    emailList = await userHandler.getUsersEmail(userIdArray);

    const subject = `Eliminator - Week ${week}`;

    const groupPos = await groupHandler.getGroupPositions(group._id.toString());
    const idealRoster = await groupHandler.getIdealRoster(
      group._id,
      season,
      week
    );
    const filledIdealRoster = await mySportsHandler.fillUserRoster(
      idealRoster.roster
    );

    const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(
      group,
      season,
      +week + 1
    );

    const { idealRosterText, idealRosterHTML } = await createIdealRoster(
      groupPos,
      filledIdealRoster,
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

    for (const user of emailList) {
      const HTMLemail = await unsubscribe.appendHTML(HTMLTemplate, user.id);
      const textEmail = await unsubscribe.appendText(textTemplate, user.id);
      sendEmail(user.email, subject, HTMLemail, textEmail);
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
    const subject = 'Yearly Recap for the Eliminator!';
    const groupPos = await groupHandler.getGroupPositions(group._id.toString());
    const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(
      group,
      season,
      maxWeek
    );

    const highestUserWeekFullRoster = await createRoster(
      groupPos,
      highestScoreUserWeek.roster,
      highestScoreUserWeek.week,
      highestScoreUserWeek.username
    );
    const bestIdealRosterFull = await createIdealRoster(
      groupPos,
      bestIdealRoster.roster,
      bestIdealRoster.week
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
    for (const user of group.userlist) {
      const emailPermission = await userHandler.getEmailSettings(user.userId);
      if (emailPermission.leaderboardEmail) {
        const { response } = await userHandler.getUserByID(user.userId);
        emailList.push({ email: response.email, id: response._id });
      }
    }

    for (const user of emailList) {
      const HTMLemail = await unsubscribe.appendHTML(HTMLTemplate, user.id);
      const textEmail = await unsubscribe.appendText(textTemplate, user.id);
      sendEmail(user.email, subject, HTMLemail, textEmail);
    }
  },
};
