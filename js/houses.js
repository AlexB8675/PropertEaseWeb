$(document).ready(function(){
    $('#slider-nav i').on('mousedown', function () {
        $('#slider-nav').css('pointer-events', 'none');
        let current_pic = $('.selected-img');
        let slider_size = $('#slider-images').children().length;
        let direction = $(this).index() ? 1 : -1;
        let next_pic_index = (current_pic.index() + direction + slider_size) % slider_size + 1;
        let next_pic = $(`#slider-images img:nth-child(${next_pic_index})`);

        next_pic.css('left', `${direction * 100}%`);
        next_pic.addClass('selected-img');
        current_pic.addClass('prev-img');
        current_pic.removeClass('selected-img');
        next_pic.animate({'left': 0}, 350, 'swing', function (){
            next_pic.css('left', ``);
            current_pic.removeClass('prev-img');
            $('#slider-nav').css('pointer-events', '');
        });
    });
});