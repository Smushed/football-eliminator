const schedule = require(`node-schedule`);
const dates = require(`../constants/dates`);
const userHandler = require(`../handlers/userHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const emailHandler = require(`../handlers/emailHandler`);
const nflTeams = require(`../constants/nflTeams`);
const moment = require(`moment-timezone`);

// Schedule a job for the 22nd minute of each hour
// Doing this every hour rather than daily in case Heroku isn't working
schedule.scheduleJob('22 * * 1,9-12 *', async function () {
  //Need to update which week we're currently in
  const currDate = moment.utc(new Date()).tz(`America/Chicago`).toDate();
  console.log(`Checking start week and lock week ${currDate}`);

  const currDBWeeks = await mySportsHandler.pullSeasonAndWeekFromDB();

  startWeek(currDate, currDBWeeks, 1);
});

// Update Scores every day at 3am Chicago time
schedule.scheduleJob('0 9 * 1,9-12 *', async function () {
  console.log(`Running player roster update`);
  const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
  mySportsHandler.updateTeamRoster(season, nflTeams.teams);

  allScheduledGames(season);
});

schedule.scheduleJob('15 9 * 1,9-12 *', async function () {
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  console.log(`Scoring players and groups update`);
  updatePlayerData(season, week);
});

//Rank the Players
schedule.scheduleJob('30 9 * 1,9-12 *', async function () {
  console.log(`Running roster and score update`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  await rosterHandler.scoreAllGroups(season, week);

  const clapper = await groupHandler.getGroupData(`Eliminator`); //Default to the clapper as the 'main' group
  const groupScore = await groupHandler.getGroupScore(clapper._id);

  const rankedPlayers = await mySportsHandler.rankPlayers(
    season,
    week,
    groupScore,
    true
  );
  await mySportsHandler.savePlayerRank(rankedPlayers);
});

schedule.scheduleJob('30 9 * 1,9-12 *', async function () {
  const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
  updateTeamRoster(season, nflTeams.teams);
});

// Thursday and Monday games (these are in UTC)
schedule.scheduleJob('0 0-5 * 1,9-12 2,5', async function () {
  console.log(`Running bi-hourly Monday and Thursday game score`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  await mySportsHandler.getWeeklyData(season, week);
  updatePlayerData(season, week);
});

// Update most often on Sunday
schedule.scheduleJob('0 17-23 * 1,9-12 0', async function () {
  console.log(`Running bi-hourly Sunday job`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  updatePlayerData(season, week);
});

// Before email is sent out update the players
schedule.scheduleJob('00 12 * 1,9-12 2', async function () {
  console.log(`Running scoring again an hour before email is sent out`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  await mySportsHandler.getEveryWeekData(season, week);
  await rosterHandler.scoreAllGroups(season, week);
});

//Right before the Leaderboard is sent out update the ideal roster
schedule.scheduleJob('20 12 * 1,9-12 2', async function () {
  console.log(`Updating Ideal Roster`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  groupHandler.updateAllIdealRosters(season, +week - 1);
});

//Send out the Leaderboard every Tuesday
schedule.scheduleJob('30 12 * 1,9-12 2', async function () {
  console.log(`Sending out the weekly email`);
  const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
  const groups = await groupHandler.getAllGroups();
  for (let group of groups) {
    if (group.N !== 'Demo Group')
      emailHandler.sendLeaderBoardEmail(group, season, +week - 1);
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

const updatePlayerData = async (season, week) => {
  await mySportsHandler.getWeeklyData(season, week);
  await rosterHandler.scoreAllGroups(season, week);
  return;
};
