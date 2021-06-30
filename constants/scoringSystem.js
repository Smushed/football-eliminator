module.exports = {
    buckets: [`P`, `RU`, `RE`, `F`, `FG`],
    P: [`T`, `Y`, `I`, `A`, `C`, `2P`],
    RU: [`A`, `Y`, `T`, `20`, `40`, `F`, `2P`,],
    RE: [`TA`, `R`, `Y`, `T`, `20`, `40`, `F`, `2P`],
    F: [`F`],
    FG: [`1`, `20`, `30`, `40`, `50`, `X`],
    bucketDescription: [`Passing`, `Rushing`, `Receiving`, `Fumbles Lost`, `Field Goals`],
    PDescription: [`Pass TD`, `Yards`, `Interceptions`, `Attempts`, `Completion`, `Two Point Pass`],
    RUDescription: [`Attempts`, `Rush Yards`, `Rush TD`, `20+ Yard Rush`, `40+ Yard Rush`, `Rushing Fumbles`, `Two Point Rush`],
    REDescription: [`Target`, `Receptions`, `Receiving Yards`, `Receiving TD`, `20+ Yard Reception`, `40+ Yard Reception`, `Receving Fumble`, `Two Point Reception`],
    FDescription: [`Fumble`],
    FGDescription: [`1-19 Yard Field Goal`, `20-29 Yard Field Goal`, `30-39 Yard Field Goal`, `40-49 Yard Field Goal`, `50+ Yard Field Goal`, `Extra Point Made`],
    defaultScores: {
        P: {
            T: 4,
            Y: 0.04,
            I: -2,
            A: 0,
            C: 0,
            '2P': 2,
        },
        RU: {
            A: 0,
            Y: 0.1,
            T: 6,
            '20': 0,
            '40': 0,
            'F': -2,
            '2P': 2,
        },
        RE: {
            TA: 0,
            R: 0,
            Y: 0.1,
            T: 6,
            '20': 0,
            '40': 0,
            F: -2,
            '2P': 0
        },
        F: {
            F: - 2
        },
        FG: {
            '1': 2,
            '20': 2,
            '30': 2,
            '40': 3,
            '50': 5,
            'X': 1,
        }
    },
    groupScoreBucketMap: {
        P: `Passing`,
        RU: `Rushing`,
        RE: `Receiving`,
        FG: `Field Goal`,
        F: `Fumble`
    },
    groupScoreMap: {
        P: {
            T: `Touchdown`,
            Y: `Pass Yards`,
            I: `Interceptions`,
            A: `Attempts`,
            C: `Completions`,
            '2P': `2PT Pass Success`
        },
        RU: {
            A: `Attempts`,
            Y: `Rush Yards`,
            T: `Rush TD`,
            '20': `20-39 Rush`,
            '40': `40+ Rush`,
            'F': `Fumbles`,
            '2P': `2PT Rush Success`
        },
        RE: {
            TA: `Targets`,
            R: `Receptions`,
            Y: `Rec Yards`,
            T: `Rec TD`,
            '20': `20-39 Rec`,
            '40': `40+ Rec`,
            F: `Rec Fumble`,
            '2P': `2PT Rec Success`,
        },
        F: {
            F: `Fumble`
        },
        FG: {
            1: `1-19 Yard FG`,
            20: `20-29 Yard FG`,
            30: `30-39 Yard FG`,
            40: `40-49 Yard FG`,
            50: `50+ Yard FG`,
            'X': `Extra Point`,
        }
    }
}