from pymongo import MongoClient

from pprint import pprint

import nfldb

db = nfldb.connect()
search = nfldb.Query(db)

client = MongoClient('localhost', 27017)
mongo = client.fantasyEliminator
collection = mongo.players

# test1 = {
#     "name": "Kevin",
#     "something": "yup",
#     "age": 28
# }

# collection.insert_one(test1)

# finder = collection.find()

# for record in finder:
#     pprint(record)

# -----------------


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


weeknum = 2

search.game(season_year=2018, season_type='Regular', week=weeknum)

for player in search.as_players():
    # foundplayer = collection.find_one({"player_id": player.player_id})
    stats = season_player_stats(player.player_id, 2018, 1)

    # if foundplayer:
    #     weekstats = {}
    #     for field in sorted(stats.fields):
    #         weekstats[field] = getattr(stats, field)
    #     collection.update_one(
    #         {"player_id": player.player_id},
    #         {
    #             "$set": {
    #                 "2018": {
    #                     "2": weekstats
    #                 }
    #             }
    #         }
    #     )
    # else:
    currentplayer = {}
    if player.position.value == 21 or player.position.value == 11 or player.position.value == 22 or player.position.value == 26 or player.position.value == 27:
        currentplayer = {
            "full_name": player.full_name,
            "player_id": player.player_id,
            "player_position": player.position.name,
            "team": player.team,
            "2018": {
                "1": {}
            }
        }
        pprint(currentplayer)
        for field in sorted(stats.fields):
            currentplayer["2018"]["1"][field] = getattr(stats, field)
        collection.insert_one(currentplayer)
