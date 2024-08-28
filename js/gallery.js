//Display gallery on page load
document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.getElementById('gallery');
    const searchInput = document.getElementById('searchInput');

    fetch('/data/artefacts.json')
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
            imgElement.src = artefact.photo;
            imgElement.alt = artefact.type;

            const titleElement = document.createElement('h3');
            titleElement.textContent = artefact.type;

            galleryItem.appendChild(imgContainer);
            imgContainer.appendChild(imgElement);
            galleryItem.appendChild(titleElement);

            galleryItem.addEventListener('click', () => {
                window.location.href = `/pages/artefact.html?id=${artefact.id}`;
            });

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

