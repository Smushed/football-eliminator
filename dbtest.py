import nfldb

db = nfldb.connect()
q = nfldb.Query(db)

# https://github.com/BurntSushi/nfldb/wiki/Aggregate-searching
# Start here - https://pynative.com/python-postgresql-tutorial/

weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

q.game(season_year=2018, season_type='Regular')
for pp in q.sort('rushing_yds').limit(5).as_aggregate():
    print pp.player, pp.rushing_yds


# q.game(season_year=2018, season_type='Regular')
# q.player()

# for player in q.sort('passing_yds').limit(1).as_aggregate():
#     print player

    # topQB = game.players.sort('passing_yds').limit(1)
    # print topQB


# for weeknum in range(17):
#     player = q.sort('passing_yds').limit(1).as_aggregate()
#     topplayers.append(player[0].player)
#     weeknum = weeknum + 1

# for pp in q.sort('passing_yds').limit(10).as_aggregate():
#     print pp.player, pp.passing_yds
