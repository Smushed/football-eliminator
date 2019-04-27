import nfldb

from pymongo import MongoClient

from pprint import pprint

db = nfldb.connect()
search = nfldb.Query(db)

client = MongoClient('localhost', 27017)
mongo = client.fantasyEliminator
collection = mongo.players

error = collection.find_one({"player_id": "8"})
correct = collection.find_one({"player_id": "00-0032569"})

pprint(error)
pprint(correct)

if collection.find_one({"player_id": "8"}):
    print("what")
else:
    print("not")

# https://github.com/BurntSushi/nfldb/wiki/Aggregate-searching
# Start here - https://pynative.com/python-postgresql-tutorial/
# https://github.com/BurntSushi/nfldb/issues/35

weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

# q.game(season_year=2018, season_type='Regular', week=1, team="CHI")
# for players in q.as_players():
#     print players


def season_player_stats(player_id, season, weeknum):
    q = nfldb.Query(db)

    q.game(season_year=season, season_type='Regular', week=weeknum)
    q.player(player_id=player_id)
    pps = q.as_aggregate()

    assert len(pps) < 2, "Make sure only one player was aggregated"
    if len(pps) == 0:  # No players found to aggregate
        return None
    return pps[0]


# START HERE
# Iterate through the games, grab the players for each week
# Store how the players did in mongo each week


# search.game(season_year=2018, season_type='Regular', week=1)
# for player in search.as_players():
#     if player.position.value == 21 or player.position.value == 11 or player.position.value == 22 or player.position.value == 26 or player.position.value == 27:
#         stats = season_player_stats(player.player_id, 2018, 1)
#         print player.full_name, player.team, player.position
#         for field in sorted(stats.fields):
#             print '%s: %s' % (field, getattr(stats, field))
#         print "\n"
# for player in search.as_players():
#     print game.full_name, game.player_id


# search.game(season_year=2018, season_type='Regular', week=2)
# print len(search.as_players())

# for week in len(1):
#     stats = season_player_stats(2018, 1)
#     print players.full_name
#     for field in sorted(stats.fields):
#         print '%s: %s' % (field, getattr(stats, field))

# if players.position.value == 22:  # HOW DO I DO THIS???
#     stats = season_player_stats(players.full_name, 2018, 1)
#     print players.full_name
#     for field in sorted(stats.fields):
#         print '%s: %s' % (field, getattr(stats, field))
#     print '\n'


# stats = season_player_stats('Mitchell Trubisky', 2018)
# for field in sorted(stats.fields):
#     print '%s: %s' % (field, getattr(stats, field))
