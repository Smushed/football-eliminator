const initialData = {
    //Player ID must equal the playerIds array in the columns object. Without that there can be no reordering of the lists
    players: {
        'player-1': { id: 'player-1', position: `QB`, passingyds: 100 },
        'player-2': { id: 'player-2', position: `QB`, passingyds: 200 },
        'player-3': { id: 'player-3', position: `QB`, passingyds: 300 },
        'player-4': { id: 'player-4', position: `QB`, passingyds: 400 }
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'Avaliable',
            playerIds: ['player-1', 'player-2', 'player-3', 'player-4']
        },
    },
    //Able to order the columns
    columnOrder: ['column-1'],
};

export default initialData;