$(document).on('click', '#checkoutBtn', function(e) {
    e.preventDefault();
    
    const deliveryType = $('input[name="delivery"]:checked').val();
    
    // Валидация полей в зависимости от типа доставки
    if (deliveryType === 'pickup') {
        const name = $('#customerName').val().trim();
        const phone = $('#customerPhone').val().trim();
        const pickupDate = $('#pickupDate').val();
        const pickupTime = $('#selectedPickupTimeSlot').val();
        
        if (!name || !phone || !pickupDate || !pickupTime) {
            alert('Пожалуйста, заполните все обязательные поля для самовывоза');
            return;
        }
    } else {
        const name = $('#customerNameDelivery').val().trim();
        const phone = $('#customerPhoneDelivery').val().trim();
        const address = $('#deliveryAddress').val().trim();
        const deliveryDate = $('#deliveryDate').val();
        const deliveryTime = $('#selectedDeliveryTimeSlot').val();
        
        if (!name || !phone || !address || !deliveryDate || !deliveryTime) {
            alert('Пожалуйста, заполните все обязательные поля для доставки');
            return;
        }
    }
    
    // Сбор данных
    const formData = {
        delivery: deliveryType,
        name: deliveryType === 'pickup' ? $('#customerName').val().trim() : $('#customerNameDelivery').val().trim(),
        phone: deliveryType === 'pickup' ? $('#customerPhone').val().trim() : $('#customerPhoneDelivery').val().trim(),
        comment: deliveryType === 'pickup' ? $('#orderComment').val().trim() : $('#orderCommentDelivery').val().trim(),
        address: deliveryType === 'delivery' ? $('#deliveryAddress').val().trim() : '',
        pickup_date: deliveryType === 'pickup' ? $('#pickupDate').val() : '',
        pickup_time: deliveryType === 'pickup' ? $('#selectedPickupTimeSlot').val() : '',
        delivery_date: deliveryType === 'delivery' ? $('#deliveryDate').val() : '',
        delivery_time: deliveryType === 'delivery' ? $('#selectedDeliveryTimeSlot').val() : ''
    };
    
    // Показываем индикатор загрузки
    $('#loadingOverlay').show();
    function updateCartItemPrice(id) {
    const $item = $('.cart-item[data-id="'+id+'"]');
    const qty = parseInt($item.find('.cart-item-qty').text()) || 1;
    const isBouquet = $item.hasClass('bouquet');
    const isSet = $item.hasClass('set');

    let totalPrice = 0;

    if (isBouquet) {
        // Букет — цена по базе + допы
        const basePrice = parseFloat($item.data('base-price')) || 0;
        let addons = 0;
        $item.find('.addon-checkbox:checked').each(function(){
            addons += parseFloat($(this).data('price')) || 0;
        });
        totalPrice = (basePrice + addons) * qty;
    } else if (isSet) {
        // Набор — цена берём из выбранного option
        const selectedOption = $item.find('.berry-qty-select option:selected');
        const berryPrice = parseFloat(selectedOption.data('price')) || 0;

        let addons = 0;
        $item.find('.addon-checkbox:checked').each(function(){
            addons += parseFloat($(this).data('price')) || 0;
        });

        totalPrice = (berryPrice + addons) * qty;
    } else {
        // Обычные товары
        const basePrice = parseFloat($item.data('base-price')) || 0;
        const berryQty = parseInt($item.find('.berry-qty-select').val()) || 9;
        const berryCost = Math.max(0, berryQty - 9) * 60;

        let addons = 0;
        $item.find('.addon-checkbox:checked').each(function(){
            addons += parseFloat($(this).data('price')) || 0;
        });

        totalPrice = (basePrice + berryCost + addons) * qty;
    }

    $item.find('.cart-item-price')
        .text(totalPrice.toLocaleString('ru-RU') + ' ₽')
        .data('price', totalPrice);

    updateOrderTotals();
}

// Вызываем при изменении количества ягод
$(document).on('change', '.berry-qty-select', function(){
    const id = $(this).closest('.cart-item').data('id');
    updateCartItemPrice(id);
});

    // Отправляем данные
    $.ajax({
        url: 'php/checkout.php',
        type: 'POST',
        data: { order: JSON.stringify(formData) },
        dataType: 'json',
        success: function(response) {
            $('#loadingOverlay').hide();
            
            if (response.status === 'success') {
                // Показываем сообщение об успехе
                $('#successMessage').html(`
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h3>Заказ успешно оформлен!С вами свяжется наш менеджер для подтверждения.</h3>
                        <p>С вами свяжется наш менеджер для подтверждения.</p>
                    </div>
                `).show();
                
                // Очищаем корзину и перезагружаем через 3 секунды
                setTimeout(function() {
                    window.location.href = 'cart.php';
                }, 3000);
            } else {
                $('#errorMessage').html(`
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <h3>Ошибка оформления заказа</h3>
                        <p>${response.message}</p>
                    </div>
                `).show();
            }
        },
        error: function() {
            $('#loadingOverlay').hide();
            $('#errorMessage').html(`
                <i class="fas fa-exclamation-circle"></i>
                <div>
                    <h3>Ошибка соединения</h3>
                    <p>Не удалось соединиться с сервером. Пожалуйста, попробуйте позже.</p>
                </div>
            `).show();
        }
    });
});