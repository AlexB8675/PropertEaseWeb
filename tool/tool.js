// Define the number of rows and columns
const ROWS = 50;
const COLS = 50;

class SubmitForm {
    constructor() {
        this.data = '';
        this.files = [];
        this.indices = [];
    }

    addFile(file) {
        this.files.push(file);
    }

    addIndex(index) {
        this.indices.push(index);
    }

    addData(data) {
        this.data += data;
    }

    asForm() {
        const form = new FormData();
        form.append('data', this.data);
        for (const file of this.files) {
            form.append('files', file);
        }
        for (const [index, value] of this.indices.entries()) {
            form.append(`indices`, value);
        }
        return form;
    }

    clear() {
        this.data = '';
        this.files = [];
        this.indices = [];
    }
}
const submitData = new SubmitForm();

$(document).ready(function () {
    $(document).on('keydown', function (e) {
        const keyCode = e.keyCode;

        // Get all the cell elements
        const cells = $('.cell');
        const prevcells = $('.prev-cell');

        // Calculate the total number of cells
        const totalCells = ROWS * COLS;

        // Define a function to get the index of a cell based on row and column
        function getIndex(row, col) {
            return row * COLS + col;
        }

        // Define a function to get the row and column based on the index
        function getRowCol(index) {
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            return { row, col };
        }

        // Define a function to shift the cells in the specified direction
        function shiftCells(direction) {
            // Create a copy of the current data-values
            const dataValues = cells.map(function () {
                return $(this).attr('data-value');
            }).get();

            const backgroundColors = cells.map(function () {
                return $(this).css('background-color');
            }).get();

            const prevDataValues = prevcells.map(function () {
                return $(this).attr('data-value');
            }).get();

            const prevBackgroundColors = prevcells.map(function () {
                return $(this).css('background-color');
            }).get();

            // Shift the cells based on the direction
            for (let i = 0; i < totalCells; i++) {
                const currentCell = getRowCol(i);

                let newRow = currentCell.row;
                let newCol = currentCell.col;

                switch (direction) {
                    case 'up':
                        newRow = (currentCell.row + 1) % ROWS;
                        break;
                    case 'down':
                        newRow = (currentCell.row - 1 + ROWS) % ROWS;
                        break;
                    case 'left':
                        newCol = (currentCell.col + 1) % COLS;
                        break;
                    case 'right':
                        newCol = (currentCell.col - 1 + COLS) % COLS;
                        break;
                }

                const newIndex = getIndex(newRow, newCol);
                $(cells[i]).attr('data-value', dataValues[newIndex]);
                $(cells[i]).css('background-color', backgroundColors[newIndex]);
                $(prevcells[i]).attr('data-value', prevDataValues[newIndex]);
                $(prevcells[i]).css('background-color', prevBackgroundColors[newIndex]);
            }
        }

        // Check the arrow key pressed and call the shiftCells function
        switch (keyCode) {
            case 37: // Left arrow key
                shiftCells('left');
                break;
            case 38: // Up arrow key
                shiftCells('up');
                break;
            case 39: // Right arrow key
                shiftCells('right');
                break;
            case 40: // Down arrow key
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
        { value: "33", icon: "fa-border-all", color: 'aliceblue', specialBehavior: null, selected: false },  // Wall
        { value: "35", icon: "fa-door-closed", color: 'dimgray', specialBehavior: null, selected: false },  // Door
        { value: "32", icon: "fa-trowel-bricks", color: 'black', specialBehavior: null, selected: false },   // Window
        { value: "fill_bucket", icon: "fa-fill-drip", color: '#363636', specialBehavior: "fill", selected: false }, // Fill Bucket
        { value: "image_upload", icon: "fa-camera", color: '#363636', specialBehavior: "camera", selected: false }    // Image Upload
    ];

    $('.prev-cell').on('mousemove', function (e) {
        let mouseX = e.pageX - mouseDiv.outerWidth();
        let mouseY = e.pageY - mouseDiv.outerHeight();
        mouseDiv.css("left", mouseX);
        mouseDiv.css("top", mouseY);

        const roomName = $('#room-name');
        // Get the color of the hovered cell
        let hoveredColor = $(this).css("background-color");

        if (check_isRoom(hoveredColor)) {
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
                $("#selected-color").css('background-color', $(this).css('background-color'));
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
                    .css({ "background-color": "transparent", "background-image": "" })
                    .removeClass('picture-container');
            }
        }
    });

    cell.on('click', function () {
        // Check if the Image Upload tool is selected
        if (tools[4].selected) {
            const clickedCell = $(this);
            const previewCell = $(`#preview > div:nth-child(${clickedCell.index() + 2})`);

            // Backup image
            clickedCell.css('background-image', `url('camera.svg')`);

            // Create an input element
            const input = $('<input type="file" style="display:none">');
            $('body').append(input);
            input.on('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        clickedCell.css('background-image', `url(${e.target.result})`);
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
                                    $(this).css('padding-top', ``);
                                }
                            });
                    };
                    reader.readAsDataURL(file);

                    submitData.addFile(file);
                    submitData.addIndex(clickedCell.index());
                }

                // Remove the input element from the DOM
                input.remove();
            });
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
        upload_plan($('#upload_button')[0].files[0]);
    });

    $(".prev-cell").on('mouseover', function () {
        const color = $(this).css("background-color");
        $(".prev-cell").removeClass('hovered-cell');
        if (check_isRoom(color)) {
            const cells_toChange = $('.prev-cell[style*="background-color: ' + color + '"]');
            cells_toChange.addClass('hovered-cell');
        }
    });

    $('#submit-plan').on('click', function () {
        if (!check_download()) {
            return;
        }

        let result = '';
        $('#grid-container > div[data-value]').each(function (index) {
            const value = $(this).attr('data-value');
            if (index > 0 && index % COLS === 0) {
                result += '\n' + value + ',';
            } else {
                result += value + ',';
            }
        });
        result += '\n';
        $('#room-labels label[data-value]').each(function () {
            const value = $(this).attr('data-value');
            const roomLabelText = $(this)
                .closest('.room-label')
                .find('input[type="text"]')
                .val()
                .trim();
            result += value + ',' + roomLabelText + ';';
        });
        submitData.addData(result);
        $.ajax({
            url: makeEndpointWith('/api/data/tool/upload'),
            type: 'POST',
            data: submitData.asForm(),
            processData: false,
            contentType: false,
            done: function (response) {
                console.log('Response:', response);
            },
            error: function (error) {
                console.error('Error Uploading Plan:', error);
            }
        });

        // reset
        submitData.clear();
        clear_grid();
    });

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

function download_plan() {

    if (!check_download()) {
        return;
    }

    // Initialize the result string
    let resultString = '';

    // Loop through each div
    $('#grid-container > div[data-value]').each(function (index) {
        // Get the data-value attribute value
        let dataValue = $(this).attr('data-value');

        // Add the value, a comma, and a newline to the result string
        if (index > 0 && index % COLS === 0) {
            resultString += '\n' + dataValue + ',';
        } else {
            resultString += dataValue + ',';
        }
    });

    resultString += "\n";

    // Loop through each room-label
    $('#room-labels label[data-value]').each(function () {
        // Get the data-value attribute value
        let dataValue = $(this).attr('data-value');

        // Get the text content of the room-label
        let roomLabelText = $(this).closest('.room-label').find('input[type="text"]').val().trim();

        // Add the value, a comma, the room-label text, a semicolon, and a newline to the result string
        resultString += dataValue + ',' + roomLabelText + ';';
    });


    // Download the result as a text file
    let blob = new Blob([resultString], { type: 'text/plain' });
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'data-values.hplan';
    a.click();
}

function clear_grid() {
    let cells = $('.cell')
    let prevcells = $('.prev-cell')
    cells.attr('data-value', 0);
    cells.css('background-color', 'transparent');
    cells.css('background-image', '');

    prevcells.css('background-color', 'transparent');
    prevcells.css('background-image', '');
    generate_rooms();
    $('#room-labels').children('span').show();
}

function upload_plan(file) {
    if (file) {
        showLoader(); // Show the loader before file reading

        clear_grid();
        // Create a new FileReader
        const reader = new FileReader();

        // Define the callback function for when the file is loaded
        reader.onload = function (e) {
            // Get the content of the file
            const content = e.target.result;

            // Split the content into rows
            const rows = content.split('\n');

            // Loop through each row
            for (let i = 0; i < rows.length - 1; i++) {
                // Split the row into values
                const values = rows[i].split(',');
                values.pop()
                // Loop through each value
                for (let j = 0; j < values.length; j++) {
                    const cell = $(`#grid-container > div:nth-child(${i * COLS + j + 1})`);
                    cell.css('background-color', getColor(values[j]));
                    cell.attr("data-value", values[j]);
                    $(`#preview > div:nth-child(${i * COLS + j + 2})`).css("background-color", getColor(values[j]));
                }
            }

            generate_rooms();

            // Get the last row of values
            const lastRowValues = rows[rows.length - 1].split(';');

            // Loop through each room-label
            $('#room-labels .room-label input[type="text"]').each(function (index) {
                // Get the data-value attribute value
                $(this).val(lastRowValues[index].split(",")[1]);
            });

            hideLoader(); // Hide the loader after file reading
        };

        // Read the file as text
        reader.readAsText(file);
    } else {
        alert("Please select a file.");
    }
}

function generate_rooms() {
    let roomLabels = $('#room-labels');
    roomLabels.children('span').hide();
    // Select all unique non-transparent background colors and data values from divs with the "cell" class
    let uniqueColorsAndData = [...new Set($('.cell').map(function () {
        let color = $(this).css('background-color');
        let data = $(this).attr('data-value');
        return (check_isRoom(color)) ? { color, data } : null;
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

function check_isRoom(color) {
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