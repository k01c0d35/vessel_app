document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const artefactId = params.get('id');

    if (artefactId) {
        fetch('/data/artefacts.json')
            .then(response => response.json())
            .then(data => {
                const artefact = data.artefacts.find(a => a.id == artefactId);

                if (artefact) {
                    document.getElementById('title').textContent = artefact.title || '';
                    document.getElementById('photo').src = artefact.photo || '';
                    document.getElementById('type').textContent = artefact.type || '';
                    document.getElementById('ware').textContent = artefact.ware || '';
                    document.getElementById('culturePeriod').textContent = artefact.culturePeriod || '';
                    document.getElementById('date').textContent = `Start: ${artefact.date.start}, End: ${artefact.date.end}`;
                    document.getElementById('region').textContent = artefact.region || '';
                    document.getElementById('artist').textContent = artefact.artist || '';
                    document.getElementById('condition').textContent = artefact.condition || '';
                    document.getElementById('height').textContent = artefact.height || '';
                }
            });

        document.getElementById('backToGallery').addEventListener('click', function() {
            window.location.href = '/pages/collection_gallery.html';
        });
    }
});
