# Copying Data from Prod to Dev
Delete the dev DB First

mongodump --archive --db=test --uri="{PROD_URI}" | mongorestore --archive --nsFrom='{PROD_DB_NAME}.*' --nsTo='fantasyEliminator.*' --host=localhost --port=27017

# Player Data

Player Data is where I'm going to be storing generic information about each player. From their name, to if they're still playing

PlayerDataSchema =
<br />
- N - full_name: String<br />
- M - mySportsId: Number<br />
- T - team: String<br />
- P - position: String<br />
- A - active: Boolean<br />
- R - rank: Number<br />

# Player Stats

Where each player's stats will be held. Each player will have an entry for each week<br />

PlayerStatsSchema =<br />

- M - mySportsId: Number<br />
- W - week: Number<br />
- S - season: String<br />
- P - passing:<br /> - T - passTD: Number<br /> - Y- passYards: Number<br /> - I - passInt: Number<br /> - A - passAttempts: Number<br /> - C - passCompletions: Number<br /> - 2P - twoPtPassMade: Number<br />
- RU - rushing:<br /> - A - rushAttempts: Number<br /> - Y - rushYards: Number<br /> - T - rushTD: Number<br /> - 20 - rush20Plus: Number<br /> - 40 - rush40Plus: Number<br /> - F - rushFumbles: Number<br /> - 2P - twoPtRushMade: Number<br />
- RE - receiving:<br /> - TA - targets: Number<br /> - R - receptions: Number<br /> - Y - recYards: Number<br /> - T - recTD: Number<br /> - 20 - rec20Plus: Number<br /> - 40 - rec40Plus: Number<br /> - F - recFumbles: Number<br /> - 2P - twoPtRecMade: Number<br />
- F - fumbles: Number<br />
- FG - fieldGoals:<br /> - 1 - fgMade1_19: Number<br /> - 20 - fgMade20_29: Number<br /> - 30 - fgMade30_39: Number<br /> - 40 - fgMade40_49: Number<br /> - 50 - fgMade50Plus: Number<br /> - X - extraPointMade: Number<br />

# Group / Roster Info

The Roster is customizable for each group. They should be able to set the players that they want to play each and every week.
They should be able to choose between

Different Positions to choose from. This is in the constant folder<br /><br />
1 - QB<br />
2 - RB<br />
3 - WR<br />
4 - TE<br />
5 - K<br />
6 - D<br />
7 - RB/WR<br />
8 - Flex (RB/WR/TE)<br />
9 - Super Flex (QB/RB/WR/TE)<br />
