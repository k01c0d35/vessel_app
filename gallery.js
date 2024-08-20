document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.getElementById('gallery');

    fetch('/gallery.json')
        .then(response => response.json())
        .then(data => {
            populateGallery(data);
        });

    function populateGallery(data) {
        Object.keys(data).forEach(key => {
            data[key].forEach(artifact => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const imgElement = document.createElement('img');
                imgElement.src = artifact.img;
                imgElement.alt = artifact.title;

                const titleElement = document.createElement('h3');
                titleElement.textContent = artifact.title;

                galleryItem.appendChild(imgElement);
                galleryItem.appendChild(titleElement);

                galleryContainer.appendChild(galleryItem);
            });
        });
    }
});