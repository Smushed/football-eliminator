## Fantasy Eliminator
THis is a game which combines daily fantasy with the challenge of a year long game. All players of this game have access to every player who is on a roster in the NFL however, they may only play each player one time.
- For example: If you were to play Tom Brady week 1, then you are unable to play Tom Brady week 2-17. You can play any other QB in that slot.
<br />
<br />
### Webpage Layout
This will be hidden behind a login system which is always running. The goal is never to make this a public app. Rather, the goal is to enjoy a style of fantasy football which we once played but is no longer available.<br />

This app is going to have two main sections. One where you sign up for groups with people that are invited to them, and a leaderboard which will show all players.
###On Login
Once a player logs in they have the option
### Features
Leaderboard of all people who are playing the game.
Groups of people who are off and playing.
Each time a player joins one group they start a new entry and are able to pick anew with that.

The players will be scored on weekly totals. How many yards and totals. For now there will be no play by play variation (no bonus points for long touchdowns or anything along those lines)

# Mongo Structure
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