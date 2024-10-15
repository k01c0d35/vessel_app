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

        // Check if there are no matching terms in the glossary
        const glossaryLetters = Object.keys(glossary);
        if (glossaryLetters.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'noResults';
            noResults.innerHTML = '<p>No glossary terms found matching your criteria.</p>';
            glossaryContent.appendChild(noResults);
            return;
        }


        glossaryLetters.forEach(letter => {
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

                // Create a div to group the term and the glossary filter together
                const termHeaderWrapper = document.createElement('div');
                termHeaderWrapper.className = 'glossary-term-header-wrapper';  // Added class for styling

                // Create the term header (h2 element)
                const termHeader = document.createElement('h2');
                termHeader.className = 'glossary-term-header';  // Added class for styling
                termHeader.innerHTML = highlightText(term, searchInput.value);  // E.g., "Aryballos"
                termHeaderWrapper.appendChild(termHeader);

                // Create the glossary filter (span element) to display after the term
                const termGlossaryCategory = document.createElement('span');
                termGlossaryCategory.className = 'glossary-category';  // Added class for styling
                termGlossaryCategory.innerHTML = `(${highlightText(glossaryFilter, searchInput.value)})`;  // E.g., "(Vessel)"
                termHeaderWrapper.appendChild(termGlossaryCategory);

                // Append the wrapper to the main term element
                termElement.appendChild(termHeaderWrapper);

                // Create the term description (p element)
                const termDescription = document.createElement('p');
                termDescription.className = 'glossary-description';  // Added class for styling
                termDescription.innerHTML = highlightText(description, searchInput.value);
                termElement.appendChild(termDescription);

                // Display defining features in a single line, prefixed with "Defining Features:"
                if (definingFeatures && definingFeatures.length > 0) {
                    const termDefiningFeatures = document.createElement('p');
                    termDefiningFeatures.className = 'glossary-defining-features';  // Added class for styling
                    termDefiningFeatures.innerHTML = `<strong>Defining Features:</strong> ${highlightText(definingFeatures, searchInput.value)}`;
                    termElement.appendChild(termDefiningFeatures);
                }




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


    const createGalleryLinkButton = (term, filterType) => {
        const button = document.createElement('button');
        button.className = 'button-common gallery-link dark-container';
        button.innerHTML = `<i class="fa-solid fa-building-columns"></i><span class="apply-text">Apply Term in Collection</span>`;

        // Modify the URL with specific query params (either 'type' or 'ware')
        button.addEventListener('click', () => {
            const filterParam = filterType === 'type' ? `type=${encodeURIComponent(term)}` : `ware=${encodeURIComponent(term)}`;
            window.location.href = `/pages/collection_gallery.html?${filterParam}`; // Redirect to gallery with correct filter
        });

        // Add hover event listeners
        button.addEventListener('mouseover', () => {
            button.classList.add('expanded');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('expanded');
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
