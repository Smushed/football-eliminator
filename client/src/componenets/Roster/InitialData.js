const initialData = {
    //Player ID must equal the playerIds array in the columns object. Without that there can be no reordering of the lists
    userRoster: {
        1: { full_name: 'Loading', mySportsId: 1, position: 'QB', team: 'NE' },
    },
    columns: {
        'userRoster': {
            id: 'userRoster',
            title: 'On Roster',
            playerIds: [1] //These have the be the same as the keys above & the same as the mySportsId
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