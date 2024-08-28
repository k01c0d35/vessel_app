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
            document.getElementById('footer').innerHTML = data;
        });

    //Set Current Page Active
    function setActiveNav() {
        const currentPage = window.location.pathname;  // Get current page path
        const navLinks = document.querySelectorAll('.nav-link'); // Select all nav links

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');   // Add 'active' class to the current page link
                link.removeAttribute('href');
                const svgTextElement = document.querySelector('.bottom-section-nav .svg-text');
                if (svgTextElement) {
                    svgTextElement.textContent = link.textContent;
                }
            } else {
                link.classList.remove('active');  // Ensure no other link is active
            }
        });
    }
    
        //Back to top button
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
});