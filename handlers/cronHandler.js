import 'dotenv/config.js';
import schedule from 'node-schedule';
import moment from 'moment-timezone';
import dates from '../constants/dates.js';
import mySportsHandler from '../handlers/mySportsHandler.js';
import rosterHandler from '../handlers/rosterHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import emailHandler from '../handlers/emailHandler.js';
import cacheHandler from './cacheHandler.js';
import nflTeams from '../constants/nflTeams.js';

// Schedule a job for the 22nd minute of each hour
// Doing this every hour rather than daily in case Heroku isn't working
const checkLockWeek = () =>
  schedule.scheduleJob('22 * * 1,9-12 *', async function () {
    //Need to update which week we're currently in
    const currDate = moment.utc(new Date()).tz('America/Chicago').toDate();
    console.log(`Checking start week and lock week ${currDate}`);

    try {
      const currDBWeeks = await mySportsHandler.pullSeasonAndWeekFromDB();
      startWeek(currDate, currDBWeeks, 1);
    } catch (err) {
      console.log('Error updating week for eliminator: ', { err });
    }
  });

// Check Player Rosters at 3am Chicago Time
const dailyScoreUpdate = () =>
  schedule.scheduleJob('0 9 * 1,9-12 *', async function () {
    console.log('Running player roster update');
    try {
      const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
      mySportsHandler.updateTeamRoster(season, nflTeams.teams);

      allScheduledGames(season);
    } catch (err) {
      console.log('Error running the player roster update: ', { err });
    }
  });

//3:15am get weekly data and save it
const scorePlayersAndGroups = () =>
  schedule.scheduleJob('15 9 * 1,9-12 *', async function () {
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      console.log('Scoring players and groups update');
      updatePlayersWithWeeklyData(season, week);
    } catch (err) {
      console.log('Error doing the 3:15am weekly player pull: ', { err });
    }
  });

//3:30am rank the players, after weekly pull was complete
const updateAndRankPlayers = () =>
  schedule.scheduleJob('30 9 * 1,9-12 *', async function () {
    console.log('Running roster and score update');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      await rosterHandler.scoreAllGroups(season, week);
      await rosterHandler.rankPlayersBasedOnGroup(season, week, 'Eliminator');
    } catch (err) {
      console.log('Error doing roster and scoring update @ 3:30am: ', { err });
    }
  });

//Iterate through the NFL rosters to sort players at 3:35am
const updateTeamRoster = () =>
  schedule.scheduleJob('35 9 * 1,9-12 *', async function () {
    try {
      const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
      mySportsHandler.updateTeamRoster(season, nflTeams.teams);
    } catch (err) {
      console.log('Error Updating NFL rosters @ 3:35am: ', { err });
    }
  });

// Thursday and Monday games (these are in UTC)
const updateForWeekdayGames = () =>
  schedule.scheduleJob('0 0-5 * 1,9-12 2,5', async function () {
    console.log('Running hourly Monday and Thursday game score');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      updatePlayersWithWeeklyData(season, week);
    } catch (err) {
      console.log('Error doing the hourly Monday & Thursday update: ', { err });
    }
  });

// Update every hour on Sunday
const updateBiHourlySundays = () =>
  schedule.scheduleJob('0 17-23 * 1,9-12 0', async function () {
    console.log('Running hourly Sunday job');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      updatePlayersWithWeeklyData(season, week);
    } catch (err) {
      console.log('Error with the hourly Sunday update: ', { err });
    }
  });

// Before email is sent out update the players
const updatePlayers = () =>
  schedule.scheduleJob('00 12 * 1,9-12 2', async function () {
    console.log('Running scoring again an hour before email is sent out');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      updatePlayersWithWeeklyData();
      await rosterHandler.scoreAllGroups(season, week);
    } catch (err) {
      console.log('Error Updating the players before the email is sent out: ', {
        err,
      });
    }
  });

//Right before the Leaderboard is sent out update the ideal roster
const updateIdealRoster = () =>
  schedule.scheduleJob('20 12 * 1,9-12 2', async function () {
    try {
      console.log('Updating Ideal Roster');
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      groupHandler.updateAllIdealRosters(season, +week - 1);
    } catch (err) {
      console.log('Error updating Ideal Roster before leaderboard is sent: ', {
        err,
      });
    }
  });

//Send out the Leaderboard every Tuesday
const emailLeaderboard = () =>
  schedule.scheduleJob('30 12 * 1,9-12 2', async function () {
    console.log('Sending out the weekly email');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      const groups = await groupHandler.getAllGroups();
      for (let group of groups) {
        if (group.name !== 'Demo Group')
          emailHandler.sendLeaderBoardEmail(group, season, +week - 1);
      }
    } catch (err) {
      console.log('Error sending out leaderboard on tuesday: ', { err });
    }
  });

//Every 8am on Thursday send out reminder emails
const reminderEmails = () =>
  schedule.scheduleJob('00 14 * 1,9-12 4', async function () {
    console.log('Sending out reminder emails');
    try {
      const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
      emailHandler.sendReminderEmails(season, week);
    } catch (err) {
      console.log('Error sending out reminder emails: ', { err });
    }
  });

//Every day at 2am reseed the cache
const seedCache = () =>
  schedule.scheduleJob('00 08 * 1,9-12 *', async function () {
    try {
      cacheHandler.initCache();
    } catch (err) {
      console.log('Error initializing cache at 2am: ', { err });
    }
  });

const allScheduledGames = (season) => {
  let i = 1;
  mySportsHandler.pullMatchUpsForDB(season, 18);

  const gameTimer = setInterval(async () => {
    mySportsHandler.checkGameStarted(season, i);
    i++;
    if (i > 18) {
      clearInterval(gameTimer);
    }
  }, 6000);
};

const startWeek = async (currDate, currDBWeeks, currWeek) => {
  for (let i = 18; i >= 0; i--) {
    if (currDate > dates.startWeek2023[i]) {
      currWeek = i + 1;
      break;
    }
  }
  if (currDBWeeks.week !== currWeek) {
    const valToUpdate = {
      week: currWeek === 19 ? 18 : currWeek,
      lockWeek: currWeek - 1,
      seasonOver: currWeek === 19,
    };
    try {
      await mySportsHandler.updateSeasonAndWeek(valToUpdate);
    } catch (err) {
      throw err;
    }
    // mySportsHandler.updateLockWeek(currWeek - 1);
  }
};

const updatePlayersWithWeeklyData = async (season, week) => {
  try {
    const playersByPosition = await mySportsHandler.getWeeklyData(season, week);
    await mySportsHandler.updatePlayerDataFromWeeklyPull(playersByPosition);
    await mySportsHandler.updatePlayerScoresForWeek(
      playersByPosition,
      season,
      week
    );
    await rosterHandler.scoreAllGroups(season, week);
  } catch (err) {
    console.log('Error in updatePlayersWithWeeklyData');
    throw err; //Coming from above, just throw the err to be logged above
  }
};

export default () => {
  checkLockWeek();
  dailyScoreUpdate();
  scorePlayersAndGroups();
  updateAndRankPlayers();
  updateTeamRoster();
  updateForWeekdayGames();
  updateBiHourlySundays();
  updatePlayers();
  updateIdealRoster();
  emailLeaderboard();
  seedCache();
  reminderEmails();
};
