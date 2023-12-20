function renderCards(ids, contract){
    showLoader();
    $.ajax({
        url: makeEndpointWith('/api/data/houses/main'),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((data) => {
        const mainCardContainer = $('#cards');
        mainCardContainer.empty();
        const cardTemplate = (id, address, city, cap, contract, price, image, type) => `
            <a class="card" href="house.html?id=${id}">
                <div class="image">
                    <div class="generic-triangle"></div>
                    <img draggable="false" src="${image}" alt="placeholder.svg">
                </div>
                <div class="content">
                    <label class="contract">${type + " for " + ((contract) ? "Rent" : "Sale")}</label>
                    <label class="address">${city} ${cap}</label>
                    <label class="address">${address}</label>
                    <label class="price">${makePriceAsCurrency(price)}${((contract) ? "/Month" : "")}</label>
                </div>
            </a>
        `.trim();

        for (const { id, plan: house } of data) {
            if (ids && !ids.find((element) => {
                return element === id;
            })) {
                continue;
            }
            if (contract === null) {
                contract = house.info.contract;
            }
            if (house.info.contract !== contract) {
                continue;
            }
            const images = imagesFromHousePlan(house);
            const mainImage = images.has(0) ? images.get(0).data : 'images/placeholder.svg';
            const card = $(
                cardTemplate(
                    id,
                    house.info.address,
                    house.info.city,
                    house.info.zip,
                    contract,
                    house.info.price,
                    mainImage,
                    house.info.house
                )
            );
            const cardImage = card.find('img');
            let mouseOverTimeout = -1;
            card
                .on('mouseover', () => {
                    cardImage
                        .css({'transform': 'translateZ(0) scale(1.05)'})
                        .addClass('shimmer-effect');
                    clearTimeout(mouseOverTimeout);
                    mouseOverTimeout = setTimeout(() => {
                        mouseOverTimeout = -1;
                    }, 500);
                })
                .on('mouseleave', () => {
                    cardImage
                        .css({'transform': 'translateZ(0) scale(1.10)'})
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
        hideLoader();
    });
}

function searchQuery(search){
    showLoader();
    $.ajax({
        url: makeEndpointWith(`/api/data/houses/city/${search}`),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((data) => {
        renderCards(data, null);
    }).fail(() => {
        renderCards(null, null);
    });
}

$(document).ready(function () {
    $('#card-container').on('mousemove', function (event) {
        const x = event.pageX - this.offsetLeft;
        const y = event.pageY - this.offsetTop + $('#scroller').scrollTop();
        $(this).css('background', `radial-gradient(ellipse 450pt 450pt at ${x}px ${y}px, #323232 0%, #242424 100%`);
    });

    const selectorSale = $('#selector-sale');
    const selectorRent = $('#selector-rent');
    const selector = $('#selector');
    selector.html(selectorSale.html());
    selectorSale
        .on('click', function () {
            selector
                .css({
                    'transform': 'translateX(0)',
                });
            setTimeout(() => {
                selector.html(selectorSale.html());
            }, 250);
            renderCards(null, parseInt($(this).data('value')));
        });
    selectorRent
        .on('click', function () {
            const offsetSale = selectorSale.offset();
            const offsetRent = selectorRent.offset();
            selector
                .css({
                    'transform': `translateX(${Math.abs(offsetSale.left - offsetRent.left)}px)`,
                });
            setTimeout(() => {
                selector.html(selectorRent.html());
            }, 250);
            renderCards(null, parseInt($(this).data('value')));
        });

    $("#search-field").on('keydown', function (event){
        if (event.which === 13) {
            searchQuery($(this).val());
        }
    });
    $("label[for='search-field']").on('mousedown', function() {
        searchQuery($("#search-field").val());
    });

    selectorSale.trigger('click');
});
