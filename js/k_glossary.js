document.addEventListener('DOMContentLoaded', () => {
    const glossaryContent = document.getElementById('glossaryContent');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.aSort');
    let currentFilter = null;

    const getSearchTermFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || '';
    };

    // Fetch glossary data
    fetch('/data/k_glossary.json')
        .then(response => response.json())
        .then(glossaryData => {
            // Fetch artefacts data from the gallery
            fetch('/data/artefacts.json')
                .then(response => response.json())
                .then(artefactsData => {
                    const searchTermFromURL = getSearchTermFromURL();
                    searchInput.value = searchTermFromURL;
                    displayGlossary(filterGlossary(glossaryData, searchTermFromURL.toLowerCase(), currentFilter), artefactsData);

                    searchInput.addEventListener('input', () => {
                        const searchTerm = searchInput.value.toLowerCase();
                        const filteredData = filterGlossary(glossaryData, searchTerm, currentFilter);
                        displayGlossary(filteredData, artefactsData);
                    });

                    filterButtons.forEach(button => {
                        button.addEventListener('click', function () {
                            if (this.classList.contains('selected')) {
                                this.classList.remove('selected');
                                currentFilter = null; // Reset filter
                            } else {
                                filterButtons.forEach(btn => btn.classList.remove('selected')); // Deselect all buttons
                                this.classList.add('selected'); // Select clicked button
                                currentFilter = this.getAttribute('data-filter'); // Set the current filter from button attribute
                            }
                            const searchTerm = searchInput.value.toLowerCase();
                            const filteredData = filterGlossary(glossaryData, searchTerm, currentFilter);
                            displayGlossary(filteredData, artefactsData);
                        });
                    });
                    
                });
        });

    const displayGlossary = (glossary, artefactsData) => {
        glossaryContent.innerHTML = '';

        Object.keys(glossary).forEach(letter => {
            const letterSection = document.createElement('div');
            letterSection.className = 'letter-section';
            letterSection.id = letter;

            const letterHeader = document.createElement('h2');
            letterHeader.textContent = letter;
            letterSection.appendChild(letterHeader);

            glossary[letter].forEach(entry => {
                const { term, 'glossary-filter': glossaryFilter, description, 'defining-features': definingFeatures } = entry;

                const termElement = document.createElement('div');
                termElement.className = 'glossary-term';

                const termHeader = document.createElement('h3');
                termHeader.innerHTML = highlightText(term, searchInput.value);
                termElement.appendChild(termHeader);

                const termGlossaryCategory = document.createElement('p');
                termGlossaryCategory.innerHTML = highlightText(glossaryFilter, searchInput.value);
                termElement.appendChild(termGlossaryCategory);

                const termDescription = document.createElement('p');
                termDescription.innerHTML = highlightText(description, searchInput.value);
                termElement.appendChild(termDescription);

                const termDefiningFeatures = document.createElement('p');
                termDefiningFeatures.innerHTML = highlightText(definingFeatures, searchInput.value);
                termElement.appendChild(termDefiningFeatures);

                // Check if the term exists as a type in the gallery and create a link button
                if (artefactTypeExistsInGallery(term, artefactsData)) {
                    const galleryLinkButton = createGalleryLinkButton(term, 'type');
                    termElement.appendChild(galleryLinkButton);
                }

                // Check if the term exists as a ware in the gallery and create a link button
                if (artefactWareExistsInGallery(term, artefactsData)) {
                    const galleryLinkButton = createGalleryLinkButton(term, 'ware');
                    termElement.appendChild(galleryLinkButton);
                }

                letterSection.appendChild(termElement);
            });

            glossaryContent.appendChild(letterSection);
        });
    };

    // Function to create the gallery link button
    const createGalleryLinkButton = (term, filterType) => {
        const button = document.createElement('button');
        button.className = 'button-common gallery-link';
        button.textContent = `View ${term} in Gallery`;
    
        // Add link to gallery page with filter applied (either type or ware)
        button.addEventListener('click', () => {
            const filterParam = filterType === 'type' ? `filter=${encodeURIComponent(term)}` : `ware=${encodeURIComponent(term)}`;
            window.location.href = `/pages/collection_gallery.html?${filterParam}`; // Redirect to gallery with filter
        });
    
        return button;
    };
    

    // Function to check if a glossary term exists as a type in the gallery artefact types
    const artefactTypeExistsInGallery = (term, artefactsData) => {
        return artefactsData.artefacts.some(artefact => artefact.type && artefact.type.toLowerCase() === term.toLowerCase());
    };

    // Function to check if a glossary term exists as a ware in the gallery artefact wares
    const artefactWareExistsInGallery = (term, artefactsData) => {
        return artefactsData.artefacts.some(artefact => artefact.ware && artefact.ware.toLowerCase() === term.toLowerCase());
    };

    const highlightText = (text, searchTerm) => {
        text = text || '';

        if (!searchTerm.trim()) return text;

        const regex = new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');

        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    const filterGlossary = (glossary, searchTerm, filter) => {
        const filteredGlossary = {};

        Object.keys(glossary).forEach(letter => {
            const filteredTerms = glossary[letter].filter(entry => {
                const { term, 'glossary-filter': glossaryFilter } = entry;
                const termMatches = term.toLowerCase().includes(searchTerm);
                const filterMatches = filter ? glossaryFilter === filter : true;

                return termMatches && filterMatches;
            });

            if (filteredTerms.length > 0) {
                filteredGlossary[letter] = filteredTerms;
            }
        });

        return filteredGlossary;
    };
});
