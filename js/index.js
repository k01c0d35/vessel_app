document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.getElementById('backToTop');

    //Generate Top Nav
    fetch('/includes/top_nav.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('.nav').innerHTML = data;
            setActiveNav();
        });

    //Generate Footer
    fetch('/includes/footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('footer').innerHTML = data;
        });

    //Set Current Page Active
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
    
    //Back to top button
    if (backToTopButton) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', function () {
            window.scrollTo({ top: 0});
        });
    }
});