$(document).ready(() => {
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
    $.ajax({
        url: makeEndpointWith(`/api/data/houses/id/${houseId}`),
        method: 'get',
        dataType: 'json',
    }).done((response) => {
        const house = response[0];
        console.log(house);
        const houseImages = imagesFromJson(JSON.parse(house.images));
        const sliderImages = $('#slider-images');
        if (houseImages.size === 0) {
            sliderImages.append(`<img data-value='0' src="images/placeholder.svg" class="selected-img" alt/>`);
        } else {
            const uniqueImages = [...new Set(Array.from(houseImages.values()))];
            for (const [index, image] of uniqueImages.entries()) {
                sliderImages.append(`<img data-value='${index}' src="${image}" class="${index === 0 ? 'selected-img' : ''}" alt/>`);
            }
        }
        $('#house-address').text(`${house.city}, ${house.address}, ${house.cap}`);
        $('#house-floor').text(house.floor);
        $('#house-elevator').text(house.elevator ? 'Yes' : 'No');
        $('#house-balcony').text(house.balconies);
        $('#house-terrace').text(house.terrace);
        $('#house-garden').text(house.garden);
        $('#house-accessories').text(house.accessories);
        $('#house-bedrooms').text(house.bedrooms);
        $('#house-sqm').text(0);
        $('#house-description').text(house.description);
    });
});
