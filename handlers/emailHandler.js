import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import userHandler from './userHandler.js';
import groupHandler from './groupHandler.js';
import leaderBoardBuilder from '../constants/leaderBoardBuilder.js';
import rosterBuilder from '../constants/rosterBuilder.js';
import unsubscribe from '../constants/unsubscribe.js';
import mySportsHandler from './mySportsHandler.js';
import db from '../models/index.js';
import { EncryptionFilterSensitiveLog } from '@aws-sdk/client-s3';

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
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: 'kevin@eliminator.football',
    ReplyToAddresses: ['smushedcode@gmail.com'],
  };

  const sendEmail = new SendEmailCommand(sesEmailBuilder);
  try {
    await client.send(sendEmail);
    console.log(`Email sent to ${user}`);
  } catch (err) {
    console.log('Error Sending Email: ', { err });
    throw { status: 500, mmessage: 'Error sending email' };
  }
};

const composeWeeklyHTMLEmail = (firstItem, secondItem) => {
  return `<div style='width: 100%;
                      max-width: fit-content;
                      margin-left: auto;
                      margin-right: auto;'>
    <div style='text-align: center;'>
      <a href='https://www.eliminator.football' target='_blank'>
        <img style='max-width: 350px;' src='https://i.imgur.com/tp67gkG.png' alt='EliminatorLogo'></img>
      </a>
    </div>
  
    ${firstItem}
  
    <div style='width: 100%;
                max-width: fit-content;
                margin-left: auto;
                margin-right: auto;'>
      ${secondItem}
    </div>
  </div>`;
};

const composeWeeklyTextEmail = (firstItem, secondItem, week) => {
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

const composeReminderHTMLEmail = (week, groupName, username) => {
  return `<div style='margin-top: 25px;
                      font-size: 22px;
                      text-align: center;'>
    You have empty players on your eliminator roster for week ${week}.
  </div>
  <div style='margin-top: 25px;
              font-size: 22px;
              text-align: center;'>
    Fill our your roster here: <a href='https://www.eliminator.football/roster/${groupName}/${username}' target='_blank'>Your Roster</a>
  </div>`;
};

const composeReminderTextEmail = (week, groupName, username) => {
  return `You have empty players on your eliminator roster for week ${week}
  
  Fill out your roster here: https://www.eliminator.football/roster/${groupName}/${username}`;
};

const createLeaderBoard = async (group, season, week) => {
  try {
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
  } catch (err) {
    console.log('Error creating leaderboard for emails: ', {
      group,
      season,
      week,
      err,
    });
    throw { status: 500, message: 'Error creating leaderboard for email' };
  }
};

const createRoster = async (groupPos, roster, week, username) => {
  try {
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
  } catch (err) {
    console.log('Error creating roster for emails: ', {
      groupPos,
      roster,
      week,
      username,
      err,
    });
    throw { status: 500, message: 'Error creating roster for email' };
  }
};

const createIdealRoster = async (groupPos, roster, week) => {
  try {
    const rosterRows = await rosterBuilder.rosterRow(roster, groupPos);
    const rosterHTML = await rosterBuilder.idealRosterBuilder(rosterRows, week);

    const textRows = await rosterBuilder.rosterTextRows(roster, groupPos);
    const rosterText = await rosterBuilder.idealRosterTextTemplate(
      textRows,
      week
    );

    return { idealRosterHTML: rosterHTML, idealRosterText: rosterText };
  } catch (err) {
    console.log('Error creating ideal roster for email: ', {
      groupPos,
      roster,
      week,
      err,
    });
    throw { status: 500, message: 'Error creating ideal roster for email' };
  }
};

export default {
  sendLeaderBoardEmail: async (group, season, week) => {
    try {
      let userIdArray = group.userlist.map((user) => user.userId.toString());
      let emailList = await db.UserReminderSettings.find(
        {
          userId: { $in: userIdArray },
          leaderboardEmail: true,
        },
        { userId: 1 }
      )
        .lean()
        .exec();
      userIdArray = emailList.map((user) => user.userId.toString());
      emailList = await db.User.find(
        { _id: { $in: userIdArray } },
        { email: 1 }
      )
        .lean()
        .exec();

      const subject = `Eliminator - Week ${week}`;

      const { position } = await db.GroupRoster.findOne(
        { groupId: group._id.toString() },
        { position: 1 }
      )
        .lean()
        .exec();
      const idealRoster = await groupHandler.getIdealRoster(
        group._id,
        season,
        week + 1
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
        position,
        filledIdealRoster,
        week
      );
      const HTMLTemplate = composeWeeklyHTMLEmail(
        leaderBoardHTML,
        idealRosterHTML,
        +week
      );
      const textTemplate = composeWeeklyTextEmail(
        leaderBoardText,
        idealRosterText,
        +week
      );

      for (const user of emailList) {
        const HTMLemail = unsubscribe.appendHTML(
          HTMLTemplate,
          user._id.toString()
        );
        const textEmail = unsubscribe.appendText(
          textTemplate,
          user._id.toString()
        );
        sendEmail(user.email, subject, HTMLemail, textEmail);
      }
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        console.log('Error in sending leaderboard email: ', {
          group,
          season,
          week,
          err,
        });
        throw { status: 500, message: 'Error sending leaderboard email' };
      }
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
    try {
      const subject = 'Yearly Recap for the Eliminator!';

      const { position } = await db.GroupRoster.findOne(
        { groupId: group._id.toString() },
        { position: 1 }
      )
        .lean()
        .exec();
      const { leaderBoardHTML, leaderBoardText } = await createLeaderBoard(
        group,
        season,
        maxWeek
      );

      const highestUserWeekFullRoster = await createRoster(
        position,
        highestScoreUserWeek.roster,
        highestScoreUserWeek.week,
        highestScoreUserWeek.username
      );
      const bestIdealRosterFull = await createIdealRoster(
        position,
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
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        console.log('Error sending yearly recap email: ', {
          maxWeek,
          season,
          group,
          yearlyWinner,
          highestScoreUserWeek,
          bestIdealRoster,
          bestScorePlayerByUser,
          err,
        });
        throw { status: 500, message: 'Error sending yearly recap' };
      }
    }
  },
  sendReminderEmails: async (season, week) => {
    try {
      const allGroups = await db.Group.find().lean().exec();
      for (const group of allGroups) {
        if (group.name === 'Demo Group') {
          continue;
        }
        let userIdArray = group.userlist.map((user) => user.userId.toString());
        const reminderSettings = await db.UserReminderSettings.find(
          {
            userId: { $in: userIdArray },
            reminderEmail: true,
          },
          { userId: 1 }
        )
          .lean()
          .exec();

        userIdArray = reminderSettings.map((user) => user.userId);
        const userRosters = await db.UserRoster.find(
          {
            userId: { $in: userIdArray },
            season: season,
            week: week,
          },
          { roster: 1, userId: 1 }
        )
          .lean()
          .exec();
        userIdArray = [];
        for (const weeklyRoster of userRosters) {
          const nonZeroMySportsId = weeklyRoster.roster.filter(
            (rosterSpot) => rosterSpot.mySportsId === 0
          );
          if (nonZeroMySportsId.length > 0) {
            userIdArray.push(weeklyRoster.userId);
          }
        }
        const userEmails = await db.User.find(
          { _id: { $in: userIdArray } },
          { email: 1, username: 1 }
        )
          .lean()
          .exec();
        const subject = `Empty Roster Spots in the Eliminator for Week ${week}`;
        for (const user of userEmails) {
          //Send out the reminder emails here
          const HTMLTemplate = composeWeeklyHTMLEmail(
            composeReminderHTMLEmail(week, group.name, user.username),
            ''
          );
          const textTemplate = composeReminderTextEmail(
            week,
            group.name,
            user.username
          );
          const HTMLemail = unsubscribe.appendHTML(
            HTMLTemplate,
            user._id.toString()
          );
          const textEmail = unsubscribe.appendText(
            textTemplate,
            user._id.toString()
          );
          sendEmail(user.email, subject, HTMLemail, textEmail);
        }
      }
    } catch (err) {
      console.log('Error sending reminder email: ', { err });
      if (err.status) {
        throw err;
      } else {
        throw { status: 500, message: 'Error sending remminder email' };
      }
    }
  },
};
