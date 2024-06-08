## Fantasy Eliminator

### This is a document which I wrote to help myself start this project. Almost all of the technical and structure of the data has been reworked and rewritten.
### Rather than delete this document I'm keeping it here as an example of how I began this project.

<br />

This is a game which combines daily fantasy with the challenge of a year long game. All players of this game have access to every player who is on a roster in the NFL however, they may only play each player one time.
- For example: If you were to play Tom Brady week 1, then you are unable to play Tom Brady week 2-17. You can play any other QB in that slot.
<br />
<br />
## Webpage Layout
This will be hidden behind a login system which is always running. The goal is never to make this a public app. Rather, the goal is to enjoy a style of fantasy football which we once played but is no longer available.<br />

This app is going to have two main sections. One where you sign up for groups with people that are invited to them, and a leaderboard which will show all players.<br />

This app must be designed with mobile users in mind. There will be many potential players of this app who will be using mobile phones and would only like to use this on a mobile phone.

## Features
- Leaderboard of all the top players
    - Since players can have more than one entry, only their top entry will be displayed
        - Scores are normalized to the "standard scoring"
- Groups for people to join
    - Groups are public, anyone can peek into their group and see what they're doing
    - In the groups players are ranked
    - Groups are also ranked for the highest rated group
        - This should only take place if the scoring is normalized before ranking the groups
    - Groups should have custom scoring
- Rosters
    - Users fill out a roster for each group they are a part of
        - Users will not be able to fill out a roster without being part of a group

### On Login
Once a player logs in they have the option to either create a group or to search for a user / another group. If they search for a group then they have the option to request to join the group. Where an admin needs to approve.

- User Logs in
    - User Searches for a Group to join
        - User finds group and requests to join
            - User fills out a custom message
        - Custom Message & Username is sent to the group admin who then can approve or reject the request
    - User is accepted into the group
        - User fills out roster for the current group

If they create a group then they are taken to a page where they can then configure their roster or they can add people to the group.
- User Logs In
    - User Creates a Group
        - User makes a name, description and sets the scoring rules for the game
    - User adds people
        - User can search the app by username or email
        - User can email other people outside of the app to come and join the group

## Group Structure

# MVP
MVP for this project will be allowing users to pick a player to play each week. Also not allowing the user to pick the same player in another week. At the end of the week (Tuesday morning) the stats pulling software will run and the user will have their stats updated.
MVP does NOT include group functionality.
MVP does include the leaderboard and viewing other people's picks that week.

# Mongo Structure
## Database has been totally reworked since this was written

- Users
    - local
        - username
        - email
    - notifications (FUTURE USE)
    - grouplist
    - facebook (FUTURE)
    - twitter (FUTURE)
    - google (FUTURE)
- Groups
    - TBD
- Fantasy 
(All the data for the game are stored here. What each person has picked for each week.)
    - userID
        - 2019
            - 1
                - PlayerID
                - PlayerID
            - 2
                - PlayerID
- Players **Big question right now is if I do this or not.**
    - If I don't do this I would have to make an API or something to then go to Python and query the data as needed.
    I feel like that's going to be the way to go for this other than loading the data into another database to then manipulate it.
    Do I then mantain an active player list seperatley and try and merge the two? Or do I keep the mongo database and do everything I need for my website there?
    Not sure the best path forward.
        - Probably going to have this as a record of all the players, that way I can merge this and the nflDB to get an accurate player list