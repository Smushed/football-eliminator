# Player Data
Player Data is where I'm going to be storing generic information about each player. From their name, to if they're still playing

PlayerDataSchema =
    N - full_name: String
    M - mySportsId: Number
    T - team: String
    P - position: String
    A - active: Boolean
    R - rank: Number


# Player Stats
Where each player's stats will be held. Each player will have an entry for each week

PlayerStatsSchema =
    M - mySportsId: Number
    W - week: Number
    S - season: String
    P - passing:
            T - passTD: Number
            Y- passYards: Number
            I - passInt: Number
            A - passAttempts: Number
            C - passCompletions: Number
            2P - twoPtPassMade: Number
    RU - rushing:
            A - rushAttempts: Number
            Y - rushYards: Number
            T - rushTD: Number
            20 - rush20Plus: Number
            40 - rush40Plus: Number
            F - rushFumbles: Number
            2P - twoPtRushMade: Number
    RE - receiving:
            TA - targets: Number
            R - receptions: Number
            Y - recYards: Number
            T - recTD: Number
            20 - rec20Plus: Number
            40 - rec40Plus: Number
            F - recFumbles: Number
            2P - twoPtRecMade: Number
    F - fumbles: Number
    FG - fieldGoals:
            1 - fgMade1_19: Number
            20 - fgMade20_29: Number
            30 - fgMade30_39: Number
            40 - fgMade40_49: Number
            50 - fgMade50Plus: Number
            X - extraPointMade: Number
     D - Defense
            Sack 


# Group / Roster Info
The Roster is customizable for each group. They should be able to set the players that they want to play each and every week.
They should be able to choose between

Different Positions to choose from. This is in the constant folder
        1 - QB
        2 - RB
        3 - WR
        4 - TE
        5 - K
        6 - D
        7 - RB/WR
        8 - Flex (RB/WR/TE)
        9 - Super Flex (QB/RB/WR/TE)
