/*
    This js file is used to declare the "initialize" function that is run in house.hmtl
*/

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

// Async was used to ensure Google Maps APIs load first
async function initialize() {
    // Gradient around mouse position in the scroller
    $('#scroller').on('mousemove', function (e) {
        // Get the x and y position relative to the scroller div
        let x = e.pageX - this.offsetLeft;
        let y = e.pageY - this.offsetTop;

        // Apply the gradient background centered on the mouse position
        $(this).css('background', `radial-gradient(ellipse 450pt 450pt at ${x}px ${y}px, #323232 0%, #242424 100%`);
    });

    //When clicking on the slider "i" tag (l/r arrows), the next picture is shown with an animation
    const sliderNav = $('#slider-nav');

    sliderNav
        .children('i')
        .on('mousedown', function () {
            // Disable pointer events on 'sliderNav' to prevent multiple clicks during animation
            sliderNav.css({'pointer-events': 'none'});

            const sliderImages = $('#slider-images');
            const sliderImagesChildren = sliderImages.children();
            const currentPic = $('.selected-img');

            // Determine the direction of the sliding animation based on the index of the clicked element
            const direction = $(this).index() ? 1 : -1;

            // Calculate the index of the next image in the sequence, considering the direction and array length
            const nextPicIndex = (currentPic.index() + direction + sliderImagesChildren.length) % sliderImagesChildren.length;

            const nextPic = $(sliderImagesChildren.filter('img')[nextPicIndex]);

            // Set the initial position of the next image based on the direction
            nextPic
                .css({'left': `${direction * 100}%`})
                .addClass('selected-img'); // Add the 'selected-img' class to the next image

            // Add the 'prev-img' class to the current image and remove the 'selected-img' class
            currentPic
                .addClass('prev-img')
                .removeClass('selected-img');

            // Animate the sliding of the next image to the center position over 350 milliseconds
            nextPic.animate({'left': 0}, 350, 'swing', () => {
                nextPic.css({'left': ''});
                currentPic.removeClass('prev-img');

                // Enable pointer events on 'sliderNav' after the animation is complete
                sliderNav.css({'pointer-events': ''});
            });
        });


    // Get the 'id' parameter from the URL
    const houseId = getUrlParameters().get('id');

    // Check if the UIRL contains a house ID
    if (houseId) {
        // Retrieve information about the logged-in user
        const loggedUser = getLoggedUser();

        // Check if the logged-in user is an admin
        if (isUserAdmin(loggedUser)) {
            // If the user is an admin, dynamically modify the DOM to add edit and delete icons to the header
            $('#header-title-container')
                // Append an edit icon with a click event that redirects to the 'tool.html' page with the 'id' parameter
                .append(
                    $('<i class="fa fa-edit" aria-hidden="true">').on('click', () => {
                        window.location.href = `./tool.html?id=${houseId}`;
                    })
                )
                // Append a delete icon with a click event that sends an AJAX request to delete the house
                .append(
                    $('<i class="fa fa-trash" aria-hidden="true">').on('click', () => {
                        if (!confirm('Are you sure you want to delete this house plan? (This is permanent action!)')) {
                            return;
                        }
                        // Send an AJAX request to the server to delete the house with the specified 'id'
                        $.ajax({
                            url: makeEndpointWith(`/api/data/houses/id/${houseId}`),
                            method: 'delete',
                            cache: false,
                        }).done((_) => {
                            // After successful deletion, redirect to the 'index.html' page
                            window.location.href = './index.html';
                        });
                    })
                );
        }
    }

    // Make an AJAX request to retrieve the house plan JSON
    await $.ajax({
        url: makeEndpointWith(`/api/data/houses/id/${houseId}`),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((response) => {
        // Ignore the "id" field
        const { _, plan } = response[0];
        // Parse JSON contents and retrieve images
        const house = JSON.parse(plan);
        const images = imagesFromHousePlan(house);

        /* SLIDER POPULATION */
        const sliderImages = $('#slider-images');
        const secondaryImage = $('#highlights img');

        // If no images were found, apply a default placeholder
        if (images.size === 0) {
            sliderImages.append(`<img data-value='0' src="images/placeholder.svg" class="selected-img" alt/>`);
        } else {
            // Create an array of unique images
            const uniqueImages = [...new Set(Array.from(images.values()))];
            for (const [index, image] of uniqueImages.entries()) {
                sliderImages.append(`<img data-value='${index}' src="${image.data}" class="${index === 0 ? 'selected-img' : ''}" alt/>`); //todo alt='nomestanza'
            }
            // Choose the last image as the highlight
            secondaryImage.attr({'src': uniqueImages[uniqueImages.length - 1].data});
        }

        /* HOUSE INFO POPULATION */
        // Extract index from character
        const energyClassIndex = house.info.energy_class.charCodeAt(0) - 'A'.charCodeAt(0);

        //Populate labels with retrieved data
        $('#house-address').text(`${house.info.city}, ${house.info.address}, ${house.info.zip}`);
        $('#house-floor').text(house.info.floor);
        $('#house-elevator').text(house.info.elevator ? 'Yes' : 'No');
        $('#house-balcony').text(house.info.balconies || 'No');
        $('#house-terrace').text(house.info.terrace || 'No');
        $('#house-garden').text(house.info.garden || 'No');
        $('#house-accessories').text(house.info.accessories || 'No');
        $('#house-bedrooms').text(house.info.bedrooms || 'No');
        $('#house-description').text(house.info.description);
        $(`#energy-bar div:nth-child(${energyClassIndex + 1})`).css({
            'color': 'aliceblue'
        });
        $(`#energy-bar div:nth-child(${energyClassIndex + 8})`)
            .css({
                'filter': 'none',
                'transform': 'scale(1.1)',
                'z-index': 1
            })
            .append('<i class="fa-solid fa-bolt"></i>');
        $('#house-energy-performance').html(`${house.info.energy_performance} kWh/m&#178; yearly`);
        $('#house-energy-system').text(house.info.energy_system);
        $('#house-energy-fuel').text(house.info.fuel);

        /* HOUSE PLAN POPULATION */
        const cells = [];
        // for each cell of the preview matrix, apply its associated color
        for (const [_, value] of house.data.entries()) {
            cells.push($(`<div class="preview-cell" style="background-color: ${HOUSE_PLAN_CELL_COLORS[value]}" data-value="${value}"></div>`))
        }

        // For each different color, assign its room name label
        const rooms = new Map();
        for (const { label, value: color } of house.rooms) {
            rooms.set(color, label);
        }

        // Populate the house plan matrix
        const roomContainer = $('#room-name');
        const housePlanContainer = $('#house-plan-container');
        housePlanContainer.append(cells);
        const previewCells = $('.preview-cell');

        // Calculate and populate the house sqm label
        $('#house-sqm').text(previewCells.filter(function () {
            return isRoom($(this).css("background-color"));
        }).length / 4);

        // Render images on the house plan
        for (const [index, image] of images.entries()) {
            // The first image (index 0) is the card display image and doesn't need to be rendered
            if (index === 0) {
                continue;
            }

            cells[index - 1] // -1 is used to compensate the offset of the card display image
                .addClass('picture-container')
                .css({
                    'background-image': `url(${image.data})`
                })
                .on('mousedown', function () {
                    // The greatest common divisor is used to ensure that the enlarged image has a correct aspect ratio
                    const gcd = (a, b) => {
                        if (b === 0) {
                            return a;
                        }
                        return gcd(b, a % b);
                    };

                    roomContainer.hide(); // Hide the room label that showa on mouse hover

                    // Display the enlarged image
                    const innerImage = new Image();
                    innerImage.src = image.data;
                    const common = gcd(innerImage.width, innerImage.height);
                    $('#preview-image')
                        .css({
                            'width': 'auto',
                            'height': '100%',
                            'aspect-ratio': `${innerImage.width / common} / ${innerImage.height / common}`,
                            'background': `url(${image.data}) no-repeat no-repeat`,
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
                        })
                });
        }

        /* MOUSEOVER INFO POPULATION */
        previewCells
            .on('mousemove', function (event) {
                // Move the mousover label according to the mouse position
                const mouseX = event.pageX - roomContainer.outerWidth();
                const mouseY = event.pageY - roomContainer.outerHeight();
                roomContainer.css("left", mouseX);
                roomContainer.css("top", mouseY);

                // According to the hovered cell color, calculate sqm and get room name
                const hoveredColor = $(this).css("background-color");
                if (isRoom(hoveredColor)) {
                    roomContainer
                        .empty()
                        .text(rooms.get(parseInt($(this).attr('data-value'), 10)));
                    const squareCount = $('.preview-cell').filter(function () {
                        return $(this).css("background-color") === hoveredColor;
                    }).length;
                    roomContainer
                        .append(`<div> sqm: ${squareCount / 4}</div>`) // Assuming by design that each square is 0.25m
                        .show();
                } else {
                    // Hide the room name if the color is transparent
                    roomContainer.hide();
                }
            })
            .on('mouseover', changeCellColor(previewCells)); // Adds the class "hovered-cell"

        // Resize the cells when not hovered
        housePlanContainer.on('mouseleave', function () {
            previewCells.removeClass('hovered-cell');
            roomContainer.hide();
        });

        // Once everything has been rendered, remove the loader
        hideLoader();

    }).fail((_) => {
        console.error("Invalid house");
    });
}
