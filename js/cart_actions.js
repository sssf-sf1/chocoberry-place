$(function() {
    // Массив фиксированных цен для ягод
    const BERRY_PRICES = {
        3: 565,
        4: 745,
        6: 1115,
        8: 1475,
        9: 1710,
        12: 2210,
        16: 2950,
        18: 3310,
        20: 3670,
        25: 4600,
        30: 5500
    };

    /* ================= DELIVERY TOGGLE ================= */
    function toggleDeliveryFields() {
        const method = $('input[name="delivery"]:checked').val();

        if (method === 'delivery') {
            $('#deliveryFields').show().find('input, textarea').prop('readonly', false).prop('required', true);
            $('#pickupFields').hide().find('input, textarea').prop('readonly', true).prop('required', false);
        } else {
            $('#pickupFields').show().find('input, textarea').prop('readonly', false).prop('required', true);
            $('#deliveryFields').hide().find('input, textarea').prop('readonly', true).prop('required', false);
        }
    }
    
    // Удаляем дублирующийся вызов, так как он уже есть в cart.php
    // $('input[name="delivery"]').on('change', toggleDeliveryFields);
    // toggleDeliveryFields();

    /* ================= UPDATE PRICES ================= */
    function updateCartItemPrice(id) {
        const $item = $('.cart-item[data-id="' + id + '"]');
        if ($item.length === 0) return;

        const qty = parseInt($item.find('.cart-item-qty').text()) || 1;
        const isBouquet = $item.hasClass('bouquet');
        let totalPrice = 0;

        if (isBouquet) {
            // Букет — цена фиксированная
            const basePrice = parseFloat($item.data('base-price')) || 0;
            let addons = 0;
            $item.find('.addon-checkbox:checked').each(function() {
                addons += parseFloat($(this).data('price')) || 0;
            });
            totalPrice = (basePrice + addons) * qty;
        } else {
            // Набор — цена из выбранного количества ягод
            const $select = $item.find('.berry-qty-select');
            const berryQty = parseInt($select.val()) || 9;
            const selectedOption = $select.find('option:selected');
            const berryPrice = parseFloat(selectedOption.data('price')) || BERRY_PRICES[berryQty] || 1710;
            
            let addons = 0;
            $item.find('.addon-checkbox:checked').each(function() {
                addons += parseFloat($(this).data('price')) || 0;
            });
            
            totalPrice = (berryPrice + addons) * qty;
        }

        $item.find('.cart-item-price')
            .text(totalPrice.toLocaleString('ru-RU') + ' ₽')
            .data('price', totalPrice);
    }

    function updateOrderTotals() {
        let itemsTotal = 0;
        let addonsTotal = 0;

        $('.cart-item').each(function() {
            const $item = $(this);
            const price = parseFloat($item.find('.cart-item-price').data('price')) || 0;
            itemsTotal += price;

            $item.find('.addon-checkbox:checked').each(function() {
                const addonPrice = parseFloat($(this).data('price')) || 0;
                const qty = parseInt($item.find('.cart-item-qty').text()) || 1;
                addonsTotal += addonPrice * qty;
            });
        });

        const deliveryCost = $('input[name="delivery"]:checked').val() === 'delivery' ? 350 : 0;
        const orderTotal = itemsTotal + deliveryCost;

        $('#itemsTotal').text(itemsTotal.toLocaleString('ru-RU') + ' ₽');
        $('#addonsTotal').text(addonsTotal.toLocaleString('ru-RU') + ' ₽');
        $('#deliveryCost').text(deliveryCost.toLocaleString('ru-RU') + ' ₽');
        $('#orderTotal').text(orderTotal.toLocaleString('ru-RU') + ' ₽');
    }

    /* ================= CART EVENTS ================= */
    $(document).on('change', '.berry-qty-select, .addon-checkbox', function() {
        const id = $(this).closest('.cart-item').data('id');
        updateCartItemPrice(id);
        saveCartChanges(id);
        updateOrderTotals();
    });

    $(document).on('change', '.addon-checkbox[data-addon="mold"]', function() {
        const id = $(this).data('id');
        $('#mold_selector_' + id).slideToggle($(this).is(':checked'));
        saveCartChanges(id);
    });

    $(document).on('change', 'input[name^="mold_type_"]', function() {
        const id = $(this).data('id');
        saveCartChanges(id);
    });

    $(document).on('click', '.qty-btn.plus, .qty-btn.minus', function() {
        const id = $(this).data('id');
        const action = $(this).hasClass('plus') ? 'plus' : 'minus';

        $.post('php/update_cart.php', { id, action }, function(res) {
            if (res.status === 'success') {
                $('.cart-item[data-id="' + id + '"]').find('.cart-item-qty').text(res.itemQty);
                updateCartItemPrice(id);
                updateOrderTotals();
                saveCartChanges(id);
            } else if (res.status === 'removed') {
                $('.cart-item[data-id="' + id + '"]').remove();
                updateOrderTotals();
                
                // Если корзина пуста, перезагружаем страницу
                if ($('.cart-item').length === 0) {
                    setTimeout(() => location.reload(), 300);
                }
            }
        }, 'json');
    });

    $(document).on('click', '.cart-delete', function() {
        const id = $(this).data('id');
        if (confirm('Удалить товар из корзины?')) {
            $.post('php/remove_from_cart.php', { id }, function(res) {
                if (res.status === 'success') {
                    $('.cart-item[data-id="' + id + '"]').remove();
                    updateOrderTotals();
                    
                    // Если корзина пуста, перезагружаем страницу
                    if ($('.cart-item').length === 0) {
                        setTimeout(() => location.reload(), 300);
                    }
                }
            }, 'json');
        }
    });

    /* ================= SAVE CART DETAILS ================= */
    function saveCartChanges(id) {
        const $item = $('.cart-item[data-id="' + id + '"]');
        if ($item.length === 0) return;

        const isBouquet = $item.hasClass('bouquet');

        if (isBouquet) {
            // Для букетов
            const addons = {};
            $item.find('.addon-checkbox').each(function() {
                addons[$(this).data('addon')] = $(this).is(':checked');
            });

            $.post('php/update_cart_details.php', {
                id: id,
                addons: JSON.stringify(addons)
            });
        } else {
            // Для наборов
            const berryQty = parseInt($item.find('.berry-qty-select').val()) || 9;
            const addons = {};
            $item.find('.addon-checkbox').each(function() {
                addons[$(this).data('addon')] = $(this).is(':checked');
            });
            const moldType = $item.find('input[name^="mold_type_' + id + '"]:checked').val() || 'heart';

            $.post('php/update_cart_details.php', {
                id: id,
                berry_qty: berryQty,
                addons: JSON.stringify(addons),
                mold_type: moldType
            });
        }
    }

    /* ================= CHECKOUT ================= */
    $('#checkoutBtn').click(function(e) {
        e.preventDefault();
        console.log('Checkout button clicked');

        const deliveryMethod = $('input[name="delivery"]:checked').val();
        console.log('Delivery method:', deliveryMethod);

        const customerName = deliveryMethod === 'delivery' 
            ? $('#customerNameDelivery').val().trim() 
            : $('#customerName').val().trim();
        const customerPhone = deliveryMethod === 'delivery' 
            ? $('#customerPhoneDelivery').val().trim() 
            : $('#customerPhone').val().trim();
        const address = deliveryMethod === 'delivery' 
            ? $('#deliveryAddress').val().trim() 
            : 'Самовывоз';
        const deliveryDate = deliveryMethod === 'delivery' 
            ? $('#deliveryDate').val() 
            : $('#pickupDate').val();
        const deliveryTime = deliveryMethod === 'delivery' 
            ? $('#selectedDeliveryTimeSlot').val() 
            : $('#selectedPickupTimeSlot').val();
        const comment = deliveryMethod === 'delivery' 
            ? $('#orderCommentDelivery').val().trim() 
            : $('#orderComment').val().trim();

        console.log('Customer data:', { customerName, customerPhone, address, deliveryDate, deliveryTime });

        // Валидация
        if (!customerName || !customerPhone) {
            alert('Введите имя и телефон');
            return;
        }

        if (!deliveryDate || !deliveryTime) {
            alert('Выберите дату и время');
            return;
        }

        if ($('.cart-item').length === 0) {
            alert('Корзина пуста');
            return;
        }

        // Собираем данные о товарах
        let items = [];
        $('.cart-item').each(function() {
            const $item = $(this);
            const id = $item.data('id');
            const qty = parseInt($item.find('.cart-item-qty').text());
            const price = parseFloat($item.find('.cart-item-price').data('price'));
            const isBouquet = $item.hasClass('bouquet');
            
            let itemData = {
                product_id: id,
                quantity: qty,
                price: price / qty, // цена за единицу
                is_bouquet: isBouquet
            };
            
            if (!isBouquet) {
                const berryQty = parseInt($item.find('.berry-qty-select').val()) || 9;
                const addons = {};
                $item.find('.addon-checkbox').each(function() {
                    const addon = $(this).data('addon');
                    addons[addon] = $(this).is(':checked') ? parseFloat($(this).data('price')) || 0 : 0;
                });
                const moldType = $item.find('input[name^="mold_type_' + id + '"]:checked').val() || 'heart';
                
                itemData.berry_qty = berryQty;
                itemData.addons = addons;
                itemData.mold_type = moldType;
            }
            
            items.push(itemData);
        });

        console.log('Items to order:', items);

        $('#checkoutBtn').prop('disabled', true).text('Оформление...');
        $('#loadingOverlay').show();

        $.ajax({
            url: 'php/create_order.php',
            type: 'POST',
            dataType: 'json',
            data: {
                customer_name: customerName,
                customer_phone: customerPhone,
                delivery_method: deliveryMethod,
                address: address,
                comment: comment,
                delivery_date: deliveryDate,
                delivery_time_slot: deliveryTime,
                items: JSON.stringify(items)
            },
            success: function(res) {
                console.log('Order response:', res);
                $('#loadingOverlay').hide();
                $('#checkoutBtn').prop('disabled', false).text('Оформить заказ');
                
                if (res.status === 'success') {
                    // Показываем сообщение об успехе
                    $('#successMessage').html(`
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h3>Заказ успешно оформлен!</h3>
                            <p>Номер вашего заказа: <strong>${res.order_id}</strong></p>
                            <p>С вами свяжется наш менеджер для подтверждения.</p>
                        </div>
                    `).show();
                    
                    // Очищаем корзину и перезагружаем через 3 секунды
                    setTimeout(function() {
                        window.location.href = 'account.php';
                    }, 3000);
                } else {
                    $('#errorMessage').html(`
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <h3>Ошибка оформления заказа</h3>
                            <p>${res.message || 'Неизвестная ошибка'}</p>
                        </div>
                    `).show();
                    
                    // Скрываем сообщение об ошибке через 5 секунд
                    setTimeout(function() {
                        $('#errorMessage').fadeOut();
                    }, 5000);
                }
            },
            error: function(xhr, status, error) {
                console.error('Order error:', xhr.responseText, status, error);
                $('#loadingOverlay').hide();
                $('#checkoutBtn').prop('disabled', false).text('Оформить заказ');
                
                $('#errorMessage').html(`
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <h3>Ошибка соединения</h3>
                        <p>Не удалось соединиться с сервером. Пожалуйста, попробуйте позже.</p>
                        <p>${error}</p>
                    </div>
                `).show();
                
                // Скрываем сообщение об ошибке через 5 секунд
                setTimeout(function() {
                    $('#errorMessage').fadeOut();
                }, 5000);
            }
        });
    });

    /* ================= INIT ================= */
    $('.cart-item').each(function() {
        updateCartItemPrice($(this).data('id'));
    });
    updateOrderTotals();
});