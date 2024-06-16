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

    const currDBWeeks = await mySportsHandler.pullSeasonAndWeekFromDB();

    startWeek(currDate, currDBWeeks, 1);
  });

// Check Player Rosters at 3am Chicago Time
const dailyScoreUpdate = () =>
  schedule.scheduleJob('0 9 * 1,9-12 *', async function () {
    console.log('Running player roster update');
    const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
    mySportsHandler.updateTeamRoster(season, nflTeams.teams);

    allScheduledGames(season);
  });

//3:15am get weekly data and save it
const scorePlayersAndGroups = () =>
  schedule.scheduleJob('15 9 * 1,9-12 *', async function () {
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    console.log('Scoring players and groups update');
    updatePlayersWithWeeklyData(season, week);
  });

//3:30am rank the players, after weekly pull was complete
const updateAndRankPlayers = () =>
  schedule.scheduleJob('30 9 * 1,9-12 *', async function () {
    console.log('Running roster and score update');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    await rosterHandler.scoreAllGroups(season, week);
    await rosterHandler.rankPlayersBasedOnGroup(season, week, 'Eliminator');
  });

//Iterate through the NFL rosters to sort players at 3:35am
const updateTeamRoster = () =>
  schedule.scheduleJob('35 9 * 1,9-12 *', async function () {
    const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
    mySportsHandler.updateTeamRoster(season, nflTeams.teams);
  });

// Thursday and Monday games (these are in UTC)
const updateForWeekdayGames = () =>
  schedule.scheduleJob('0 0-5 * 1,9-12 2,5', async function () {
    console.log('Running hourly Monday and Thursday game score');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    updatePlayersWithWeeklyData(season, week);
  });

// Update every hour on Sunday
const updateBiHourlySundays = () =>
  schedule.scheduleJob('0 17-23 * 1,9-12 0', async function () {
    console.log('Running hourly Sunday job');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    updatePlayersWithWeeklyData(season, week);
  });

// Before email is sent out update the players
const updatePlayers = () =>
  schedule.scheduleJob('00 12 * 1,9-12 2', async function () {
    console.log('Running scoring again an hour before email is sent out');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    updatePlayersWithWeeklyData();
    await rosterHandler.scoreAllGroups(season, week);
  });

//Right before the Leaderboard is sent out update the ideal roster
const updateIdealRoster = () =>
  schedule.scheduleJob('20 12 * 1,9-12 2', async function () {
    console.log('Updating Ideal Roster');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    groupHandler.updateAllIdealRosters(season, +week - 1);
  });

//Send out the Leaderboard every Tuesday
const emailLeaderboard = () =>
  schedule.scheduleJob('30 12 * 1,9-12 2', async function () {
    console.log('Sending out the weekly email');
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    const groups = await groupHandler.getAllGroups();
    for (let group of groups) {
      if (group.name !== 'Demo Group')
        emailHandler.sendLeaderBoardEmail(group, season, +week - 1);
    }
  });

//Every day at 2am reseed the cache
const seedCache = () =>
  schedule.scheduleJob('00 08 * 1,9-12 *', async function () {
    cacheHandler.initCache();
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

const startWeek = (currDate, currDBWeeks, currWeek) => {
  for (let i = 17; i >= 0; i--) {
    if (currDate > dates.startWeek2023[i]) {
      currWeek = i + 1;
      break;
    }
  }
  if (currDBWeeks.week !== currWeek) {
    mySportsHandler.updateCurrWeek(currWeek);
    mySportsHandler.updateLockWeek(currWeek - 1);
  }
};

const updatePlayersWithWeeklyData = async (season, week) => {
  const playersByPosition = await mySportsHandler.getWeeklyData(season, week);
  await mySportsHandler.updatePlayerDataFromWeeklyPull(playersByPosition);
  await mySportsHandler.updatePlayerScoresForWeek(
    playersByPosition,
    season,
    week
  );
  await rosterHandler.scoreAllGroups(season, week);
};

import db from '../models/index.js';

const test = async () => {
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  const group = await db.Group.findOne({ name: 'Eliminator' });
  emailHandler.sendLeaderBoardEmail(group, season, +week - 1);
};

export default () => {
  // checkLockWeek();
  // dailyScoreUpdate();
  // scorePlayersAndGroups();
  // updateAndRankPlayers();
  // updateTeamRoster();
  // updateForWeekdayGames();
  // updateBiHourlySundays();
  // updatePlayers();
  // updateIdealRoster();
  // emailLeaderboard();
  // seedCache();
  test();
};
