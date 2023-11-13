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
                .css('transform', 'translate(-26px)');
        });
    $('#select-search-type-affitto')
        .on('click', () => {
            $('#select-search-type-arrow-container')
                .css('transform', 'translate(30px)');
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
                    });
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
        const cardTemplate = (address, city, cap, contract, price, image, type) => `
            <div class="card">
                <div>
                    <img draggable="false" src="${image}" alt>
                    <div class="generic-triangle"></div>
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
                    house.image,
                    house.e_type
                )
            );
            const cardImage = card.find('img');
            let mouseOverTimeout = -1;
            card
                .on('mouseover', () => {
                    if (mouseOverTimeout !== -1) {
                        clearTimeout(mouseOverTimeout);
                    }
                    const parent = cardImage.parent();
                    cardImage
                        .css({ 'transform': 'translateZ(0) scale(1)' })
                        .addClass('shimmer-effect');
                    parent.css({ 'background': 'aliceblue' });
                    mouseOverTimeout = setTimeout(() => {
                        parent.css({ 'background': '' });
                        mouseOverTimeout = -1;
                    }, 500);
                })
                .on('mouseleave', () => {
                    cardImage
                        .css({ 'transform': 'translateZ(1px) scale(1.05)' })
                        .removeClass('shimmer-effect');
                })
                .on('mousemove', (event) => {
                    const height = card.height();
                    const width = card.width();
                    const xVal = 2 * event.offsetX;
                    const yVal = 2 * event.offsetY;

                    const yRotation = 2 * ((xVal - width / 2) / width);
                    const xRotation = -2 * ((yVal - height / 2) / height);

                    const rotationString = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
                    const transformString = `perspective(600px) translateZ(0) scale(1.02) ${rotationString}`;
                    card.css('transform', transformString);
                })
                .on('mouseout', () => {
                    card.css('transform', 'perspective(600px) translateZ(1px) scale(1) rotateX(0) rotateY(0)');
                })
                .on('mousedown', () => {
                    card.css('transform', 'perspective(600px) translateZ(1px) scale(0.98) rotateX(0) rotateY(0)');
                })
                .on('mouseup', () => {
                    card.css('transform', 'perspective(600px) translateZ(1px) scale(1.02) rotateX(0) rotateY(0)');
                });
            mainCardContainer.append(card);
        }
    });
});