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

    $.ajax({
        url: 'http://localhost:8080/api/data/houses',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('.card-container > .wrapper');
        const cardTemplate = (title, city, address, postalCode) => `
            <div class="card">
                <div class="image"></div>
                <div class="content">
                    <div class="title">${title}</div>
                    <div class="text">${city}</div>
                    <div class="text">${address}</div>
                    <div class="text">${postalCode}</div>
                </div>
            </div>
        `.trim();

        for (const house of data) {
            const card = $(
                cardTemplate(
                    house.id,
                    house.city,
                    house.address,
                    house.cap
                )
            );
            mainCardContainer.append(card);
        }
    });
});
