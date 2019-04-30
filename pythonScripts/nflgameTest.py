import nflgame

from pymongo import MongoClient

from pprint import pprint

client = MongoClient('localhost', 27017)
mongo = client.fantasyEliminator
collection = mongo.players

# --------------

# games = nflgame.games(2018, week=17)
# players = nflgame.combine_game_stats(games)
# for p in players:
#     msg = '%s %s %s %d'
#     print msg % (p, p.team, p.playerid)

pprint(collection.find())
