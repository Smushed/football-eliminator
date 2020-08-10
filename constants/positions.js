module.exports = {
    rosterPositions:
        [
            { index: 0, description: `QB` },
            { index: 1, description: `RB` },
            { index: 2, description: `WR` },
            { index: 3, description: `TE` },
            { index: 4, description: `K` },
            { index: 5, description: `D` },
            { index: 6, description: `RB/WR` },
            { index: 7, description: `Flex (RB/WR/TE)` },
            { index: 8, description: `Super Flex (QB/RB/WR/TE)` },
        ],
    orderOf: [0, 1, 2, 8, 6, 7, 3, 4, 5],
    positionMap: [[0], [1], [2], [3], [4], [5], [1, 2], [1, 2, 3], [0, 1, 2, 3]],
    orderOfDescription: [`QB`, `RB`, `WR`, `Super Flex`, `RB/WR`, `Flex`, `TE`, `K`, `D`],
    offense: [`QB`, `RB`, `WR`, `TE`, `K`],
}