Promise.all([
    fetch('/data/artefacts.json').then(response => response.json()),
    fetch('/data/k_glossary.json').then(response => response.json())
])
    .then(([artefactsData, glossaryData]) => {
        createFilterButtons(artefactsData, glossaryData);
    })
    .catch(error => {
        console.error('Error fetching JSON files:', error);
    });

function createFilterButtons(artefactsData, glossaryData) {
    const container = document.querySelector('.filter-buttons-container');
    const glossaryContainer = document.querySelector('.glossary-buttons-container');

    const artefactFilters = [
        { text: 'Krater', filter: 'type', value: 'Krater' },
        { text: 'Made of Amber', filter: 'ware', value: 'Amber' },
        { text: 'Metal Vessels', filter: 'material', value: 'Metal' },
        { text: 'Ancient Civilizations', filter: 'period', value: 'Ancient' },
        { text: 'Urpu', filter: 'type', value: 'Urpu' },
        { text: 'Vessels of Asia', filter: 'region', value: 'Asia' }
    ];
    
    

    artefactFilters.forEach(filterItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.innerHTML = `<i class="fa-solid fa-building-columns"></i> ${filterItem.text}`;
    
        const filterParam = `${filterItem.filter}=${encodeURIComponent(filterItem.value)}`;
    
        button.addEventListener('click', () => {
            window.location.href = `/pages/collection_gallery.html?${filterParam}`;
        });
    
        container.appendChild(button);
    });
    
    const glossarySorts = [
        { term: 'Types of Ware', sort: 'Ware' },
        { term: 'Materials', sort: 'Material' }
    ];

    glossarySorts.forEach(sortItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.innerHTML = `<i class="fa-solid fa-book"></i> ${sortItem.term}`;
        button.onclick = () => {
            window.location.href = `/pages/k_glossary.html?sort=${sortItem.sort.toLowerCase()}`;
        };
        glossaryContainer.appendChild(button);
    });

    const glossarySearches = [
        { term: 'Vessel' },
        { term: 'Clay' },
        { term: 'Urpu' },
        { term: 'Canopic Jar' },
        { term: 'Pottery Wheel' }
    ];

    glossarySearches.forEach(searchItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.innerHTML = `<i class="fa-solid fa-book"></i> ${searchItem.term}`;
        button.onclick = () => {
            window.location.href = `/pages/k_glossary.html?search=${searchItem.term.toLowerCase().replace(/\s+/g, ' ')}`;
        };
        glossaryContainer.appendChild(button);
    });
}
