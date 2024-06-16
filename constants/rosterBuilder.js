import { table } from 'table';

export default {
  rosterRow: (filledRoster, groupPos) => {
    return new Promise(async (res, rej) => {
      let rows = ``;
      for (let i = 0; i < filledRoster.length; i++) {
        rows += `<div style='display: flex;
                                    justify-content: space-evenly;
                                    border-bottom: 1px solid lightgrey;
                                    border-radius: 2px;
                                    background-color: transparent;
                                    width: 93%;
                                    height: 36px;
                                    font-weight: 500;
                                    padding-left: 20px;
                                    overflow: hidden;'>
                    <div style='padding-top: 8px;
                                min-width: 70px;'>
                        ${groupPos[i].name}
                    </div>
                    <div style='width: 80%;'>
                        <div style='width: 90%;
                                    display: flex;
                                    justify-content: space-around;'>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 150px;'>
                                ${filledRoster[i].name}
                            </div>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 40px;'>
                                ${filledRoster[i].team}
                            </div>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 40px;'>
                                ${filledRoster[i].score.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div >`;
      }
      res(rows);
    });
  },
  rosterBuilder: async (rows, week, username) => {
    return `<div style='width: 355px;
                            border: 1px solid lightgray';
                            border-radius: 15px;>
                    <div style='background-color: rgb(166, 241, 166);
                                font-size: 24px;
                                font-weight: 600;
                                text-align: center;'>
                        User ${username} from Week ${week}
                    </div>
                    ${rows}
                </div>`;
  },
  idealRosterBuilder: async (rows, week) => {
    return `<div style='width: 355px;
                        border: 1px solid lightgray';
                        border-radius: 10px;>
                    <div style='background-color: rgb(166, 241, 166);
                                font-size: 24px;
                                font-weight: 600;
                                text-align: center;'>
                        Ideal Roster from Week ${week}
                      </div>
                      ${rows}
                  </div>`;
  },
  rosterTextRows: async (filledRoster, groupPos) => {
    let rows = [];
    for (let i = 0; i < filledRoster.length; i++) {
      rows.push([
        groupPos[i].name,
        filledRoster[i].name,
        filledRoster[i].team,
        filledRoster[i].score.toFixed(2),
      ]);
    }
    return rows;
  },
  rosterTextTemplate: async (rows, week, username) => {
    const tableConfig = {
      header: {
        alignment: `center`,
        content: `${username} roster for week ${week}`,
      },
    };
    return table(rows, tableConfig);
  },
  idealRosterTextTemplate: async (rows, week) => {
    const tableConfig = {
      header: {
        alignment: `center`,
        content: `Ideal roster for week ${week}`,
      },
    };
    return table(rows, tableConfig);
  },
};
