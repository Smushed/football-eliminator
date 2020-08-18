module.exports = {
    rosterPositions:
        [
            { I: 0, N: `QB` },
            { I: 1, N: `RB` },
            { I: 2, N: `WR` },
            { I: 3, N: `TE` },
            { I: 4, N: `K` },
            { I: 5, N: `D` },
            { I: 6, N: `RB/WR` },
            { I: 7, N: `Flex (RB/WR/TE)` },
            { I: 8, N: `Super Flex (QB/RB/WR/TE)` },
        ],
    orderOf: [0, 1, 2, 8, 6, 7, 3, 4, 5],
    positionMap: [[0], [1], [2], [3], [4], [5], [1, 2], [1, 2, 3], [0, 1, 2, 3]],
    orderOfDescription: [`QB`, `RB`, `WR`, `Super Flex`, `RB/WR`, `Flex`, `TE`, `K`, `D`],
    positionArray: [`QB`, `RB`, `WR`, `TE`, `K`],
}