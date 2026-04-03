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
    const gallerySlider = document.querySelector('.gallery-slider');

    if (viewAllBtn && galleryGrid) {
        viewAllBtn.addEventListener('click', () => {
            const gridHidden = galleryGrid.classList.contains('hide');
            if (gridHidden) {
                galleryGrid.classList.remove('hide');
                viewAllBtn.textContent = 'Sembunyikan Gambar';
                galleryGrid.scrollIntoView({ behavior: 'smooth' });
            } else {
                galleryGrid.classList.add('hide');
                viewAllBtn.textContent = 'Tampilkan Semua Gambar';
                if (gallerySlider) gallerySlider.classList.remove('hidden');
                document.getElementById('galeri').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Gallery category filter ---
    const filterButtons = document.querySelectorAll('.gallery-filter');
    const gridItems = document.querySelectorAll('.gallery-grid .gallery-item');

    function applyGalleryFilter(category) {
        gridItems.forEach(item => {
            const itemCategory = item.dataset.category || 'all';
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('show-hidden');
            } else {
                item.classList.add('show-hidden');
            }
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.filter;
            applyGalleryFilter(category);

            if (gallerySlider) {
                if (category === 'all') {
                    gallerySlider.classList.remove('hidden');
                } else {
                    gallerySlider.classList.add('hidden');
                }
            }

            if (galleryGrid) {
                if (category === 'all') {
                    galleryGrid.classList.add('hide');
                    if (viewAllBtn) {
                        viewAllBtn.textContent = 'Tampilkan Semua Gambar';
                        viewAllBtn.style.display = 'inline-block';
                    }
                } else {
                    galleryGrid.classList.remove('hide');
                    if (viewAllBtn) {
                        viewAllBtn.textContent = 'Sembunyikan Gambar';
                        viewAllBtn.style.display = 'inline-block';
                    }
                }
            }
        });
    });

    // Default: start with slider visible and grid hidden until action
    if (galleryGrid) {
        galleryGrid.classList.add('hide');
    }
    if (gallerySlider) {
        gallerySlider.classList.remove('hidden');
    }
    if (viewAllBtn) {
        viewAllBtn.style.display = 'inline-block';
        viewAllBtn.textContent = 'Tampilkan Semua Gambar';
    }

    applyGalleryFilter('all');

});
