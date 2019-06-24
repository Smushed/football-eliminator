const initialData = {
    players: {
        'player-1': { id: 1, position: `QB`, passingyds: 100 },
        'player-2': { id: 2, position: `QB`, passingyds: 200 },
        'player-3': { id: 3, position: `QB`, passingyds: 300 },
        'player-4': { id: 4, position: `QB`, passingyds: 400 }
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