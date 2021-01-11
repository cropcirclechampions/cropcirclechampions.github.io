var tileConfig = [
    {
        tileNum: '00',
        startTile: true,        
        connections: [false, true, true, true, true, true],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '01',
        startTile: false,        
        connections: [false, false, false, false, false, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '02',
        startTile: false,        
        connections: [false, true, false, false, false, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '03',
        startTile: false,        
        connections: [false, true, false, false, true, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '04',
        startTile: false,        
        connections: [false, true, false, true, false, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '05',
        startTile: false,        
        connections: [false, false, false, true, true, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '06',
        startTile: false,        
        connections: [false, true, true, true, false, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '07',
        startTile: false,        
        connections: [false, true, false, true, true, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '08',
        startTile: false,        
        connections: [false, true, true, true, true, false],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '09',
        startTile: false,        
        connections: [true, true, false, true, true, false],
        rotation: 0 // increments of 60
    }
]

var tileConnections = [
    [false, true, true, true, true, true],
    [false, false, false, false, false, false],
    [false, true, false, false, false, false],
    [false, true, false, false, true, false],
    [false, true, false, true, false, false],
    [false, false, false, true, true, false],
    [false, true, true, true, false, false],
    [false, true, false, true, true, false],
    [false, true, true, true, true, false],
    [true, true, false, true, true, false]
];