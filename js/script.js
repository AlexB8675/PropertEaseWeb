class Storage {
    static set(x, key, value) {
        x.setItem(key, value);
    }

    static get(x, key) {
        return x.getItem(key);
    }

    static has(x, key) {
        return x.getItem(key) !== null;
    }

    static remove(x, key) {
        x.removeItem(key);
    }

    static clear(x) {
        x.clear();
    }

    static asJsonString(x) {
        return JSON.stringify(x);
    }

    static asJson(x) {
        return JSON.parse(this.asJsonString(x));
    }
}

class SessionStorage extends Storage {
    static set(key, value) {
        super.set(window.sessionStorage, key, value);
    }

    static get(key) {
        return super.get(window.sessionStorage, key);
    }

    static has(key) {
        return super.has(window.sessionStorage, key);
    }

    static remove(key) {
        super.remove(window.sessionStorage, key);
    }

    static clear() {
        super.clear(window.sessionStorage);
    }

    static asJsonString(x) {
        return super.asJsonString(window.sessionStorage, x);
    }

    static asJson(x) {
        return super.asJson(window.sessionStorage, x);
    }
}

class LocalStorage extends Storage {
    static set(key, value) {
        super.set(window.localStorage, key, value);
    }

    static get(key) {
        return super.get(window.localStorage, key);
    }

    static has(key) {
        return super.has(window.localStorage, key);
    }

    static remove(key) {
        super.remove(window.localStorage, key);
    }

    static clear() {
        super.clear(window.localStorage);
    }

    static asJsonString(x) {
        return super.asJsonString(window.localStorage, x);
    }

    static asJson(x) {
        return super.asJson(window.localStorage, x);
    }
}

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

async function makeLoginRequest(info, callbacks) {
    if (info.username === '' || info.password === '') {
        return;
    }
    return await $.ajax({
        url: makeEndpointWith(`/api/login/${info.type}`),
        method: 'post',
        cache: false,
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

function imagesFromHousePlan(house) {
    const images = new Map();
    for (const { cellId, imageId } of house.indices) {
        images.set(cellId, house.images[imageId]);
    }
    return images;
}

function getUrlParameters() {
    return new URLSearchParams(window.location.search);
}

function getLoggedUser() {
    if (SessionStorage.has('user')) {
        const user = JSON.parse(SessionStorage.get('user')).user;
        user.permissions = BigInt(user.permissions);
        return user;
    }
    return null;
}

function isUserAdmin(user) {
    return user && (user.permissions & 0x80000000n) === 0x80000000n;
}

$(document).ready(function () {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator
            .serviceWorker
            .register('./js/sw.js')
            .then((registration) => {
                console.log('Service Worker Registered');
            });
    }

    const loggedUser = getLoggedUser();
    const signinButton = $('#header-button-container > i[class~="fa-user"]');
    const signoutButton = $('#header-button-container > i[class~="fa-sign-out"]');
    if (loggedUser) {
        signinButton.css({
            'display': 'none',
        });
        $('#header-button-container')
            .prepend($('<a class="fas fa-tools" href="./tool.html">'))
            .prepend($('<label class="username">').text(`Welcome, ${loggedUser.username}`));
    } else {
        signoutButton.css({
            'display': 'none',
        });
    }

    const loginContainer = $('#login');
    const blurContainer = $('.blur');
    signinButton
        .on('click', () => {
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
                    blurContainer
                        .css({
                            'opacity': '0',
                            'pointer-events': 'none',
                        })
                        .off('mousedown');
                });
        });

    $('#close').on('mousedown', function (event) {
        blurContainer.trigger('mousedown');
    });

    signoutButton
        .on('click', () => {
            SessionStorage.clear();
            window.location.reload();
        });
    $('#login-form').on('submit', (event) => {
        event.preventDefault();
    });
    $('#login-form > input').on('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            $('#login-button').trigger('click');
        }
    });
    $('#login-button').on('click', async () => {
        const username = $('#login-username-input').val();
        const password = $('#login-password-input').val();
        await makeLoginRequest({
            username: username,
            password: password,
            type: 'signin',
        }, {
            done: (data) => {
                $('#login-username-input').val('');
                $('#login-password-input').val('');
                $('#login-status-info')
                    .css({
                        'color': 'green',
                    })
                    .text('Login Successful');
                SessionStorage.set('user', JSON.stringify(data));
                setTimeout(() => {
                    $('#login-status-info').text('');
                    window.location.reload();
                }, 500);
            },
            error: (_) => {
                $('#login-status-info')
                    .css({
                        'color': 'red',
                    })
                    .text('Login Failed: Wrong username or password');
                setTimeout(() => {
                    $('#login-status-info').text('');
                }, 1000);
            }
        });
    });
    $('#register-button').on('click', async () => {
        const username = $('#login-username-input').val();
        const password = $('#login-password-input').val();
        await makeLoginRequest({
            username: username,
            password: password,
            type: 'signup',
        }, {
            done: (_) => {
                $('#login-status-info')
                    .css({
                        'color': 'green',
                    })
                    .text('Registration Successful: Please login');
                setTimeout(() => {
                    $('#login-status-info').text('');
                }, 500);
            },
            error: (error) => {
                console.error(error);
            }
        });
    });
});
