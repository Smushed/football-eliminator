const schedule = require(`node-schedule`);
const dates = require(`../constants/dates`);
const { pullSeasonAndWeekFromDB, updateCurrWeek, updateLockWeek } = require(`../handlers/userHandler`);
const { updateRoster, getWeeklyData } = require(`../handlers/mySportsHandler`);
const { scoreAllGroups } = require(`../handlers/rosterHandler`);
const moment = require(`moment-timezone`);

// Schedule a job for thge 22nd minute of each hour
// Doing this every hour rather than daily in case Heroku isn't working
schedule.scheduleJob('22 * * * *', async function () {
    //Need to update which week we're currently in
    const currDate = moment.utc(new Date()).tz(`America/Chicago`).format();

    const currDBWeeks = await pullSeasonAndWeekFromDB();

    startWeek(currDate, currDBWeeks, 1);
    lockWeek(currDate, currDBWeeks, 0);
});

// Update Scores every day at 3am 
schedule.scheduleJob('0 3 * * *', async function () {
    const { season, week } = await pullSeasonAndWeekFromDB();
    await updateRoster(season);
    await getWeeklyData(season, week);
    scoreAllGroups(season, week);
});

const startWeek = (currDate, currDBWeeks, currWeek) => {
    for (let i = 17; i >= 0; i--) {
        if (currDate > dates.startWeek2021[i]) {
            currWeek = i + 1;
            break;
        }
    }
    if (currDBWeeks.week !== currWeek) {
        updateCurrWeek(currWeek);
    }
};

const lockWeek = (currDate, currDBWeeks, currWeek) => {
    for (let i = 17; i >= 0; i--) {
        if (currDate > dates.lockWeek2021[i]) {
            currWeek = i + 1;
            break;
        }
    }
    if (currDBWeeks.lockWeek !== currWeek) {
        updateLockWeek(currWeek);
    }
};