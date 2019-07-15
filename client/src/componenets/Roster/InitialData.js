const initialData = {
    //Player ID must equal the playerIds array in the columns object. Without that there can be no reordering of the lists
    userRoster: {
        1: { id: 1, position: `QB`, passingyds: 100 },
        2: { id: 2, position: `QB`, passingyds: 200 },
        3: { id: 3, position: `QB`, passingyds: 300 },
        4: { id: 4, position: `QB`, passingyds: 400 }
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'On Roster',
            playerIds: [1, 2, 3, 4]
        },
        'column-2': {
            id: 'column-2',
            title: 'Avaliable',
            playerIds: []
        },
    },
    //Able to order the columns
    columnOrder: ['column-1', 'column-2'],
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