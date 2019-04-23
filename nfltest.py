import nflgame

game = nflgame.one(2018, 1, "GB", "CHI")

trubisky = game.players.name("M.Trubisky")
print trubisky, "\n", trubisky.formatted_stats()
