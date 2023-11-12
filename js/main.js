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
        url: 'http://93.41.228.90:8080/api/data/houses',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('.card-container > .wrapper');
        const cardTemplate = (address, city, cap, contract, price, e_type) => `
            <div class="card tilt">
                <div style="background-color: aliceblue">
                    <img draggable="false" src="images/Houses/Frontal/${Math.floor(Math.random()*535)+1}_frontal.jpg" alt="images/placeholder.svg">
                    <div class="triangle"></div>
                </div>
                <div class="content">
                    <div class="text">${e_type + " for " + ((contract) ? "sale" : "rent")}</div>
                    <div class="text address">${city + " " + cap + ", " + address}</div>
                    <div class="text price">${price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</div>
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
            ).mouseover(function (){
                $(this).find('img').css('transform', 'scale(1)').addClass("shimmer-effect");
            }).mouseleave(function() {
                $(this).find('img').css('transform', 'scale(1.05)').removeClass("shimmer-effect");
            });
            mainCardContainer.append(card);
        }

        $('.card').each(function() {
            const el = $(this);
            const height = el.height();
            const width = el.width();

            el.on('mousemove', function(e) {
                const xVal = e.offsetX;
                const yVal = e.offsetY;

                const yRotation = 2 * ((xVal - width / 2) / width);
                const xRotation = -2 * ((yVal - height / 2) / height);

                const transformString = 'perspective(500px) scale(1.02) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';
                el.css('transform', transformString);
            });

            el.on('mouseout', function() {
                el.css('transform', 'perspective(500px) scale(1) rotateX(0) rotateY(0)');
            });

            el.on('mousedown', function() {
                el.css('transform', 'perspective(500px) scale(0.98) rotateX(0) rotateY(0)');
            });

            el.on('mouseup', function() {
                el.css('transform', 'perspective(500px) scale(1.02) rotateX(0) rotateY(0)');
            });
        });
    });
});