// modal.js - управление модальными окнами
$(document).ready(function() {
    // Открытие модального окна
    $(document).on('click', '.open-modal', function(e) {
        e.preventDefault();
        var modalId = $(this).data('modal');
        var tab = $(this).data('tab');
        
        if (modalId && $('#' + modalId).length) {
            // Показываем модальное окно по центру
            $('#' + modalId).addClass('show').css({
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center'
            });
            $('body').css('overflow', 'hidden');
            
            // Переключаем на нужную вкладку если указана
            if (tab) {
                $('.auth-tab[data-tab="' + tab + '"]').click();
            }
        }
    });

    // Закрытие модального окна
    $(document).on('click', '.close-modal, .modal-overlay', function(e) {
        // Закрываем только если кликнули на оверлей или кнопку закрытия
        if ($(e.target).hasClass('modal-overlay') || $(e.target).hasClass('close-modal')) {
            $('.modal-overlay').removeClass('show').hide();
            $('body').css('overflow', 'auto');
        }
    });

    // Переключение между вкладками
    $(document).on('click', '.auth-tab', function() {
        var tab = $(this).data('tab');
        
        // Обновляем активную вкладку
        $('.auth-tab').removeClass('active');
        $(this).addClass('active');
        
        // Показываем соответствующую форму
        $('.auth-form').removeClass('active');
        $('.auth-form[data-form="' + tab + '"]').addClass('active');
    });

    // Переключение между формами по ссылкам
    $(document).on('click', '.auth-link[data-switch]', function(e) {
        e.preventDefault();
        var tab = $(this).data('switch');
        
        $('.auth-tab').removeClass('active');
        $('.auth-tab[data-tab="' + tab + '"]').addClass('active');
        
        $('.auth-form').removeClass('active');
        $('.auth-form[data-form="' + tab + '"]').addClass('active');
    });

    // Показать/скрыть пароль
    $(document).on('click', '.toggle-password', function() {
        var input = $(this).siblings('input');
        var icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Закрытие по ESC
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal-overlay').removeClass('show').hide();
            $('body').css('overflow', 'auto');
        }
    });
});