import nfldb

db = nfldb.connect()
search = nfldb.Query(db)

# https://github.com/BurntSushi/nfldb/wiki/Aggregate-searching
# Start here - https://pynative.com/python-postgresql-tutorial/
# https://github.com/BurntSushi/nfldb/issues/35

# weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

# q.game(season_year=2018, season_type='Regular', week=1, team="CHI")
# for players in q.as_players():
#     print players


def season_player_stats(full_name, season):
    q = nfldb.Query(db)

    q.game(season_year=season, season_type='Regular')
    q.player(full_name=full_name)
    pps = q.as_aggregate()

    assert len(pps) < 2, "Make sure only one player was aggregated"
    if len(pps) == 0:  # No players found to aggregate
        return None
    return pps[0]


search.game(season_year=2018, season_type='Regular', week=1, team="CHI")
for players in search.as_players():
    print players.full_name, players.position
    if players.position == 'TE':  # HOW DO I DO THIS???
        stats = season_player_stats(players.full_name, 2018)
        print players.full_name
        for field in sorted(stats.fields):
            print '%s: %s' % (field, getattr(stats, field))


# stats = season_player_stats('Mitchell Trubisky', 2018)
# for field in sorted(stats.fields):
#     print '%s: %s' % (field, getattr(stats, field))
