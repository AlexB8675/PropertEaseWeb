$(() => {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator
            .serviceWorker
            .register('./js/sw.js')
            .then((registration) => {
                console.log('Service Worker Registered');
            });
    }

    $('#select-search-type-vendita')
        .on('click', () => {
            $('#select-search-type-arrow-container')
                .css('transform', 'translate(-36px)');
        });
    $('#select-search-type-affitto')
        .on('click', () => {
            $('#select-search-type-arrow-container')
                .css('transform', 'translate(32px)');
        });
    $('#search-bar-main')
        .on('keydown', (event) => {
            if (event.code === 'Enter') {
                event.preventDefault();
            }
        });
});
