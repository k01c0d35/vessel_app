document.addEventListener('DOMContentLoaded', function () {
    const glossaryContent = document.getElementById('glossaryContent');
    const searchInput = document.getElementById('searchInput');
    const backToTopButton = document.getElementById('backToTop');

    //Get glossary items from json
    fetch('/k_glossary.json')
        .then(response => response.json())
        .then(data => {
            displayGlossary(data);

            searchInput.addEventListener('input', function () {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = filterGlossary(data, searchTerm);
                displayGlossary(filteredData);
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
                termHeader.textContent = entry.term;
                termElement.appendChild(termHeader);

                const termDescription = document.createElement('p');
                termDescription.textContent = entry.description;
                termElement.appendChild(termDescription);

                letterSection.appendChild(termElement);
            });

            glossaryContent.appendChild(letterSection);
        });
    }

    //Search through glossary
    function filterGlossary(glossary, searchTerm) {
        const filteredGlossary = {};

        Object.keys(glossary).forEach(letter => {
            const filteredTerms = glossary[letter].filter(entry =>
                entry.term.toLowerCase().includes(searchTerm)
            );

            if (filteredTerms.length > 0) {
                filteredGlossary[letter] = filteredTerms;
            }
        });

        return filteredGlossary;
    }

    //Back to top in glossary
    window.addEventListener('scroll', function () {
        if (this.window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0});
    });
});