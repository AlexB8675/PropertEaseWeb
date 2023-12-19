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

async function initialize() {
    $('#scroller').on('mousemove', function (e) {
        let x = e.pageX - this.offsetLeft;
        let y = e.pageY - this.offsetTop;
        $(this).css('background', `radial-gradient(ellipse 450pt 450pt at ${x}px ${y}px, #323232 0%, #242424 100%`);
    });

    const sliderNav = $('#slider-nav');
    sliderNav.children('i').on('mousedown', function () {
        sliderNav.css({ 'pointer-events': 'none' });
        const sliderImages = $('#slider-images');
        const sliderImagesChildren = sliderImages.children();
        const currentPic = $('.selected-img');
        const direction = $(this).index() ? 1 : -1;
        const nextPicIndex = (currentPic.index() + direction + sliderImagesChildren.length) % sliderImagesChildren.length;
        const nextPic = $(sliderImagesChildren.filter('img')[nextPicIndex]);

        nextPic
            .css({ 'left': `${direction * 100}%` })
            .addClass('selected-img');
        currentPic
            .addClass('prev-img')
            .removeClass('selected-img');
        nextPic.animate({ 'left': 0 }, 350, 'swing', () => {
            nextPic.css({ 'left': '' });
            currentPic.removeClass('prev-img');
            sliderNav.css({ 'pointer-events': '' });
        });
    });

    const houseId = getUrlParameters().get('id');
    if (houseId) {
        const loggedUser = getLoggedUser();
        if (isUserAdmin(loggedUser)) {
            $('#header-title-container')
                .append($('<i class="fa fa-edit" aria-hidden="true">')
                    .on('click', () => {
                        window.location.href = `./tool.html?id=${getUrlParameters().get('id')}`;
                    }))
                .append($('<i class="fa fa-trash" aria-hidden="true">')
                    .on('click', () => {
                        const houseId = getUrlParameters().get('id');
                        $.ajax({
                            url: makeEndpointWith(`/api/delete/house/id/${houseId}`),
                            method: 'post',
                            cache: false,
                        }).done((_) => {
                            window.location.href = './index.html';
                        });
                    }));
        }
    }
    await $.ajax({
        url: makeEndpointWith(`/api/data/houses/id/${houseId}`),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((response) => {
        const { _, plan } = response[0];
        const house = JSON.parse(plan);
        const images = imagesFromHousePlan(house);

        const sliderImages = $('#slider-images');
        const secondaryImage = $('#highlights img');
        if (images.size === 0) {
            sliderImages.append(`<img data-value='0' src="images/placeholder.svg" class="selected-img" alt/>`);
        } else {
            const uniqueImages = [...new Set(Array.from(images.values()))];
            for (const [index, image] of uniqueImages.entries()) {
                sliderImages.append(`<img data-value='${index}' src="${image.data}" class="${index === 0 ? 'selected-img' : ''}" alt/>`);
            }
            secondaryImage.attr({ 'src': uniqueImages[uniqueImages.length - 1].data });
        }
        const energyClassIndex = house.info.energy_class.charCodeAt(0) - 'A'.charCodeAt(0);
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

        const cells = [];
        for (const [index, value] of house.data.entries()) {
            cells.push($(`<div class="preview-cell" style="background-color: ${HOUSE_PLAN_CELL_COLORS[value]}" data-value="${value}"></div>`))
        }
        for (const [index, image] of images.entries()) {
            if (index === 0) {
                continue;
            }
            cells[index]
                .addClass('picture-container')
                .css({
                    'background-image': `url(${image.data})`
                })
                .on('mousedown', function () {
                    const gcd = (a, b) => {
                        if (b === 0) {
                            return a;
                        }
                        return gcd(b, a % b);
                    };
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

        const rooms = new Map();
        for (const { label, value } of house.rooms) {
            rooms.set(value, label);
        }
        const roomContainer = $('#room-name');
        const housePlanContainer = $('#house-plan-container');
        housePlanContainer.append(cells);
        const previewCells = $('.preview-cell');

        previewCells
            .on('mousemove', function (event) {
                const mouseX = event.pageX - roomContainer.outerWidth();
                const mouseY = event.pageY - roomContainer.outerHeight();
                roomContainer.css("left", mouseX);
                roomContainer.css("top", mouseY);

                const hoveredColor = $(this).css("background-color");
                if (isRoom(hoveredColor)) {
                    roomContainer
                        .empty()
                        .text(rooms.get(parseInt($(this).attr('data-value'), 10)));
                    const squareCount = $('.preview-cell').filter(function () {
                        return $(this).css("background-color") === hoveredColor;
                    }).length;
                    roomContainer
                        .append(`<div> sqm: ${squareCount / 4}<\div>`)
                        .show();
                } else {
                    // Hide the room name if the color is transparent
                    roomContainer.hide();
                }
            })
            .on('mouseover', changeCellColor(previewCells));
        $('#house-sqm').text(previewCells.filter(function () {
            return isRoom($(this).css("background-color"));
        }).length / 4);
        housePlanContainer.on('mouseleave', function () {
            previewCells.removeClass('hovered-cell');
            roomContainer.hide();
        });

    }).fail((_) => {
        $('#slider-images').append(`<img data-value='0' src="images/placeholder.svg" class="selected-img" alt/>`);
    });
}