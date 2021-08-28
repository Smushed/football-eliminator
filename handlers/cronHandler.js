const schedule = require('node-schedule');
const dates = require('../constants/dates');
const userHandler = require('../handlers/userHandler');
const mySportsHandler = require('../handlers/mySportsHandler');

// Schedule a job for thge 22nd minute of each hour
// Doing this every hour rather than daily in case Heroku isn't working
schedule.scheduleJob('22 * * * *', async function () {
    //Need to update which week we're currently in
    const currDate = new Date();
    const currDBWeeks = await userHandler.pullSeasonAndWeekFromDB();

    startWeek(currDate, currDBWeeks, 1);
    lockWeek(currDate, currDBWeeks, 0);
});

// Update Scores every day at 3am 
schedule.scheduleJob('0 3 * 9,10,11,12,1 *', async function () {
    const currDBWeeks = await userHandler.pullSeasonAndWeekFromDB();
    mySportsHandler.getWeeklyData(currDBWeeks.season, currDBWeeks.week);
});

const startWeek = (currDate, currDBWeeks, currWeek) => {
    for (let i = 17; i > 0; i--) {
        if (currDate > dates.startWeek2021[i]) {
            currWeek = i + 1;
            break;
        }
    }
    if (currDBWeeks.week !== currWeek) {
        userHandler.updateCurrWeek(currWeek);
    }
};

const lockWeek = (currDate, currDBWeeks, currWeek) => {
    for (let i = 17; i > 0; i--) {
        if (currDate > dates.lockWeek2021[i]) {
            currWeek = i + 1;
            break;
        }
    }
    if (currDBWeeks.week !== currWeek) {
        userHandler.updateLockWeek(currWeek);
    }
};