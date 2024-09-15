document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const artefactId = params.get('id');

    if (artefactId) {
        fetch('/data/artefacts.json')
            .then(response => response.json())
            .then(data => {
                const artefacts = data.artefacts;
                const artefact = artefacts.find(a => a.id == artefactId);

                if (artefact) {
                    const updateDetail = (divSelector, textSelector, value, isLink = false) => {
                        const divElement = document.querySelector(divSelector);
                        const textElement = divElement.querySelector(textSelector);

                        if (value && value !== 'Unknown') {
                            textElement.textContent = value;
                            if (isLink) {
                                divElement.onclick = () => {
                                    window.location.href = `/pages/k_glossary.html?search=${encodeURIComponent(value)}`;
                                };
                                divElement.style.cursor = 'pointer';
                            } else {
                                divElement.onclick = null;
                                divElement.style.cursor = 'default';
                            }
                        } else {
                            textElement.textContent = 'Unknown';
                            divElement.onclick = null;
                            divElement.style.cursor = 'default';
                        }
                    };

                    const photoElement = document.querySelector('.photo');
                    if (photoElement && artefact.photo) {
                        photoElement.src = artefact.photo;
                        photoElement.alt = artefact.title || 'Artefact Image';
                    }

                    const titleElement = document.querySelector('.title');
                    titleElement.textContent = artefact.title || artefact.type;

                    updateDetail('.type-link', 'p.text', artefact.type, true);
                    updateDetail('.ware-link', 'p.text', artefact.ware, true);
                    updateDetail('.culture-link', 'p.text', artefact.culturePeriod, false);

                    const dateElement = document.querySelector('.date-link .text');
                    if (artefact.date) {
                        const { start, end } = artefact.date;
                        const formatYear = year => year < 0 ? `${Math.abs(year)} BC` : year;
                        dateElement.textContent = start === end ? formatYear(start) : `${formatYear(start)} - ${formatYear(end)}`;
                    } else {
                        dateElement.textContent = 'Unknown';
                    }

                    updateDetail('.region-link', 'p.text', artefact.region, false);
                    updateDetail('.artist-link', 'p.text', artefact.artist, false);
                    updateDetail('.condition-link', 'p.text', artefact.condition, false);
                    updateDetail('.height-link', 'p.text', `${artefact.height} cm`, false);
                    updateDetail('.description-link', 'p.text', artefact.description, false);

                    const relatedContainer = document.querySelector('.related-link');
                    if (relatedContainer) {
                        const seenIds = new Set();
                        const relatedArtefacts = artefacts.filter(a => 
                            a.id != artefactId &&
                            (
                                (a.type === artefact.type && artefact.type !== 'Unknown') ||
                                (a.ware !== 'Earthenware' && a.ware === artefact.ware && artefact.ware !== 'Unknown') ||
                                (a.culturePeriod === artefact.culturePeriod && artefact.culturePeriod !== 'Unknown') ||
                                (a.region === artefact.region && artefact.region !== 'Unknown')
                            )
                        ).filter(a => !seenIds.has(a.id) && seenIds.add(a.id)).slice(0, 6);

                        if (relatedArtefacts.length > 0) {
                            relatedArtefacts.forEach(related => {
                                const artefactElement = document.createElement('div');
                                artefactElement.className = 'related-artefact';
                                artefactElement.innerHTML = `
                                    <p>${related.type}</p>
                                    <img src="${related.photo}" alt="${related.title}">
                                `;
                                relatedContainer.appendChild(artefactElement);
                                artefactElement.addEventListener('click', () => {
                                    window.location.href = `/pages/artefact.html?id=${related.id}`;
                                });
                            });
                        } else {
                            relatedContainer.innerHTML = '<p>No related artefacts found.</p>';
                        }
                    }
                }
            })
            .catch(error => console.error('Error fetching artefacts:', error));

        document.querySelector('.backToGallery').addEventListener('click', () => {
            window.location.href = '/pages/collection_gallery.html';
        });
    }
});
