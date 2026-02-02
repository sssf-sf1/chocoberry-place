document.addEventListener("DOMContentLoaded", function() {
    // Подтверждение удаления
    const deleteLinks = document.querySelectorAll("a[onclick*='confirm']");
    deleteLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const confirmed = confirm("Вы уверены, что хотите удалить?");
            if (!confirmed) e.preventDefault();
        });
    });

    // Простая валидация форм
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.addEventListener("submit", function(e) {
            let valid = true;
            const requiredFields = form.querySelectorAll("input[required], select[required], textarea[required]");
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    alert(`Поле "${field.placeholder || field.name}" не может быть пустым`);
                    field.focus();
                    valid = false;
                    e.preventDefault();
                    return false;
                }
            });
        });
    });
});
