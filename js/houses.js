$(document).ready(function(){
    $('#slider-nav i').on('mousedown', function () {
        let current_pic = $('.selected-img');
        let slider_size = $('#slider-images').children().length;
        let direction = $(this).index() ? 1 : -1;
        let next_pic_index = (current_pic.index() + direction + slider_size) % slider_size + 1;

        current_pic.removeClass('selected-img');
        $(`#slider-images img:nth-child(${next_pic_index})`).addClass('selected-img');
    });
});