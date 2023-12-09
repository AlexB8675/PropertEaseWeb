function parseHousePlan(plan) {
    const rows = 50;
    const columns = 50;
    let output = {
        plan: [],
        rooms: [],
        images: []
    };
    for (let i = 0; i < rows; i++) {
        const values = plan[i].split(',');
        values.pop();
        for (let j = 0; j < columns; j++) {
            output.plan[i * columns + j] = values[j];
        }
    }

    // parse rooms
    const rooms = plan[rows].split(';');
    rooms.pop();
    for (const room of rooms) {
        const values = room.split(',');
        output.rooms.push(parseInt(values[0], 10));
    }

    // parse images
    const images = plan[rows + 1].split(';')[0].split(',');
    for (const image of images) {
        output.images.push(parseInt(image, 10));
    }
    return output;
}

const HOUSE_PLAN_CELL_COLORS = [
    'transparent',
    'darkred',
    'red',
    'crimson',
    'mediumvioletred',
    'lightcoral',
    'violet',
    'darkorchid',
    'indigo',
    'darkslateblue',
    'tomato',
    'darkorange',
    'orange',
    'gold',
    'yellow',
    'chartreuse',
    'lime',
    'springgreen',
    'mediumspringgreen',
    'teal',
    'darkolivegreen',
    'darkgreen',
    'green',
    'blue',
    'royalblue',
    'steelblue',
    'mediumaquamarine',
    'darkkhaki',
    'peru',
    'chocolate',
    'saddlebrown',
    'black',
    'aliceblue',
    'darkgray',
    'dimgray',
];

module.exports = {
    parseHousePlan,
    HOUSE_PLAN_CELL_COLORS,
};
