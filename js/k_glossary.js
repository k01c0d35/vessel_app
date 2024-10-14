document.addEventListener('DOMContentLoaded', () => {
    const glossaryContent = document.getElementById('glossaryContent');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.aSort');
    const letterSections = document.querySelectorAll('.letter-section');
    const quickNavLinks = document.querySelectorAll('.glossary-quick-nav a');
    let currentFilter = null;

    const updateURLParams = (searchTerm, filter) => {
        const url = new URL(window.location);
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }

        if (filter) {
            // Capitalize first letter of filter
            const capitalizedFilter = filter.charAt(0).toUpperCase() + filter.slice(1);
            url.searchParams.set('sort', capitalizedFilter);
        } else {
            url.searchParams.delete('sort');
        }
        window.history.replaceState({}, '', url);
    };

    const getSearchTermFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || '';
    };

    const getSortFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('sort') || '';
    };

    fetch('/data/k_glossary.json')
        .then(response => response.json())
        .then(glossaryData => {
            fetch('/data/artefacts.json')
                .then(response => response.json())
                .then(artefactsData => {
                    const searchTermFromURL = getSearchTermFromURL();
                    const sortFromURL = getSortFromURL();

                    searchInput.value = searchTermFromURL;
                    if (sortFromURL) {
                        currentFilter = sortFromURL.toLowerCase(); // Normalize the case for internal usage
                        const filterButton = document.querySelector(`[data-filter="${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}"]`);
                        if (filterButton) {
                            filterButton.classList.add('selected');
                        }
                    }

                    displayGlossary(filterGlossary(glossaryData, searchTermFromURL.toLowerCase(), currentFilter), artefactsData);

                    searchInput.addEventListener('input', () => {
                        const searchTerm = searchInput.value.toLowerCase();
                        updateURLParams(searchTerm, currentFilter);  // Update the URL
                        const filteredData = filterGlossary(glossaryData, searchTerm, currentFilter);
                        displayGlossary(filteredData, artefactsData);
                    });

                    filterButtons.forEach(button => {
                        button.addEventListener('click', function () {
                            if (this.classList.contains('selected')) {
                                this.classList.remove('selected');
                                currentFilter = null; // Reset filter
                            } else {
                                filterButtons.forEach(btn => btn.classList.remove('selected'));
                                this.classList.add('selected');
                                currentFilter = this.getAttribute('data-filter');
                            }
                            const searchTerm = searchInput.value.toLowerCase();
                            updateURLParams(searchTerm, currentFilter);  // Update the URL with capitalized sort
                            const filteredData = filterGlossary(glossaryData, searchTerm, currentFilter);
                            displayGlossary(filteredData, artefactsData);
                        });
                    });
                });
        });

    function updateActiveNav() {
        let currentLetter = '';

        letterSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight / 2) {
                currentLetter = section.id;
            }
        });

        quickNavLinks.forEach(link => {
            link.classList.remove('selected');
            if (link.getAttribute('href') === `#${currentLetter}`) {
                link.classList.add('selected');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    const displayGlossary = (glossary, artefactsData) => {
        glossaryContent.innerHTML = '';

        Object.keys(glossary).forEach(letter => {
            const letterSection = document.createElement('div');
            letterSection.className = 'letter-section';
            letterSection.id = letter;

            const letterHeader = document.createElement('h1');
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
        button.className = 'button-common gallery-link dark-container';
        button.innerHTML = `<i class="fa-solid fa-building-columns"></i>`;
    
        // Modify the URL with specific query params (either 'type' or 'ware')
        button.addEventListener('click', () => {
            const filterParam = filterType === 'type' ? `type=${encodeURIComponent(term)}` : `ware=${encodeURIComponent(term)}`;
            window.location.href = `/pages/collection_gallery.html?${filterParam}`; // Redirect to gallery with correct filter
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

                // Make sure both the filter and glossaryFilter are lowercase for case-insensitive matching
                const termMatches = term.toLowerCase().includes(searchTerm);
                const filterMatches = filter ? glossaryFilter && glossaryFilter.toLowerCase() === filter.toLowerCase() : true;

                return termMatches && filterMatches;
            });

            if (filteredTerms.length > 0) {
                filteredGlossary[letter] = filteredTerms;
            }
        });

        return filteredGlossary;
    };

});
