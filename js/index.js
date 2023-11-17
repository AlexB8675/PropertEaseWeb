function makeEndpointWith(uri) {
    const endpoint = 'http://93.41.228.90:8080';
    return `${endpoint}${uri}`;
}

function makePriceAsCurrency(price) {
    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });
}

function makeLoginRequest(info, callbacks) {
    if (info.username === '' || info.password === '') {
        return;
    }
    return $.ajax({
        url: makeEndpointWith(`/api/login/${info.type}`),
        method: 'post',
        data: {
            username: info.username,
            password: info.password,
        },
    }).done(callbacks.done ?? ((data) => {
        return data;
    })).fail(callbacks.error ?? ((error) => {
        return error;
    }));
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

    $.ajax({
        url: makeEndpointWith('/api/data/houses'),
        method: 'get',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('#cards');
        const cardTemplate = (address, city, cap, contract, price, image, type) => `
            <div class="card">
                <div class="img-container">
                    <img draggable="false" src="${image}" alt="placeholder.svg">
                </div>
                <div class="generic-triangle"></div>
                <div class="content">
                    <label class="contract">${type + " for " + ((contract) ? "Sale" : "Rent")}</label>
                    <label class="address">${city + " " + cap + ", " + address}</label>
                    <label class="price">${makePriceAsCurrency(price)}</label>
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
                    const parent = cardImage.parent();
                    cardImage
                        .css({'transform': 'translateZ(0) scale(1.05)'})
                        .addClass('shimmer-effect');
                    parent.css({'background': 'aliceblue'});
                    clearTimeout(mouseOverTimeout);
                    mouseOverTimeout = setTimeout(() => {
                        parent.css({'background': ''});
                        mouseOverTimeout = -1;
                    }, 500);
                })
                .on('mouseleave', () => {
                    cardImage
                        .css({'transform': 'translateZ(1px) scale(1.10)'})
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

        if (mainCardContainer.length === 0) {
            $('#cards').children('label').removeClass('hidden');
        } else {
            $('#cards').children('label').addClass('hidden');
        }
    });

    $('.blur').on('click', function (){
        hideLogin();
    })
});

function shift_slider(direction) {
    if (direction === 'l') {
        $('#selector').css('transform', 'translate(80px)');
    } else {
        $('#selector').css('transform', 'translate(2px)');
    }
}

function showLogin() {
    const login = $('#login');
    const blur = $('#blur');
    login.css('opacity', 1);
    login.css('pointer-events', 'all');
    blur.css('opacity', 1);
    blur.css('pointer-events', 'all');
}

function hideLogin() {
    setTimeout(function() {
        const login = $('#login');
        const blur = $('#blur');
        login.css('opacity', 0);
        login.css('pointer-events', 'none');
        blur.css('opacity', 0);
        blur.css('pointer-events', 'none');
    }, 1);
}