### SEARCHING FOR PLAYERS
Iterating over a list of players and pulling out the QBs

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
    # print repr(players.position)
    if players.position.value == 21:  # HOW DO I DO THIS???
        stats = season_player_stats(players.full_name, 2018)
        print players.full_name
        for field in sorted(stats.fields):
            print '%s: %s' % (field, getattr(stats, field))


Player Positions & Their Enum values
To get this search by as_players() then player.position.value
To get the name, search by player.position.name
player_pos = _Enum('player_pos',
                    [
                        'C' - 1
                        'CB' - 2
                        'DB' - 3
                        'DE' - 4
                        'DL' - 5
                        'DT' - 6
                        'FB' - 7
                        'FS' - 8
                        'G' - 9
                        'ILB' - 10
                        'K' - 11
                        'LB' - 12
                        'LS' - 13
                        'MLB' - 14
                        'NT' - 15
                        'OG' - 16
                        'OL' - 17
                        'OLB' - 18
                        'OT' - 19
                        'P' - 20
                        'QB' - 21
                        'RB' - 22
                        'SAF' - 23
                        'SS' - 24
                        'T' - 25
                        'TE' - 26
                        'WR' - 27
                        'UNK' - 28
                        ])

Offensive positions - 11, 21, 22, 26, 27