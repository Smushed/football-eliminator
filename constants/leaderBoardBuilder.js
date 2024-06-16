import { table } from 'table';
import QuickChart from 'quickchart-js';

export default {
  // leaderBoardRowBuilder: (leaderboard) =>

  // let rows = '';
  // for (let i = 0; i < leaderboard.length; i++) {
  //   rows += `<div style='margin-left: 10px;
  //                               margin-right: 10px;
  //                               display: flex;
  //                               justify-content: space-between;
  //                               border-bottom: 1px solid lightgray;
  //                               padding-top: 5px;
  //                               font-size: 20px;'>
  //           <div style='width: 50%;
  //                       justify-self: flex-start;
  //                       padding-left: 35px;
  //                       text-overflow: ellipsis;'>
  //               ${leaderboard[i].username}
  //           </div>
  //           <div style='width: 25%;
  //                       text-align: center;
  //                       text-overflow: ellipsis;'>
  //               ${leaderboard[i].currentWeek.toLocaleString('en-US', {
  //                 maximumFractionDigits: 2,
  //                 minimumFractionDigits: 2,
  //               })}
  //           </div>
  //           <div style='width: 25%;
  //                       text-align: center;
  //                       padding-right: 20px;
  //                       text-overflow: ellipsis;'>
  //               ${leaderboard[i].totalScore.toLocaleString('en-US', {
  //                 maximumFractionDigits: 2,
  //                 minimumFractionDigits: 2,
  //               })}
  //           </div>
  //       </div>
  //       `;
  // }
  // res(rows);
  // }),
  createLeaderBoardChart: (leaderBoard, groupName, week) => {
    const chartOptions = {
      maintainAspectRatio: true,
      title: {
        display: true,
        text: `Week ${week} ${groupName} Leaderboard`,
      },
      legend: {
        display: false,
      },
    };
    const usernameList = leaderBoard.map((user) => user.username);
    const chartData = leaderBoard.map((user) => user.totalScore);
    const chart = new QuickChart();
    chart.setConfig({
      type: 'horizontalBar',
      data: {
        labels: usernameList,
        datasets: [
          {
            label: 'Leaderboard',
            data: chartData,
            borderColor: '#65a865',
            backgroundColor: '#90EE90',
          },
        ],
      },
      options: chartOptions,
    });
    chart.setWidth(500);
    chart.setHeight(300);

    return `<img src=${chart.getUrl()} alt='Having Trouble Reading this email? Allow Remote Content'></img>`;
  },
  leaderBoardTemplate: (leaderboardImage) => {
    return `<div style='display: grid;
                        place-content: center'>
      ${leaderboardImage}
    </div>`;
  },
  leaderBoardTextRows: (leaderboard) =>
    new Promise(async (res, rej) => {
      let rows = [];
      for (let i = 0; i < leaderboard.length; i++) {
        const username = leaderboard[i].username;
        const currentWeek = leaderboard[i].currentWeek.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        const totalScore = leaderboard[i].totalScore.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        rows.push([username, currentWeek, totalScore]);
      }
      res(rows);
    }),
  leaderBoardTextTemplate: (rows, groupName, week) => {
    const tableConfig = {
      columns: { 1: { width: 20 } },
    };
    const textLeaderboard = [...rows];
    textLeaderboard.unshift(
      [groupName, `Leaderboard`, `Week ${week}`],
      [`Name`, `Curr Week`, `Total`]
    );
    // let leaderBoard = ``;
    // for (let i = 0; i < textLeaderboard.length; i++) {
    //   leaderBoard += `${textLeaderboard[i][0]}  ${textLeaderboard[i][1]}  ${textLeaderboard[i][2]}`;
    // }
    return table(textLeaderboard, tableConfig);
  },
};
