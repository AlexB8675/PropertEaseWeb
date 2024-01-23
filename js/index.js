function renderCards(ids, contract) {
    // Hide the page with a loader until all the functions are run
    showLoader();

    // Make an AJAX request to retrieve the house info to be shown in the cards
    $.ajax({
        url: makeEndpointWith('/api/data/houses/main'),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((data) => {
        const mainCardContainer = $('#cards');

        // Empty the container to allow different results when filters are to be applied
        mainCardContainer.empty();

        // Definition of the card html body
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
        `;

        // Appends the cards to the container
        for (const { id, plan: house } of data) {

            // If the cards are filtered, check if the card has to be rendered
            if (ids && !ids.find((element) => {
                return element === id;
            })) {
                continue;
            }

            // If no house contract is specified, defaults to "sale"
            if (contract === null) {
                contract = $('#selector-sale').data('value');
            }

            // If the house contract is filtered, only render accordingly
            if (house.info.contract !== contract) {
                continue;
            }

            const images = imagesFromHousePlan(house);

            // If the house has a cover image, apply it, else, show a placeholder
            const mainImage = images.has(0) ? images.get(0).data : 'images/placeholder.svg';

            // Apply the gathered info to create a card according to the previously defined template
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

            // Stops the shimmer animation if the mouse leaves the card
            let mouseOverTimeout = -1;

            // Adds all the events to the card container
            card
                // Apply the shimmer effect on mouse hover
                .on('mouseover', () => {
                    cardImage
                        .css({'transform': 'translateZ(0) scale(1.05)'})
                        .addClass('shimmer-effect');
                    clearTimeout(mouseOverTimeout);
                    mouseOverTimeout = setTimeout(() => {
                        mouseOverTimeout = -1;
                    }, 500);
                })
                // Stops the shimmer effect on mouse leave
                .on('mouseleave', () => {
                    cardImage
                        .css({'transform': 'translateZ(0) scale(1.10)'})
                        .removeClass('shimmer-effect');
                })
                // Apply the 3D effect on mouse hover
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
                // Stops the 3D effect on mouse leave
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

        // Once everything has been rendered, remove the loader
        hideLoader();
    });
}

// Sends AJAX requetso to query the databes according to the searchbar content
function searchQuery(search) {
    $.ajax({
        url: makeEndpointWith(`/api/data/houses/city/${search}`),
        method: 'get',
        dataType: 'json',
        cache: false,
    }).done((data) => {
        // Renders cards with according filtes
        renderCards(data, null);
    }).fail(() => {
        // If the query fails, display all the cards
        renderCards(null, null);
    });
}

$(document).ready(function () {

    // Gradient around mouse position in the scroller
    $('#card-container').on('mousemove', function (event) {

        // Get the x and y position relative to the scroller div
        const x = event.pageX - this.offsetLeft;
        const y = event.pageY - this.offsetTop + $('#scroller').scrollTop();

        // Apply the gradient background centered on the mouse position
        $(this).css('background', `radial-gradient(ellipse 450pt 450pt at ${x}px ${y}px, #323232 0%, #242424 100%`);
    });

    // Render the line under the "Sale" and "Rent" filters
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

    // Calls the AJAX function to filter cards when pressing ENTER
    $("#search-field").on('keydown', function (event) {
        if (event.which === 13) {
            searchQuery($(this).val());
        }
    });

    // Calls the AJAX function to filter cards when clicking on the magnifying glass
    $("label[for='search-field']").on('mousedown', function () {
        searchQuery($("#search-field").val());
    });

    // Defaults to "Sale" filter when first rendering
    selectorSale.trigger('click');
});
