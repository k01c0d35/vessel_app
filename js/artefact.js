
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const artefactId = params.get('id');

    if (artefactId) {
        fetch('/data/artefacts.json')
            .then(response => response.json())
            .then(data => {
                const artefacts = data.artefacts;
                const artefact = artefacts.find(a => a.id == artefactId);

                if (artefact) {
                    const createGlossaryLink = (term, termType) => {
                        return `<a href="/pages/k_glossary.html?search=${encodeURIComponent(term)}" class="glossary-link">${term}</a>`;
                    };
                    const updateDetail = (divSelector, textSelector, value, termType = '') => {
                        const divElement = document.querySelector(divSelector);
                        const textElement = divElement.querySelector(textSelector);

                        if (value && value !== 'Unknown') {
                            textElement.innerHTML = termType ? createGlossaryLink(value, termType) : value;
                        } else {
                            textElement.textContent = 'Unknown';
                        }
                    };

                    const photoElement = document.querySelector('.photo');
                    if (photoElement && artefact.photo) {
                        photoElement.src = artefact.photo;
                        photoElement.alt = artefact.title || 'Artefact Image';
                    }

                    const titleElement = document.querySelector('.title');
                    titleElement.textContent = artefact.title || artefact.type;

                    const jsonFiles = ['manunggul.json', 'amphora.json', 'warka.json'];

                    // Function to check each JSON file for the artefactId
                    jsonFiles.forEach(fileName => {
                        fetch(`/data/${fileName}`)
                            .then(response => response.json())
                            .then(artefactData => {
                                // Check if the artefactId in this file matches
                                if (artefactData.artefactId.includes(artefactId)) {
                                    // If match found, create a div with a link
                                    const container = document.querySelector('.search-container');
                                    const journeyDiv = document.createElement('button');
                                    journeyDiv.classList.add('button-common', 'accent-container');

                                    // Get the JSON filename without extension
                                    const jsonFileName = fileName.replace('.json', '');

                                    // Create the link to the s1.html page
                                    journeyDiv.innerHTML = `<i class="fa-solid fa-compass"></i> Start Journey`;
                                    journeyDiv.onclick = function () {
                                        window.location.href = `/pages/s1.html?vessel=${jsonFileName}&stage=1`;
                                    };

                                    // Append the link to the div and the div to the container
                                    container.appendChild(journeyDiv);
                                }
                            })
                            .catch(error => console.log(`Error loading JSON file ${fileName}:`, error));
                    });

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
                        ).filter(a => !seenIds.has(a.id) && seenIds.add(a.id)).slice(0, 5);

                        if (relatedArtefacts.length > 0) {
                            relatedArtefacts.forEach(related => {
                                const artefactElement = document.createElement('div');
                                artefactElement.classList.add('related-artefact', 'button-common', 'white-container');
                                artefactElement.innerHTML = `
                                <img src="${related.photo}" alt="${related.title}">
                                <h3>${related.type}</h3>
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
