function makePriceAsCurrency(price) {
    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });
}

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
    $('#user-login-button').on('click', () => {
        $('.login')
            .css({
                'visibility': 'visible',
                'background': '#181818c0',
            })
            .on('click', function (event) {
                if (event.target !== this) {
                    return;
                }
                $(this)
                    .css({
                        'visibility': 'hidden',
                        'background': '#16161600',
                    })
                    .children('.main')
                    .css({
                        'background': '#20202000',
                    })
            })
            .children('.main')
            .css({
                'background': '#202020ff',
            });
    });

    $.ajax({
        url: 'http://93.41.228.90:8080/api/data/houses',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('.card-container > .wrapper');
        const cardTemplate = (address, city, cap, contract, price, type) => `
            <div class="card tilt">
                <div style="background-color: aliceblue">
                    <img draggable="false" src="images/Houses/Frontal/${Math.floor(Math.random()*535)+1}_frontal.jpg" alt="images/placeholder.svg">
                    <div class="triangle"></div>
                </div>
                <div class="content">
                    <div class="text">${type + " for " + ((contract) ? "Sale" : "Rent")}</div>
                    <div class="text address">${city + " " + cap + ", " + address}</div>
                    <div class="text price">${makePriceAsCurrency(price)}</div>
                </div>
            </div>
        `.trim();

        for (const house of data) {
            const card = $(
                cardTemplate(
                    house.address,
                    house.city,
                    house.cap,
                    house.contract,
                    house.price,
                    house.e_type
                )
            );
            mainCardContainer.append(card);
        }
    });
});