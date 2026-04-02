/* script.js */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Let CSS handle smooth scroll and offset
            navMenu.classList.remove('active'); // Close menu on click
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

    // Get all images that should be clickable
    const images = document.querySelectorAll('.gallery-slide img, .product-img img');

    images.forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
        });
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
    const gallerySlides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    const dotsContainer = document.querySelector('.slider-dots');

    if (sliderTrack && gallerySlides.length > 0) {
        let currentIndex = 0;

        // Create dots
        gallerySlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.slider-dot');

        function updateSlider() {
            sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            // Update buttons
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === gallerySlides.length - 1;
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
        }

        function nextSlide() {
            if (currentIndex < gallerySlides.length - 1) {
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

        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Initialize
        updateSlider();
    }

    // --- Gallery "Show All" Toggle ---
    const viewAllBtn = document.getElementById('view-all-gallery');
    const galleryGrid = document.querySelector('.gallery-grid');

    if (viewAllBtn && galleryGrid) {
        viewAllBtn.addEventListener('click', () => {
            galleryGrid.classList.toggle('show-all');
            if (galleryGrid.classList.contains('show-all')) {
                viewAllBtn.textContent = 'Sembunyikan Gambar';
                // Scroll to gallery grid
                galleryGrid.scrollIntoView({ behavior: 'smooth' });
            } else {
                viewAllBtn.textContent = 'Tampilkan Semua Gambar';
                // Scroll back to gallery section
                document.getElementById('galeri').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

});
