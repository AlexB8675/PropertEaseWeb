$(document).ready(function () {

    $('#card-container').on('mousemove', function(e) {
        let x = e.pageX - this.offsetLeft;
        let y = e.pageY - this.offsetTop + $('#scroller').scrollTop();
        $(this).css('background', `radial-gradient(ellipse 450pt 450pt at ${x}px ${y}px, #323232 0%, #242424 100%`);
    });

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

    $.ajax({
        url: makeEndpointWith('/api/data/houses'),
        method: 'get',
        dataType: 'json',
    }).done((data) => {
        const mainCardContainer = $('#cards');
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
