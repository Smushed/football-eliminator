import nfldb

db = nfldb.connect()
q = nfldb.Query(db)

weeknum = 1

# Start here - https://pynative.com/python-postgresql-tutorial/

q.game(season_year=2018, season_type='Regular')
q.player()

for player in q.sort('passing_yds').limit(1).as_aggregate():
    print player

    # topQB = game.players.sort('passing_yds').limit(1)
    # print topQB


# for weeknum in range(17):
#     player = q.sort('passing_yds').limit(1).as_aggregate()
#     topplayers.append(player[0].player)
#     weeknum = weeknum + 1

# for pp in q.sort('passing_yds').limit(10).as_aggregate():
#     print pp.player, pp.passing_yds
