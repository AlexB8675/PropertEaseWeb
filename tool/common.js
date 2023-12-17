function isRoom(color) {
    return color !== 'rgba(0, 0, 0, 0)' &&
           color !== 'rgb(240, 248, 255)' &&   // Window
           color !== 'rgb(105, 105, 105)' &&   // DoorL
           color !== 'rgb(0, 0, 0)';           // Wall
}
