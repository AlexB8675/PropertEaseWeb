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

    const selectorSale = $('#selector-sale');
    const selectorRent = $('#selector-rent');
    const selector = $('#selector');
    selector.html(selectorSale.html());
    selectorSale
        .on('click', () => {
            selector
                .css({
                    'transform': 'translateX(0)',
                });
            setTimeout(() => {
                selector.html(selectorSale.html());
            }, 250);
        });
    selectorRent
        .on('click', () => {
            const offsetSale = selectorSale.offset();
            const offsetRent = selectorRent.offset();
            selector
                .css({
                    'transform': `translateX(${Math.abs(offsetSale.left - offsetRent.left)}px)`,
                });
            setTimeout(() => {
                selector.html(selectorRent.html());
            }, 250);
        });
    const loginContainer = $('#login');
    const blurContainer = $('.blur');
    $('#header > i').on('click', () => {
        loginContainer
            .css({
                'opacity': 1,
                'visibility': 'visible',
            });
        blurContainer
            .css({
                'opacity': 1,
                'pointer-events': 'all',
            })
            .on('mousedown', function (event) {
                if (event.target !== this) {
                    return;
                }
                loginContainer.css({
                    'opacity': 0,
                    'visibility': 'hidden',
                });
                blurContainer.css({
                    'opacity': '0',
                    'pointer-events': 'none',
                });
            });
    });
    $('#login-form').on('submit', (event) => {
        event.preventDefault();
    });
    $('#login-button').on('click', () => {
        const username = $('#login-username-input').val();
        const password = $('#login-password-input').val();
        makeLoginRequest({
            username: username,
            password: password,
            type: 'signin',
        }, {
            done: (data) => {
                console.log(data);
            },
            error: (error) => {
                console.error(error);
            }
        }).then(() => {
            $('#login-username-input').val('');
            $('#login-password-input').val('');
        });
    });
    $('#register-button').on('click', () => {
        const username = $('#login-username-input').val();
        const password = $('#login-password-input').val();
        makeLoginRequest({
            username: username,
            password: password,
            type: 'signup',
        }, {
            done: (data) => {
                console.log(data);
            },
            error: (error) => {
                console.error(error);
            }
        }).then(() => {
            $('#login-username-input').val('');
            $('#login-password-input').val('');
        });
    });

    $.ajax({
        url: makeEndpointWith('/api/data/houses'),
        method: 'get',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('#card-container > div');
        const cardTemplate = (address, city, cap, contract, price, image, type) => `
            <div class="card">
                <div class="image">
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
                        .css({ 'transform': 'translateZ(0) scale(1.05)' })
                        .addClass('shimmer-effect');
                    parent.css({ 'background': 'aliceblue' });
                    clearTimeout(mouseOverTimeout);
                    mouseOverTimeout = setTimeout(() => {
                        parent.css({ 'background': '' });
                        mouseOverTimeout = -1;
                    }, 500);
                })
                .on('mouseleave', () => {
                    cardImage
                        .css({ 'transform': 'translateZ(0) scale(1.10)' })
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
                    card.css('transform', 'perspective(600px) translateZ(0) scale(1) rotateX(0) rotateY(0)');
                })
                .on('mousedown', () => {
                    card.css('transform', 'perspective(600px) translateZ(0) scale(0.98) rotateX(0) rotateY(0)');
                })
                .on('mouseup', () => {
                    card.css('transform', 'perspective(600px) translateZ(0) scale(1.02) rotateX(0) rotateY(0)');
                });
            mainCardContainer.append(card);
        }
    });
});
