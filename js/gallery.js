//Display gallery on page load
document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.getElementById('gallery');
    const searchInput = document.getElementById('searchInput');

    fetch('/data/gallery.json')
        .then(response => response.json())
        .then(data => {
            displayGallery(data.artefacts);

            searchInput.addEventListener('input', function () {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = filterGallery(data.artefacts, searchTerm);
                displayGallery(filteredData);
            });
        });

    function displayGallery(artefacts) {
        galleryContainer.innerHTML = '';

        artefacts.forEach(artefact => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';

            const imgElement = document.createElement('img');
            imgElement.src = artefact.img;
            imgElement.alt = artefact.title;

            const titleElement = document.createElement('h3');
            titleElement.textContent = artefact.title;

            imgContainer.appendChild(imgElement);
            galleryItem.appendChild(imgContainer);
            galleryItem.appendChild(titleElement);

            galleryContainer.appendChild(galleryItem);
        });
    }

    //Search gallery
    function filterGallery(artefacts, searchTerm) {
        return artefacts.filter(artefact =>
            artefact.title.toLowerCase().includes(searchTerm) ||
            artefact.location.toLowerCase().includes(searchTerm)
        );
    }
});

