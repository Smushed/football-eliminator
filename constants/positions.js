module.exports = {
    rosterPositions:
        [
            { I: 0, N: `QB` },
            { I: 1, N: `RB` },
            { I: 2, N: `WR` },
            { I: 3, N: `TE` },
            { I: 4, N: `K` },
            // { I: 5, N: `D` },
            { I: 5, N: `RB/WR` },
            { I: 6, N: `Flex (RB/WR/TE)` },
            { I: 7, N: `Super Flex (QB/RB/WR/TE)` },
        ],
    orderOf: [0, 1, 2, 8, 6, 7, 3, 4, 5],
    positionMap: [[0], [1], [2], [3], [4], [1, 2], [1, 2, 3], [0, 1, 2, 3]],
    maxOfPosition: [3, 5, 5, 3, 3],
    orderOfDescription: [`QB`, `RB`, `WR`, `Super Flex`, `RB/WR`, `Flex`, `TE`, `K`, `D`],
    positionArray: [`QB`, `RB`, `WR`, `TE`, `K`],
}