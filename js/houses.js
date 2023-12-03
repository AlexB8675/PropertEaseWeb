$(document).ready(() => {
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
});
