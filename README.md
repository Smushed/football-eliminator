## Football Eliminator

This game is a mix of daily and season long NFL fantasy. The goal is for you and your group to compete on a week to week basis on a game that lasts the entire season long. Every week each player sets a roster with the restriction that they cannot play anyone they have not already played previously.
<br />
<br />
<strong>For Example</strong>

- The first week you decide to play Patrick Mahomes. The rest of the season you must construct your rosters without Patrick Mahomes regardless of how he played in the first week, or if he has a better match up in the future.

The scoring of this game is total points.
<br />

## How this game came to be

My dad, uncle and I are avvid fantasy football players. For two years we played this game and were running it out of an excel sheet. That was horribly cumbersome so we stopped playing but spoke about playing again if it was simpler.

When I graduated from my bootcamp I decided to make this game a reality. In my head, this will always be a labor of love, something I never plan on monetizing or sending out to the wider world. This is a game I plan on keeping local and playing with family and friends. Anyone is able to join and play.

## Current Status

Some key features are listed below:

- Users can log in and pick a roster for each week.
- Users can join, or create, a group with others to compete for the fantasy championship.
- Fully customizable scoring for offensive NFL players.
- The weeks and seasons are displayed based on the current day and are automatically updated based off server time.
- Scores are calculated on a CRON schedule inside of the app and triggered on Heroku while the NFL season is in progress
- Users can alter rosters right up until each player's game time
- Users can view other user's rosters
- Leaderboard for users to compare scores
- Weekly ideal roster set for each group picking the players that did the best over the previous week
- Users are sent out a weekly email with the current Leaderboard and the highest possible scoring roster from the previous week

## Current Release: 1.2

- Updating the UI to make it more mobile friendly. Most users use it on their phone
- Adding more color to the website to make it "pop" and make more enjoyable to use
- Dramatically increasing the amount of images that are shown on the app including adding an avatar for every NFL player and showing user avatars on home page load

## Previous Releases

### Major Features added in 1.0

- Implementing Context instead of prop drilling for state management.
- Adding error handling on both the front and back end for every route.

### Major Features added in 0.3

- Reogranized databse structure to better implement used players which dramatically improved load time on weekly roster pages, one of the main pages of the application.
- Added the injury designation to the row players are displayed on, which allowed users to see players who were hurt within the application.
- Allowed players to go back and view group rosters from previous weeks.

### Major Features added in 0.2

- Decoupled the fantasy player stats from their name document. Taking load times from 15+ seconds down to 2 seconds.
- Showed weekly matchup details for each player.
- Ranking for players based on their fantasy score for the current year which would group players together and allow users to see top players easier.
- A player search which allowed users to search for any player currently in their available pool.
- Users can update their username and profile picture which will be displayed on the main page for the application.
