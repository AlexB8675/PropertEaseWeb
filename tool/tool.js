// Utility class to define the structure of a House Plan
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

function getCurrentHouseId() {
    if (getUrlParameters().has('id')) {
        return parseInt(getUrlParameters().get('id'), 10);
    }
    return null;
}

function shouldEdit() {
    return getUrlParameters().has('id');
}

$(document).ready(function () {
    const loggedUser = getLoggedUser();
    if (!isUserAdmin(loggedUser)) {
        window.location.href = './index.html';
    }

    $(document).on('keydown', function (e) {
        const keyCode = e.keyCode;

        // Get all the cell elements
        const cells = $('.cell');
        const previewCells = $('.prev-cell');

        // Calculate the total number of cells
        const totalCells = ROWS * COLS;

        // Utility function to convert an [x, y] encoded coordinate to a flat index
        function getRowCol(index) {
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            return { row, col };
        }

        // Utility function to get the properties of a cell such as the color and its background image
        function getCellProperties(cellArray) {
            return cellArray.map(function () {
                return {
                    dataValue: $(this).attr('data-value'),
                    backgroundColor: $(this).css('background-color'),
                    backgroundImage: $(this).css('background-image')
                };
            }).get();
        }

        // Utility function to check if two cell properties are equal
        function arePropertiesEqual(properties1, properties2) {
            return (
                properties1.dataValue === properties2.dataValue &&
                properties1.backgroundColor === properties2.backgroundColor &&
                properties1.backgroundImage === properties2.backgroundImage
            );
        }

        // Allows the user to shift the cells using the arrow keys
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

                // Get direction of the shift
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

                // Get target cells and properties
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
    const previewCellContainer = $('#preview');

    // Generate the main grid and preview grid
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = $('<div>').addClass('cell').attr('data-value', '0');
        gridContainer.append(cell);
    }
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = $('<div>').addClass('prev-cell').attr('data-value', '0');
        previewCellContainer.append(cell);
    }

    // Prepare the various elements for usage later
    const cells = $('.cell')
    const previewCells = $('.prev-cell');
    let currentDataValue = 0;
    let colorSelector = $('#color-selector');
    let isLeftMousePressed = false;
    let isRightMousePressed = false;
    // Prepare tools
    const tools = [
        { value: "33", icon: "fa-border-all", color: 'black', specialBehavior: null, selected: false },  // Wall
        { value: "35", icon: "fa-door-closed", color: 'dimgray', specialBehavior: null, selected: false },  // Door
        { value: "32", icon: "fa-trowel-bricks", color: 'aliceblue', specialBehavior: null, selected: false }, // Window
        { value: "fill_bucket", icon: "fa-fill-drip", color: '#363636', specialBehavior: "fill", selected: false }, // Fill Bucket
        { value: "image_upload", icon: "fa-camera", color: '#363636', specialBehavior: "camera", selected: false } // Image Upload
    ];

    previewCells
        .on('mousemove', function (e) {
            const roomName = $('#room-name');
            const mouseX = e.pageX - roomName.outerWidth();
            const mouseY = e.pageY - roomName.outerHeight();
            roomName.css("left", mouseX);
            roomName.css("top", mouseY);

            // Get the color of the hovered cell
            const hoveredColor = $(this).css("background-color");
            if (isRoom(hoveredColor)) {
                // Find the room label with the corresponding background color
                const correspondingRoomLabel = $('#room-labels .room-label label[data-value]').filter(function () {
                    return $(this).css("background-color") === hoveredColor;
                });

                // Get the text of the room label
                const roomLabelText = correspondingRoomLabel.closest('.room-label').find('input[type="text"]').val();
                roomName
                    .empty()
                    .text(roomLabelText);
                const squareCount = $('.prev-cell').filter(function () {
                    return $(this).css("background-color") === hoveredColor;
                }).length;
                roomName
                    .append(`<div> sqm: ${squareCount / 4}</div>`)
                    .show();
            } else {
                // Hide the room name if the color is transparent
                roomName.hide();
            }
        })
        .on('mouseover', changeCellColor(previewCells));

    // Removes room name when mouse leaves the preview grid
    previewCellContainer.on('mouseleave', function () {
        previewCells.removeClass('hovered-cell');
        $('#room-name').hide();
    });

    // Inserts the chosen value on the clicked cell
    cells.on('mousedown', function (event) {
        switch (event.which) {
            case 1:
                isLeftMousePressed = true;
                break;
            case 2:
                event.preventDefault();
                $("#selected-color")
                    .css('background-color', $(this).css('background-color'))
                    .attr('data-value', $(this).attr('data-value'));
                currentDataValue = $(this).data();
                break;
            case 3:
                isRightMousePressed = true;
                break;
        }
    });

    // Handles mouse events
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

    cells.on('mouseover mousedown', function () {
        // Special behavior for the Fill Bucket tool and the Camera tool
        if (!tools[3].selected && !tools[4].selected) {
            if (isLeftMousePressed) {
                // This adds the selected color or the chosen image to the cell
                $(this)
                    .css('background-color', getColor(currentDataValue))
                    .attr('data-value', currentDataValue.value);
                $($('.prev-cell')[$(this).index()])
                    .css('background-color', getColor(currentDataValue));
            } else if (isRightMousePressed) {
                // Otherwise, initialize the cell to its default state
                $(this)
                    .css({
                        'background-color': 'transparent',
                        'background-image': ''
                    })
                    .removeClass('picture-container')
                    .attr('data-value', 0);
                // Initialize the equivalent's preview cell to its default state
                $($('.prev-cell')[$(this).index()])
                    .css({ 'background-color': 'transparent', 'background-image': '' })
                    .removeClass('picture-container');
                // Remove the image input if it exists
                $('body')
                    .children(`input[data-id="${$(this).index() + 1}"]`)
                    .remove();
            }
        }
    });

    cells.on('click', function () {
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

    // Handles the tool window
    colorSelector.children().on('click', function () {
        currentDataValue = $(this).data();
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
            currentDataValue = $(this).data();
        }
    });

    // Loads the House Plan of the uploaded file
    $('#upload_button').on('change', function () {
        uploadPlan($(this)[0].files[0]);
    });

    // Call for setup of all the form inputs and buttons
    setupHouseSubmitForm();

    // This function fills the cells surrounding a given position [x, y] with the selected color
    // until all cells have encountered a different color or the edge of the grid
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

    // If the tool is in edit mode (i.e: has an ID of the house to edit in its URL, get the file plan of the House and load it)
    if (shouldEdit()) {
        $.ajax({
            url: makeEndpointWith(`/api/data/houses/id/${getCurrentHouseId()}`),
            method: 'get',
            dataType: 'json',
            cache: false,
        }).done((response) => {
            const { _, plan } = response[0]
            uploadPlan(new File([plan], 'plan.json', {
                type: 'text/plain',
                lastModified: Date.now()
            }));
        });
    }
});

// Gives handlers to the form inputs and buttons as well as requesting extra info from the server to fill <select>
// elements where necessary
function setupHouseSubmitForm() {
    // Fill house types
    $.ajax({
        url: makeEndpointWith('/api/data/types'),
        method: 'get',
        dataType: 'json'
    }).done((response) => {
        for (const each of response) {
            $('#house-form-house').append(`<option value="${each.name}">${each.name}</option>`);
        }
    });
    // Handles the user clicking on the upload main image button
    $('#submit-house-main-image').on('click', function (event) {
        event.preventDefault();
        const input = makeButtonImageInput();
        input.trigger('click');
    });
    // Handles submission of the form
    $('#submit-house-form').on('submit', async function (event) {
        event.preventDefault();
        if (!isDownloadReady()) {
            return;
        }

        const result = await makeHousePlanData();
        $.ajax({
            url: makeEndpointWith('/api/data/tool/upload'),
            type: 'post',
            data: JSON.stringify({
                id: getCurrentHouseId(),
                plan: result
            }),
            cache: false,
            processData: false,
            contentType: 'application/json',
        }).done((data) => {
            window.location.href = `./house.html?id=${data.id}`;
        }).fail((error) => {
            console.error(error);
        });
    });
}

// Utility function to make an input element for any given cell, with the relevant handlers already applied
function makeImageInput(cell) {
    const body = $('body');
    const previousInput = body.find(`input[data-id="${cell.index() + 1}"]`);
    if (previousInput.length > 0) {
        previousInput.remove();
    }

    // Backup image
    cell.css('background-image', `url('camera.svg')`);
    // Create an input element
    const input = $('<input class="main-input-image" type="file" style="display: none">');
    // Add default handler for selecting images
    input.on('change', function () {
        const previewCell = $($('.prev-cell')[cell.index()]);
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                cell.css('background-image', `url(${e.target.result})`);
                previewCell
                    .addClass('picture-container')
                    .css('background-image', `url(${e.target.result})`)
                    .on('mousedown', function () {
                        const gcd = (a, b) => {
                            if (b === 0) {
                                return a;
                            }
                            return gcd(b, a % b);
                        };
                        const image = new Image();
                        image.src = String(e.target.result);
                        const common = gcd(image.width, image.height);
                        $('#room-name').hide();
                        $('#preview-image')
                            .css({
                                'width': 'auto',
                                'height': '100%',
                                'aspect-ratio': `${image.width / common} / ${image.height / common}`,
                                'background': `url(${e.target.result}) no-repeat no-repeat`,
                                'background-size': 'cover'
                            })
                            .on('mousedown', function () {
                                $(this)
                                    .css({
                                        'width': '',
                                        'height': '',
                                        'background': ''
                                    })
                                    .off('mousedown');
                            });
                    });
            };
            reader.readAsDataURL(file);
            input.attr('data-id', cell.index() + 1);
            body.append(input);
        }
    });
    return input;
}

// Utility function to return the main button image input element with the relevant handlers already applied
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

// Core function to generate the House Plan from the provided info
async function makeHousePlanData() {
    // Make a new house plan
    const result = new HousePlan();
    // Inserts all the cell's values
    $('.cell')
        .each(function () {
            result.data.push(parseInt($(this).attr('data-value'), 10));
        });
    // Inserts all the room's labels and associated cell values
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
    // Inserts all the images and their associated cell values
    const images = new Map();
    $('body')
        .children('input.main-input-image')
        .each(function () {
            // This allows to associate multiple cells to the same image without duplicating image data
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
    // Inserts all the images and their associated cell IDs
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
    // Get all info from the form
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
    // Finally, return the House Plan as a JSON object
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

function isDownloadReady() {
    // Check if the rooms have been generated and filled
    const generated_rooms = $('#room-labels');
    if (generated_rooms.children('.room-label').length === 0) {
        alert("Define the house plan spaces first");
        return false;
    } else {
        // Check if any of the rooms have been left empty
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

async function downloadPlan() {
    if (!isDownloadReady()) {
        return;
    }
    // Download the House Plan as a JSON file
    const result = JSON.stringify(await makeHousePlanData());
    const blob = new Blob([result], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = 'plan.json';
    element.click();
}

// Utility function to clear the grid and reset all the form inputs and buttons
function clearGrid() {
    // First, clear the grid and the preview grid
    let cells = $('.cell')
    let previewCells = $('.prev-cell')
    cells.attr('data-value', 0);
    cells.css('background-color', 'transparent');
    cells.css('background-image', '');

    previewCells.css('background-color', 'transparent');
    previewCells.css('background-image', '');
    // Then, clear all the image inputs
    $('body')
        .find('input.main-input-image')
        .remove();
    // Reset all form inputs and buttons
    const formEntries = $('#submit-house-info').find('.entry');
    const labelInfo = formEntries.find('label');
    const inputInfo = formEntries.find('input, select');
    if (labelInfo.length !== inputInfo.length) {
        console.error('entry label and input length mismatch');
        return;
    }
    for (let i = 0; i < labelInfo.length; i++) {
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
    $('#house-form-description').val('');
    $('#submit-house-main-image').css({
        'background-image': 'images/placeholder.svg',
    });
    generateRooms();
    $('#room-labels').children('span').show();
}

// Core function to load a given House Plan
function uploadPlan(file) {
    if (file) {
        // Parsing a House Plan takes some time, show a loading screen to prevent visible pop-in of data
        showLoader();
        // First, reset everything to its default state
        clearGrid();
        // Then, read the house plan file
        const reader = new FileReader();
        reader.onload = function (e) {
            // Assume the file is a valid House Plan JSON file
            const plan = JSON.parse(String(e.target.result));
            // grid generation
            const cells = $('.cell');
            const previewCells = $('.prev-cell');
            // Fill all cells using the data-values in the plan
            for (let i = 0; i < plan.data.length; i++) {
                const cell = $(cells[i]);
                const previewCell = $(previewCells[i]);
                cell.attr('data-value', plan.data[i]);
                cell.css('background-color', getColor(plan.data[i]));
                previewCell.css('background-color', getColor(plan.data[i]));
            }
            // Generate all rooms and associate them with their respective cell values and labels
            generateRooms();
            for (const room of plan.rooms) {
                const label = $(`#room-labels label[data-value="${room.value}"]`);
                const input = label.closest('.room-label').find('input[type="text"]');
                input.val(room.label);
            }
            // Generate all images and associate them with their respective cell IDs
            for (const { cellId, imageId } of plan.indices) {
                const fileInfo = plan.images[imageId];
                // Load base64
                fetch(fileInfo.data)
                    .then((value) => {
                        // Return image as blob to insert this into the files array of an input element
                        return value.blob();
                    })
                    .then((blob) => {
                        // Create a new file
                        const file = new File([blob], fileInfo.name, {
                            type: fileInfo.type,
                            lastModified: fileInfo.lastModified
                        });
                        // And add it to a data transfer object
                        const transfer = new DataTransfer();
                        transfer.items.add(file);
                        if (cellId > 0) {
                            const cell = $(cells[cellId - 1]);
                            // Then create an input element as if the user was clicking on the cell with the
                            // camera upload tool
                            const input = makeImageInput(cell);
                            // Associate the image file to the input element
                            const inputElement = input[0];
                            inputElement.files = transfer.files;
                            // Trigger the default handler added by `makeImageInput` to insert the image into the cell
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
            // Fill all form inputs from the house plan's data
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
            // Finally hide the loading screen
            hideLoader();
        };
        reader.readAsText(file);
    } else {
        alert("Please select a file.");
    }
}

// Utility function to generate all the rooms given the current grid
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
