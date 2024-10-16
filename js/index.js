document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('.content').style.display = 'flex';

    const backToTopButton = document.getElementById('backToTop');

    function isMobile() {
        return window.innerWidth <= 767;
    }

    const filterTitle = document.querySelector('.filter-options .filter-title h2');
    const sortTitle = document.querySelector('#galleryContent .sort-options .filter-title h2');
    const filterContent = document.querySelector('.filter-options .mobile-overlay');
    const sortContent = document.querySelector('.sort-buttons.mobile-overlay');

    const glossarySortTitle = document.querySelector('.glossary-sort .filter-title h2');
    const glossarySortContent = document.querySelector('.glossary-sort .mobile-overlay');
    const glossaryQuickNavTitle = document.querySelector('.glossary-quick-nav .filter-title h2');
    const glossaryQuickNavContent = document.querySelector('.glossary-quick-nav .mobile-overlay');

    function initializeToggle(title, content) {
        if (title && content) {
            let chevronIcon = title.querySelector('i');
            if (!chevronIcon) {
                chevronIcon = document.createElement('i');
                chevronIcon.classList.add('fa', 'fa-chevron-down');
                title.appendChild(chevronIcon);
            }

            title.addEventListener('click', (event) => {
                console.log('Title clicked');
                if (isMobile()) {
                    const isShowing = content.classList.toggle('show');
                    chevronIcon.className = isShowing ? 'fa fa-chevron-up' : 'fa fa-chevron-down';
                }
            });
        }
    }

    const filterChevron = initializeToggle(filterTitle, filterContent);
    const sortChevron = initializeToggle(sortTitle, sortContent);

    const glossarySortChevron = initializeToggle(glossarySortTitle, glossarySortContent);
    const glossaryQuickNavChevron = initializeToggle(glossaryQuickNavTitle, glossaryQuickNavContent);

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            if (filterContent) {
                filterContent.classList.remove('show');
                if (filterChevron) filterChevron.className = 'fa fa-chevron-down';
            }
            if (sortContent) {
                sortContent.classList.remove('show');
                if (sortChevron) sortChevron.className = 'fa fa-chevron-down';
            }
            if (glossarySortContent) {
                glossarySortContent.classList.remove('show');
                if (glossarySortChevron) glossarySortChevron.className = 'fa fa-chevron-down';
            }
            if (glossaryQuickNavContent) {
                glossaryQuickNavContent.classList.remove('show');
                if (glossaryQuickNavChevron) glossaryQuickNavChevron.className = 'fa fa-chevron-down';
            }
        }
    });

    fetch('/includes/top_nav.html')
        .then(response => response.text())
        .then(data => {
            const topNavElement = document.querySelector('.nav');
            if (topNavElement) {
                topNavElement.innerHTML = data;
                setActiveNav();
                attachMenuToggleEvent();
                attachCloseButton();
            } else {
                console.warn('No top nav element found on the page.');
            }
        })
        .catch(error => {
            console.error('Error loading top navigation:', error);
        });

    fetch('/includes/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.querySelector('footer');
            if (footerElement) {
                footerElement.innerHTML = data;
            } else {
                console.warn('No footer element found on the page.');
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });


    function attachMenuToggleEvent() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.getElementById('navMenu');
        const body = document.body;
        const webTitle = document.querySelector('.website-title');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                body.classList.toggle('no-scroll');
                webTitle.style.color = 'var(--white-color)';
            });
        }
    }

    function attachCloseButton() {
        const navMenu = document.getElementById('navMenu');
        const body = document.body;
        const webTitle = document.querySelector('.website-title');

        // Create the close button
        const closeButton = document.createElement('div');
        closeButton.classList.add('menu-close');
        closeButton.innerHTML = '&times;'; // X symbol

        // Append the close button to the nav menu
        navMenu.appendChild(closeButton);

        // Add event listener to close the menu when the button is clicked
        closeButton.addEventListener('click', () => {
            navMenu.classList.remove('active');
            body.classList.remove('no-scroll');
            webTitle.style.color = 'var(--black-color)';
        });
    }


    // Set Current Page Active
    function setActiveNav() {
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link'); // Select all nav links
        const journeyPages = ['/pages/s1.html', '/pages/s2.html', '/pages/s3.html'];
        const artefactPage = ['/pages/artefact.html'];

        let targetPage = currentPage;

        if (journeyPages.includes(currentPage)) {
            targetPage = '/pages/journeys.html';
        }

        if (artefactPage.includes(currentPage)) {
            targetPage = '/pages/collection_gallery.html';
        }

        navLinks.forEach(link => {
            if (link.getAttribute('href') === targetPage) {
                link.classList.add('active');   // Add 'active' class to the current page link
                link.removeAttribute('href');
            } else {
                link.classList.remove('active');  // Ensure no other link is active
            }
        });
    }

    // Back to top button
    if (backToTopButton) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', function () {
            window.scrollTo({ top: 0 });
        });
    }
});
