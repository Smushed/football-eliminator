const { table, getBorderCharacters } = require(`table`);

module.exports = {
  idealRosterRow: (filledRoster, groupPos) => {
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
                        ${groupPos[i].N}
                    </div>
                    <div style='width: 80%;'>
                        <div style='width: 90%;
                                    display: flex;
                                    justify-content: space-around;'>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 150px;'>
                                ${filledRoster[i].N}
                            </div>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 40px;'>
                                ${filledRoster[i].T}
                            </div>
                            <div style='padding-top: 8px;
                                        padding-bottom: 8px;
                                        min-width: 40px;'>
                                ${filledRoster[i].SC.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div >`;
      }
      res(rows);
    });
  },
  idealRosterBuilder: async (rows, week) => {
    return `<div style='width: 355px;
                            border: 1px solid lightgray';
                            border-radius: 15px;>
                    <div style='background-color: rgb(166, 241, 166);
                                font-size: 24px;
                                font-weight: 600;
                                text-align: center;'>
                        Ideal Roster from ${week}
                    </div>
                    ${rows}
                </div>`;
  },
  idealRosterTextRows: async (filledRoster, groupPos) => {
    let rows = [];
    for (let i = 0; i < filledRoster.length; i++) {
      rows.push([
        groupPos[i].N,
        filledRoster[i].N,
        filledRoster[i].T,
        filledRoster[i].SC.toFixed(2),
      ]);
    }
    return rows;
  },
  idealRosterTextTemplate: async (rows, week) => {
    const tableConfig = {
      header: {
        alignment: `center`,
        content: `Ideal roster for ${week}`,
      },
      border: getBorderCharacters("void"),
    };
    return table(rows, tableConfig);
  },
};
