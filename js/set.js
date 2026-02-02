document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const product = {
                id: btn.dataset.id,
                title: btn.dataset.title,
                price: parseInt(btn.dataset.price),
                img: btn.dataset.img,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            let existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push(product);
            }

            localStorage.setItem("cart", JSON.stringify(cart));

            btn.textContent = "Добавлено!";
            setTimeout(() => btn.textContent = "В корзину", 1000);
        });
    });
});
