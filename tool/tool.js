// Define the number of rows and columns
const ROWS = 50;
const COLS = 50;

class HousePlan {
    constructor() {
        this.data = [];
        this.rooms = [];
        this.images = [];
        this.indices = [];
        this.info = {};
    }

    toJSON() {
        return {
            data: this.data,
            rooms: this.rooms,
            images: this.images,
            indices: this.indices,
            info: this.info,
        };
    }
}

$(document).ready(function () {
    $(document).on('keydown', function (e) {
        const keyCode = e.keyCode;

        // Get all the cell elements
        const cells = $('.cell');
        const previewCells = $('.prev-cell');

        // Calculate the total number of cells
        const totalCells = ROWS * COLS;

        function getIndex(row, col) {
            return row * COLS + col;
        }

        function getRowCol(index) {
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            return { row, col };
        }

        function getCellProperties(cellArray) {
            return cellArray.map(function () {
                return {
                    dataValue: $(this).attr('data-value'),
                    backgroundColor: $(this).css('background-color'),
                    backgroundImage: $(this).css('background-image')
                };
            }).get();
        }

        function arePropertiesEqual(properties1, properties2) {
            return (
                properties1.dataValue === properties2.dataValue &&
                properties1.backgroundColor === properties2.backgroundColor &&
                properties1.backgroundImage === properties2.backgroundImage
            );
        }

        function shiftCells(direction) {
            // Create arrays of cell properties for the cells
            const cellProperties = getCellProperties(cells);

            // Shift the cells based on the direction
            const changes = [];
            for (let i = 0; i < totalCells; i++) {
                const currentCell = getRowCol(i);
                const currentImage = $('body').children(`input[data-id="${i + 1}"]`);

                let newRow = currentCell.row;
                let newCol = currentCell.col;

                switch (direction) {
                    case 'up':
                        newRow = (newRow + 1) % ROWS;
                        break;
                    case 'down':
                        newRow = (newRow - 1 + ROWS) % ROWS;
                        break;
                    case 'left':
                        newCol = (newCol + 1) % COLS;
                        break;
                    case 'right':
                        newCol = (newCol - 1 + COLS) % COLS;
                        break;
                }

                const newIndex = newRow * COLS + newCol;
                const targetCells = $(cells[i]).add(previewCells[i]);
                const targetProperties = cellProperties[newIndex];

                if (currentImage.length > 0) {
                    changes.push({ currentImage, newIndex });
                }

                // Check if the current properties are different from the target properties
                if (!arePropertiesEqual(cellProperties[i], targetProperties)) {
                    targetCells.attr('data-value', targetProperties.dataValue)
                        .css({
                            'background-color': targetProperties.backgroundColor,
                            'background-image': targetProperties.backgroundImage
                        });
                }
            }
            for (const { currentImage, newIndex } of changes) {
                currentImage.attr('data-id', newIndex + 1);
            }
        }

        switch (keyCode) {
            case 37: // Left arrow key
                e.preventDefault();
                shiftCells('left');
                break;
            case 38: // Up arrow key
                e.preventDefault();
                shiftCells('up');
                break;
            case 39: // Right arrow key
                e.preventDefault();
                shiftCells('right');
                break;
            case 40: // Down arrow key
                e.preventDefault();
                shiftCells('down');
                break;
        }
    });

    const gridContainer = $('#grid-container');
    const prev = $('#preview');

    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = $('<div>').addClass('cell').attr('data-value', '0');
        gridContainer.append(cell);
    }
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = $('<div>').addClass('prev-cell').attr('data-value', '0');
        prev.append(cell);
    }

    let cell = $('.cell')
    let color_selector = $('#color-selector');
    let data = 0
    let isLeftMousePressed = false;
    let isRightMousePressed = false;
    let mouseDiv = $('#room-name');
    let tools = [
        { value: "33", icon: "fa-border-all", color: 'black', specialBehavior: null, selected: false },  // Wall
        { value: "35", icon: "fa-door-closed", color: 'dimgray', specialBehavior: null, selected: false },  // Door
        { value: "32", icon: "fa-trowel-bricks", color: 'aliceblue', specialBehavior: null, selected: false }, // Window
        { value: "fill_bucket", icon: "fa-fill-drip", color: '#363636', specialBehavior: "fill", selected: false }, // Fill Bucket
        { value: "image_upload", icon: "fa-camera", color: '#363636', specialBehavior: "camera", selected: false } // Image Upload
    ];

    $('.prev-cell').on('mousemove', function (e) {
        let mouseX = e.pageX - mouseDiv.outerWidth();
        let mouseY = e.pageY - mouseDiv.outerHeight();
        mouseDiv.css("left", mouseX);
        mouseDiv.css("top", mouseY);

        const roomName = $('#room-name');
        // Get the color of the hovered cell
        let hoveredColor = $(this).css("background-color");

        if (isRoom(hoveredColor)) {
            // Find the room label with the corresponding background color
            let correspondingRoomLabel = $('#room-labels .room-label label[data-value]').filter(function () {
                return $(this).css("background-color") === hoveredColor;
            });

            // Get the text of the room label
            let roomLabelText = correspondingRoomLabel.closest('.room-label').find('input[type="text"]').val();

            roomName.empty();
            // Set the room name content
            roomName.text(roomLabelText);
            let squareCount = $('.prev-cell').filter(function () {
                return $(this).css("background-color") === hoveredColor;
            }).length;
            roomName.append(`<div> sqm: ${squareCount / 4}<\div>`);
            // Show the room name
            roomName.show();
        } else {
            // Hide the room name if the color is transparent
            roomName.hide();
        }
    });

    prev.on('mouseleave', function () {
        $('#room-name').hide();
    });

    cell.on('mousedown', function (event) {
        switch (event.which) {
            case 1:
                isLeftMousePressed = true;
                break;
            case 2:
                event.preventDefault();
                $("#selected-color")
                    .css('background-color', $(this).css('background-color'))
                    .attr('data-value', $(this).attr('data-value'));
                data = $(this).data();
                break;
            case 3:
                isRightMousePressed = true;
                break;
        }
    });

    $(document).on('mouseup', function (event) {
        switch (event.which) {
            case 1:
                isLeftMousePressed = false;
                break;
            case 2:
                break;
            case 3:
                isRightMousePressed = false;
                break;
        }
    });

    cell.on('mouseover mousedown', function () {
        if (!tools[3].selected && !tools[4].selected) {
            if (isLeftMousePressed) {
                $(this).css("background-color", getColor(data))
                    .attr("data-value", data.value);
                $(`#preview > div:nth-child(${$(this).index() + 2})`)
                    .css("background-color", getColor(data));
            } else if (isRightMousePressed) {
                $(this).css({ "background-color": "transparent", "background-image": "" })
                    .removeClass('picture-container')
                    .attr("data-value", 0);
                $(`#preview > div:nth-child(${$(this).index() + 2})`)
                    .css({ 'background-color': 'transparent', 'background-image': '' })
                    .removeClass('picture-container');
                $('body')
                    .children(`input[data-id="${$(this).index() + 1}"]`)
                    .remove();
            }
        }
    });

    cell.on('click', function () {
        // Check if the Image Upload tool is selected
        if (tools[4].selected) {
            const clickedCell = $(this);
            clickedCell.css('background-image', `url('camera.svg')`);
            const input = makeImageInput(clickedCell);
            input.click();
        }

        // Check if the Fill Bucket tool is selected
        if (tools[3].selected) {
            const index = $(this).index();
            const x = index % COLS;
            const y = Math.floor(index / COLS);
            fillBucket(x, y);
        }
    });

    function resetToolWindow(pred) {
        // Reset all tools to default color and unselect them
        const toolSelector = $(`#tool-window button i`);
        for (const [index, tool] of tools.entries()) {
            if (pred && !pred(tool)) {
                continue;
            }
            $(toolSelector[index]).css('color', '#363636');
            tool.selected = false;
        }
    }

    color_selector.children().on('click', function () {
        data = $(this).data();
        resetToolWindow((tool) => {
            return tool.specialBehavior === null;
        });
        $('#selected-color')
            .css('background-color', $(this).css('background-color'))
            .attr('data-value', $(this).data('value'));
    });

    $('#tool-window').children().on('click', function () {
        const selectedIndex = $(this).index();
        const selectedColor = $('#selected-color');

        // Reset all tools to default color and unselect them
        const previousIsSelected = tools[selectedIndex].selected;
        resetToolWindow();
        if (previousIsSelected && tools[selectedIndex].specialBehavior !== null) {
            return;
        }

        // Set the tool as selected
        $(this).children().css('color', 'aliceblue');
        tools[selectedIndex].selected = true;

        // Change the color based on the index
        if (!tools[3].selected && !tools[4].selected) {
            selectedColor.css('background-color', tools[selectedIndex].color);
            data = $(this).data();
        }
    });

    $('#upload_button').on('change', function () {
        upload_plan($(this)[0].files[0]);
    });

    $(".prev-cell").on('mouseover', function () {
        const color = $(this).css("background-color");
        $(".prev-cell").removeClass('hovered-cell');
        if (isRoom(color)) {
            const cells_toChange = $('.prev-cell[style*="background-color: ' + color + '"]');
            cells_toChange.addClass('hovered-cell');
        }
    });

    setupHouseSubmitForm();

    function fillBucket(x, y) {
        const stack = [{ x: x, y: y }];
        const cells = $(`.cell`);
        const previewCells = $(`.prev-cell`);
        const targetColor = $('#selected-color').attr('data-value');
        const replacementColor = $(cells[x + y * COLS]).attr('data-value');
        while (stack.length !== 0) {
            const { x, y } = stack.pop();
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
                continue;
            }
            const cell = $(cells[x + y * COLS]);
            const previewCell = $(previewCells[x + y * COLS]);
            const cellColor = cell.attr('data-value');
            if (cellColor === targetColor || cellColor !== replacementColor) {
                continue;
            }

            cell
                .css('background-color', getColor(targetColor))
                .attr('data-value', targetColor);
            previewCell
                .css('background-color', getColor(targetColor))
                .attr('data-value', targetColor);
            stack.push({ x: x - 1, y: y });
            stack.push({ x: x + 1, y: y });
            stack.push({ x: x, y: y - 1 });
            stack.push({ x: x, y: y + 1 });
        }
    }
});

function setupHouseSubmitForm() {
    $.ajax({
        url: makeEndpointWith('/api/data/types'),
        method: 'get',
        dataType: 'json'
    }).done((response) => {
        for (const each of response) {
            $('#house-form-house').append(`<option value="${each.name}">${each.name}</option>`);
        }
    });
    $('#submit-house-main-image').on('click', function (event) {
        event.preventDefault();
        const input = makeButtonImageInput();
        input.trigger('click');
    });
    $('#submit-house-form').on('submit', async function (event) {
        event.preventDefault();
        if (!check_download()) {
            return;
        }

        const result = await makeHousePlanData();
        const form = $(this);
        $.ajax({
            url: makeEndpointWith('/api/data/tool/upload'),
            type: 'post',
            data: JSON.stringify(result),
            processData: false,
            contentType: 'application/json'
        }).done(_ => {
            form
                .find('input, select, textarea')
                .val(String());
            form
                .find('button')
                .css({
                    'background-image': '',
                });
            clearGrid();
        }).fail((error) => {
            console.error(error);
        });
    });
}

function makeImageInput(cell) {
    const body = $('body');
    const previewCell = $(`#preview > div:nth-child(${cell.index() + 2})`);
    const previousInput = body.find(`input[data-id="${cell.index() + 1}"]`);
    if (previousInput.length > 0) {
        previousInput.remove();
    }

    // Backup image
    cell.css('background-image', `url('camera.svg')`);
    // Create an input element
    const input = $('<input class="main-input-image" type="file" style="display: none">');
    input.on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                cell.css('background-image', `url(${e.target.result})`);
                previewCell.addClass('picture-container')
                    .css('background-image', `url(${e.target.result})`)
                    .on('mousedown', function () {
                        $(this).toggleClass('shown-picture');
                        if ($(this).hasClass('shown-picture')) {
                            const img = new Image();
                            img.src = $(this).css('background-image').replace('url("', '').replace('")', '');
                            const bgImgWidth = img.width;
                            const bgImgHeight = img.height;
                            $(this).css('padding-top', `${bgImgHeight / bgImgWidth * 80}%`);
                        } else {
                            $(this).css('padding-top', '');
                        }
                    });
            };
            reader.readAsDataURL(file);
            input.attr('data-id', cell.index() + 1);
            body.append(input);
        }
    });
    return input;
}

function makeButtonImageInput() {
    return $('<input class="main-input-image" type="file" accept="image/*" style="display: none">')
        .on('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    $('#submit-house-main-image').css({
                        'background-image': `url(${event.target.result})`,
                    });
                };
                reader.readAsDataURL(file);

                $(this).attr('data-id', 0);
                const body = $('body');
                const previous = body.children('input[data-id="0"]');
                if (previous.length > 0) {
                    previous.remove();
                }
                body.append($(this));
            }
        });
}

async function makeHousePlanData() {
    const result = new HousePlan();
    $('.cell')
        .each(function () {
            result.data.push(parseInt($(this).attr('data-value'), 10));
        });
    $('#room-labels label[data-value]')
        .each(function () {
            const value = $(this).attr('data-value');
            const roomLabelText = $(this)
                .closest('.room-label')
                .find('input[type="text"]')
                .val()
                .trim();
            result.rooms.push({
                label: roomLabelText,
                value: parseInt(value, 10),
            });
        });
    const images = new Map();
    $('body')
        .children('input.main-input-image')
        .each(function () {
            const id = parseInt($(this).attr('data-id'), 10);
            const file = this.files[0];
            if (images.has(file.name)) {
                images
                    .get(file.name)
                    .indices
                    .push(id);
            } else {
                images.set(file.name, {
                    file: file,
                    indices: [id],
                });
            }
        });
    for (const [_, { file, indices }] of images.entries()) {
        const currentId = result.images.length;
        result.images.push({
            name: file.name,
            lastModified: file.lastModified,
            type: file.type,
            size: file.size,
            data: await readFileSync(file),
        });
        for (const index of indices) {
            result.indices.push({
                cellId: index,
                imageId: currentId,
            });
        }
    }

    const maybeParseInt = (value) => {
        if (value.attr('type') === 'number') {
            return parseInt(value.val(), 10);
        }
        if (value.is('select')) {
            const option = value.children('option:selected');
            const data = parseInt(option.attr('value').trim(), 10);
            if (isNaN(data)) {
                return option.text().trim();
            }
            return data;
        }
        return value.val().trim();
    }
    const formEntries = $('#submit-house-info').find('.entry');
    const labelInfo = formEntries.find('label');
    const inputInfo = formEntries.find('input, select');
    if (labelInfo.length !== inputInfo.length) {
        console.error('entry label and input length mismatch');
        return;
    }
    for (let i = 0; i < labelInfo.length; i++) {
        const label = $(labelInfo[i])
            .attr('for')
            .replace('house-form-', '')
            .replace('-', '_');
        result.info[label] = maybeParseInt($(inputInfo[i]));
    }
    result.info['description'] = $('#house-form-description').val().trim();
    return result.toJSON();
}

async function readFileSync(file) {
    return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            return resolve(event.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function getColor(data) {
    const dataIndex = (typeof data === 'object') ? data.value : parseInt(data, 10);
    return (isNaN(dataIndex) || dataIndex === 0) ? 'transparent' : $(`#color-selector > div:nth-child(${dataIndex})`).css('background-color');
}

function check_download() {
    // Check if the rooms have been generated and filled
    const generated_rooms = $('#room-labels');
    if (generated_rooms.children('.room-label').length === 0) {
        alert("Define the house plan spaces first");
        return false;
    } else {
        let emptyInput = generated_rooms.find('input[type="text"]').filter(function () {
            return $(this).val().trim() === '';
        });

        if (emptyInput.length > 0) {
            alert("Fill out all house plan's spaces first");
            return false;
        }
    }
    return true;
}

async function download_plan() {
    if (!check_download()) {
        return;
    }
    const result = JSON.stringify(await makeHousePlanData());
    const blob = new Blob([result], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = 'plan.json';
    element.click();
}

function clearGrid() {
    let cells = $('.cell')
    let prevcells = $('.prev-cell')
    cells.attr('data-value', 0);
    cells.css('background-color', 'transparent');
    cells.css('background-image', '');

    prevcells.css('background-color', 'transparent');
    prevcells.css('background-image', '');
    $('body')
        .find('input.main-input-image')
        .remove();
    const formEntries = $('#submit-house-info').find('.entry');
    const labelInfo = formEntries.find('label');
    const inputInfo = formEntries.find('input, select');
    if (labelInfo.length !== inputInfo.length) {
        console.error('entry label and input length mismatch');
        return;
    }
    for (let i = 0; i < labelInfo.length; i++) {
        const label = $(labelInfo[i])
            .attr('for')
            .replace('house-form-', '')
            .replace('-', '_');
        const input = $(inputInfo[i]);
        if (input.is('select')) {
            input
                .children('option')
                .prop('selected', false)
                .first()
                .prop('selected', true);
        } else {
            input.val('');
        }
    }
    generateRooms();
    $('#room-labels').children('span').show();
}

function upload_plan(file) {
    if (file) {
        showLoader();
        clearGrid();
        const reader = new FileReader();
        reader.onload = function (e) {
            const plan = JSON.parse(String(e.target.result));
            // grid generation
            for (let i = 0; i < plan.data.length; i++) {
                const cell = $($('.cell')[i]);
                const previewCell = $($('.prev-cell')[i]);
                cell.attr('data-value', plan.data[i]);
                cell.css('background-color', getColor(plan.data[i]));
                previewCell.css('background-color', getColor(plan.data[i]));
            }
            // room generation
            generateRooms();
            for (const room of plan.rooms) {
                const label = $(`#room-labels label[data-value="${room.value}"]`);
                const input = label.closest('.room-label').find('input[type="text"]');
                input.val(room.label);
            }
            // image generation
            for (const { cellId, imageId } of plan.indices) {
                const fileInfo = plan.images[imageId];
                fetch(fileInfo.data)
                    .then((value) => {
                        return value.blob();
                    })
                    .then((blob) => {
                        const file = new File([blob], fileInfo.name, {
                            type: fileInfo.type,
                            lastModified: fileInfo.lastModified
                        });
                        const transfer = new DataTransfer();
                        transfer.items.add(file);
                        if (cellId > 0) {
                            const cell = $($('.cell')[cellId - 1]);
                            const input = makeImageInput(cell);
                            const inputElement = input[0];
                            inputElement.files = transfer.files;
                            input.trigger('change');
                        } else if (cellId === 0) {
                            const input = makeButtonImageInput();
                            $('#submit-house-main-image').css({
                                'background-image': `url(${fileInfo.data})`,
                            });
                            const inputElement = input[0];
                            inputElement.files = transfer.files;
                            input.trigger('change');

                            const body = $('body');
                            const previous = body.children('input[data-id="0"]');
                            if (previous.length > 0) {
                                previous.remove();
                            }
                            body.append(input);
                        }
                    });
            }
            // info generation
            const formEntries = $('#submit-house-info').find('.entry');
            const labelInfo = formEntries.find('label');
            const inputInfo = formEntries.find('input, select');
            if (labelInfo.length !== inputInfo.length) {
                console.error('entry label and input length mismatch');
                return;
            }
            for (let i = 0; i < labelInfo.length; i++) {
                const label = $(labelInfo[i])
                    .attr('for')
                    .replace('house-form-', '')
                    .replace('-', '_');
                const value = plan.info[label];
                if (value === undefined) {
                    continue;
                }
                const parseOptionValue = (value) => {
                    if (value.parent().attr('type') === 'number') {
                        return parseInt(value.val(), 10);
                    }
                    const numValue = parseInt(value.attr('value'), 10);
                    if (isNaN(numValue)) {
                        return value.text().trim();
                    }
                    return numValue;
                };
                const input = $(inputInfo[i]);
                if (input.is('select')) {
                    const option = input
                        .val(value)
                        .children('option')
                        .filter(function () {
                            return parseOptionValue($(this)) === value;
                        });
                    option.prop('selected', true);
                } else {
                    input.val(value);
                }
            }
            $('#house-form-description').val(plan.info['description']);
            $('#upload_button').val('');
            hideLoader();
        };
        reader.readAsText(file);
    } else {
        alert("Please select a file.");
    }
}

function generateRooms() {
    let roomLabels = $('#room-labels');
    roomLabels.children('span').hide();
    // Select all unique non-transparent background colors and data values from divs with the "cell" class
    let uniqueColorsAndData = [...new Set($('.cell').map(function () {
        let color = $(this).css('background-color');
        let data = $(this).attr('data-value');
        return (isRoom(color)) ? { color, data } : null;
    }).get())];

    // Remove containers with background colors not present in unique colors
    $('.room-label').each(function () {
        let containerColor = $(this).find('label').attr('data-value');
        if (!uniqueColorsAndData.some(item => item.color === containerColor)) {
            $(this).remove();
        }
    });

    // Append labels and inputs for each unique background color and data value
    uniqueColorsAndData.forEach(function (item) {
        // Check if a label with the same background color already exists
        if (roomLabels.find('label[data-value="' + item.data + '"]').length === 0) {
            // If not, create a new container, label, and input
            let container = $('<div>').addClass('room-label');
            let label = $('<label>').attr('data-value', item.data).css('background-color', item.color);
            let input = $('<input>').attr('type', 'text');

            // Append label and input to the container
            container.append(label).append(input);

            // Append the container to the "room-labels" div
            roomLabels.append(container);
        }
    });
}

function isRoom(color) {
    return (color !== 'rgba(0, 0, 0, 0)' &&
        color !== 'rgb(240, 248, 255)' &&   //Window
        color !== 'rgb(105, 105, 105)' &&   //DoorL
        //color !== 'rgb(169, 169, 169)' &&   //DoorR
        color !== 'rgb(0, 0, 0)')           //Wall
}

function showLoader() {
    $('.loader').css('opacity', 1);
}

function hideLoader() {
    setTimeout(function () {
        $('.loader').css('opacity', 0);
    }, 1);
}