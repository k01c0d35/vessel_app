document.addEventListener('DOMContentLoaded', function () {
    const glossaryContent = document.getElementById('glossaryContent');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.aSort');
    console.log("g", filterButtons);

    let currentFilter = null;

    //Get glossary items from json
    fetch('/data/k_glossary.json')
        .then(response => response.json())
        .then(data => {
            displayGlossary(data);

            searchInput.addEventListener('input', function () {
                const searchTerm = searchInput.value.toLowerCase();
                console.log("g", searchTerm);
                const filteredData = filterGlossary(data, searchTerm, currentFilter);
                displayGlossary(filteredData);
            });

            filterButtons.forEach(button => {
                button.addEventListener('click', function () {
                    // Toggle filter button state
                    filterButtons.forEach(btn => btn.classList.remove('selected'));
                    this.classList.add('selected');

                    // Update current filter
                    currentFilter = this.getAttribute('data-filter');

                    // Filter glossary items
                    const searchTerm = searchInput.value.toLowerCase();
                    const filteredData = filterGlossary(data, searchTerm, currentFilter);
                    displayGlossary(filteredData);
                });
            });
        });

    //Display glossary items
    function displayGlossary(glossary) {
        glossaryContent.innerHTML = '';

        Object.keys(glossary).forEach(letter => {
            const letterSection = document.createElement('div');
            letterSection.className = 'letter-section';
            letterSection.id = letter;

            const letterHeader = document.createElement('h2');
            letterHeader.textContent = letter;
            letterSection.appendChild(letterHeader);

            glossary[letter].forEach(entry => {
                const termElement = document.createElement('div');
                termElement.className = 'glossary-term';

                const termHeader = document.createElement('h3');
                termHeader.innerHTML = highlightText(entry.term, searchInput.value);
                termElement.appendChild(termHeader);

                const termGlossaryCategory = document.createElement('p');
                termGlossaryCategory.innerHTML = highlightText(entry['glossary-filter'], searchInput.value);
                termElement.appendChild(termGlossaryCategory);

                const termDescription = document.createElement('p');
                termDescription.innerHTML = highlightText(entry.description, searchInput.value);
                termElement.appendChild(termDescription);

                const termDefiningFeatures = document.createElement('p');
                termDefiningFeatures.innerHTML = highlightText(entry['defining-features'], searchInput.value);
                termElement.appendChild(termDefiningFeatures);

                letterSection.appendChild(termElement);
            });

            glossaryContent.appendChild(letterSection);
        });
    }

    function highlightText(text, searchTerm) {
        text = text || '';
        
        if (!searchTerm.trim()) return text;
    
        const regex = new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    //Search through glossary
    function filterGlossary(glossary, searchTerm, filter) {
        const filteredGlossary = {};

        Object.keys(glossary).forEach(letter => {
            const filteredTerms = glossary[letter].filter(entry => {
                const termMatches = entry.term.toLowerCase().includes(searchTerm);
                const filterMatches = filter ? entry['glossary-filter'] === filter : true;

                return termMatches && filterMatches;
            }
                
            );

            if (filteredTerms.length > 0) {
                filteredGlossary[letter] = filteredTerms;
            }
        });

        return filteredGlossary;
    }
});