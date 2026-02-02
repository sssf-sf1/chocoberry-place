function initReviewsSlider() {
    const track = document.querySelector('.review-track');
    const slides = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    let autoSlideInterval;
    const slideInterval = 5000;
    
    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }
    
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        updateSlider();
        resetAutoSlide();
    }
    
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, slideInterval);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    const slider = document.querySelector('.review-slider');
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    let startX = 0;
    let endX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoSlide();
    });
    
    slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoSlide();
    });
    
    startAutoSlide();
    updateSlider();
}

document.addEventListener('DOMContentLoaded', initReviewsSlider);

if (typeof $ !== 'undefined') {
    $(function() {
        setTimeout(initReviewsSlider, 100);
    });
}