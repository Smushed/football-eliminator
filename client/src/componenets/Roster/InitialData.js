const initialData = {
    //Player ID must equal the playerIds array in the columns object. Without that there can be no reordering of the lists
    userRoster: {
        7549: { full_name: 'Tom Brady', mySportsId: 7549, position: 'QB', team: 'NE' },
        8102: { full_name: "Le'Veon Bell", mySportsId: 8102, position: 'RB', team: 'NYJ' },
        5940: { full_name: 'David Johnson', mySportsId: 5940, position: 'RB', team: 'ARI' },
        5946: { full_name: 'Larry Fitzgerald', mySportsId: 5946, position: 'WR', team: 'ARI' },
        6477: { full_name: 'A.J. Green', mySportsId: 6477, position: 'WR', team: 'CIN' },
        9910: { full_name: 'Tyreek Hill', mySportsId: 9910, position: 'WR', team: 'KC' },
        7485: { full_name: 'Kyle Rudolph', mySportsId: 7485, position: 'TE', team: 'NE' },
        8003: { full_name: 'Sebastian Janikowski', mySportsId: 8003, position: 'K', team: 'SEA' }
    },
    columns: {
        'userRoster': {
            id: 'userRoster',
            title: 'On Roster',
            playerIds: [7549, 8102, 5940, 5946, 6477, 9910, 7485, 8003] //These have the be the same as the keys above & the same as the mySportsId
        },
        'available': {
            id: 'available',
            title: 'Avaliable',
            playerIds: []
        },
    },
    //Able to order the columns
    columnOrder: ['userRoster', 'available'],
};

export default initialData;

//Roster Data: {
// userRoster: {
//     QB: #,
//     WR1: #,
//     WR2: #,
//     RB1: #,
//     RB2: #,
//     FLEX: #,
//     TE: #,
//     K: #
//  },
//  columns: {
//     'userRoster': {
//         id: 'userRoster',
//             title: 'Current Roster',
//                 playerIds: {
            //     QB: #,
            //     WR1: #,
            //     WR2: #,
            //     RB1: #,
            //     RB2: #,
            //     FLEX: #,
            //     TE: #,
            //     K: #
        // }
//     }, 'availablePlayers': {
//         QB: [],
//         WR: [],
//         RB: [],
//         TE: [],
//         K: []
//     }
//  },
//  columnOrder: ['userRoster', 'availablePlayers']
//}