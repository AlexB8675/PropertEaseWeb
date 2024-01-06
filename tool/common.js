const ROWS = 50;
const COLS = 50;

function isRoom(color) {
    return color !== 'rgba(0, 0, 0, 0)' &&
           color !== 'rgb(240, 248, 255)' &&   // Window
           color !== 'rgb(105, 105, 105)' &&   // DoorL
           color !== 'rgb(0, 0, 0)';           // Wall
}

// Prevent the function to be calle dif the hovered room is the same
function changeCellColor(previewCells) {
    let lastColor = null;
    return function () {
        if (!lastColor) {
            lastColor = $(this).css("background-color");
        }
        const color = $(this).css("background-color");
        if (lastColor !== color) {
            previewCells.removeClass('hovered-cell');
        }
        if (isRoom(color)) {
            previewCells
                .filter(function () {
                    return $(this).css("background-color") === color;
                })
                .addClass('hovered-cell');
            lastColor = $(this).css("background-color");
        }
    }
}

function showLoader() {
    $('.loader').css('opacity', 1);
}

function hideLoader() {
    setTimeout(function () {
        $('.loader').css('opacity', 0);
    }, 1);
}
