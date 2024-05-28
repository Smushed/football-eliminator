import { table } from 'table';

export default {
  leaderBoardRowBuilder: (leaderboard) => {
    return new Promise(async (res, rej) => {
      let rows = ``;
      for (let i = 0; i < leaderboard.length; i++) {
        rows += `<div style='margin-left: 10px;
                                    margin-right: 10px;
                                    display: flex;
                                    justify-content: space-between;
                                    border-bottom: 1px solid lightgray;
                                    padding-top: 5px;
                                    font-size: 20px;'>
                <div style='width: 50%;
                            justify-self: flex-start;
                            padding-left: 35px; 
                            text-overflow: ellipsis;'>
                    ${leaderboard[i].UN}
                </div>
                <div style='width: 25%;
                            text-align: center; 
                            text-overflow: ellipsis;'>
                    ${leaderboard[i].CW.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                </div>
                <div style='width: 25%;
                            text-align: center;
                            padding-right: 20px; 
                            text-overflow: ellipsis;'>
                    ${leaderboard[i].TS.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                </div>
            </div>
            `;
      }
      res(rows);
    });
  },
  leaderBoardTemplate: (userRows, groupName, week) => {
    return `<div style='width: 500px;'>
            <div style='border: 1px solid lightgray;
                        border-radius: 10px;
                        margin: auto;
                        margin-bottom: 25px;
                        padding-bottom: 25px;
                        width: 100%;'>
                <div style='display: flex;
                            width: 100%;
                            justify-content: space-evenly;
                            position: relative;
                            padding: 5px 0;
                            margin: auto 0;
                            margin-bottom: 5px;
                            border-bottom: 1px solid lightgray;
                            background-color: rgb(166, 241, 166);
                            border-top-left-radius: 10px;
                            border-top-right-radius: 10px;'>
                    <span style='width: 35%;
                                font-size: 24px;
                                font-weight: 600;'>
                            ${groupName}
                    </span>
                    <span style='width: 45%;
                                font-size: 28px;
                                font-weight: 600;'>
                        Leaderboard
                    </span>
                    <span style='width: 20%;
                                font-size: 24px;
                                font-weight: 600;'>
                        Week ${week}
                    </span>
                </div>
                <div style='margin-left: 10px;
                                margin-right: 10px;
                                display: flex;
                                justify-content: space-between;
                                border-bottom: 1px solid lightgray;
                                padding-top: 5px;
                                font-size: 20px;'>
                    <div style='width: 50%;
                                justify-self: flex-start;
                                padding-left: 35px;
                                font-weight: 600;'>
                        Name
                    </div>
                    <div style='width: 25%;
                                text-align: center;
                                font-weight: 600;'>
                        Curr Week
                    </div>
                    <div style='width: 25%;
                                text-align: center;
                                padding-right: 20px;
                                font-weight: 600;'>
                        Total
                    </div>
                </div>
                ${userRows}
            </div>
        </div>`;
  },
  leaderBoardTextRows: (leaderboard) => {
    return new Promise(async (res, rej) => {
      let rows = [];
      for (let i = 0; i < leaderboard.length; i++) {
        const username = leaderboard[i].UN;
        const currWeek = leaderboard[i].CW.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        const totalScore = leaderboard[i].TS.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        rows.push([username, currWeek, totalScore]);
      }
      res(rows);
    });
  },
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
