document.addEventListener('DOMContentLoaded', () => {
    const glossaryContent = document.getElementById('glossaryContent');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.aSort');

    let currentFilter = null;

    const getSearchTermFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || '';
    };

    fetch('/data/k_glossary.json')
        .then(response => response.json())
        .then(data => {
            const searchTermFromURL = getSearchTermFromURL();
            searchInput.value = searchTermFromURL;

            displayGlossary(filterGlossary(data, searchTermFromURL.toLowerCase(), currentFilter));

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = filterGlossary(data, searchTerm, currentFilter);
                displayGlossary(filteredData);
            });

            filterButtons.forEach(button => {
                button.addEventListener('click', function () {
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        currentFilter = null;
                    } else {
                        filterButtons.forEach(btn => btn.classList.remove('selected'));
                        this.classList.add('selected');

                        currentFilter = this.getAttribute('data-filter');
                    }

                    const searchTerm = searchInput.value.toLowerCase();
                    const filteredData = filterGlossary(data, searchTerm, currentFilter);
                    displayGlossary(filteredData);
                });
            });
        });

    const displayGlossary = (glossary) => {
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

                letterSection.appendChild(termElement);
            });

            glossaryContent.appendChild(letterSection);
        });
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
