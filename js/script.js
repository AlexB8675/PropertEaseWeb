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
    const endpoint = 'http://localhost:8080';
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
});