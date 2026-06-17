/* script.js */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Let CSS handle smooth scroll and offset
            navMenu.classList.remove('active'); // Close menu on click
            menuToggle.classList.remove('active'); // Close hamburger animation
        });
    });

    // Scroll Animation (Fade In)
    const fadeElems = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElems.forEach(elem => {
        observer.observe(elem);
    });

    // --- Lightbox Modal Logic ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("img01");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".close-modal");

    function openLightbox(img) {
        modal.style.display = "flex";
        modalImg.src = img.src;
        captionText.innerHTML = img.alt || '';
    }

    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
            const parent = event.target.closest('.gallery-slide, .gallery-item, .product-img');
            if (parent) {
                openLightbox(event.target);
            }
        }
    });

    // Close Modal when clicking (x)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = "none";
        });
    }

    // Close Modal when clicking outside the image
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });



    // --- Gallery Slider ---
    const sliderTrack = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    const dotsContainer = document.querySelector('.slider-dots');

    if (sliderTrack) {
        let currentIndex = 0;
        let slides = Array.from(sliderTrack.querySelectorAll('.gallery-slide'));
        let dots = [];

        function initDots() {
            dotsContainer.innerHTML = '';
            dots = [];
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
        }

        function updateSlider() {
            sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === slides.length - 1;
        }

        function goToSlide(index) {
            currentIndex = Math.min(Math.max(index, 0), slides.length - 1);
            updateSlider();
        }

        function nextSlide() {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateSlider();
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }

        if (slides.length > 0) {
            initDots();
            updateSlider();
        }

        // Event listeners for buttons
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Swipe/Drag Gesture Support
        const sliderContainer = document.querySelector('.slider-container');
        let isPressed = false;
        let startX = 0;

        // Mouse events
        sliderContainer.addEventListener('mousedown', (e) => {
            isPressed = true;
            startX = e.clientX;
            sliderContainer.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isPressed) return;
            sliderContainer.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', (e) => {
            if (!isPressed) return;
            isPressed = false;
            sliderContainer.style.cursor = 'grab';
            
            const endX = e.clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });

        // Touch events
        sliderContainer.addEventListener('touchstart', (e) => {
            isPressed = true;
            startX = e.touches[0].clientX;
        }, false);

        document.addEventListener('touchmove', (e) => {
            if (isPressed) {
                // Prevent default scroll while dragging
            }
        }, false);

        sliderContainer.addEventListener('touchend', (e) => {
            if (!isPressed) return;
            isPressed = false;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, false);

        // Initialize
        updateSlider();
    }

});
