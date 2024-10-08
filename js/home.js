// Fetch artefacts.json and glossary.json 
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

    // Artefact-based buttons (Grouped by Type, Material, Period, Usage)
    const artefactFilters = [
        { text: 'Greek Vessels', filter: 'greek', ware: 'all' },
        { text: 'Tall Vessels (above 50cm)', filter: 'vessels', height: 50 },
        { text: 'Made of Stone', filter: 'stone', material: 'stone' },
        { text: 'Metal Vessels', filter: 'metal', material: 'metal' },
        { text: 'Ceramic Vessels', filter: 'ceramic', material: 'ceramic' },  // Correct material filter for ceramic
        { text: 'Bronze Age Vessels', filter: 'bronze-age', period: 'bronze' },
        { text: 'Medieval Vessels', filter: 'medieval', period: 'medieval' },
        { text: 'Used for Storage', filter: 'storage', purpose: 'storage' },
        { text: 'Ritual Vessels', filter: 'ritual', purpose: 'ritual' },
        { text: 'Decorative Vessels', filter: 'decorative', purpose: 'decorative' }
    ];

    artefactFilters.forEach(filterItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.textContent = filterItem.text;

        const filterParams = new URLSearchParams();
        // Set filters based on available data
        if (filterItem.filter) filterParams.set('filter', filterItem.filter);
        if (filterItem.height) filterParams.set('height', filterItem.height);
        if (filterItem.material) filterParams.set('material', filterItem.material);  // Material filter
        if (filterItem.period) filterParams.set('period', filterItem.period);
        if (filterItem.purpose) filterParams.set('purpose', filterItem.purpose);

        // Redirect to the collection gallery page with the relevant filters applied
        button.onclick = () => {
            window.location.href = `/pages/collection_gallery.html?${filterParams.toString()}`;
        };

        container.appendChild(button);
    });

    // Glossary-based buttons with sort (link to specific sorts like ware and material)
    const glossarySorts = [
        { term: 'Types of ware', sort: 'Ware' },
        { term: 'Main materials', sort: 'Material' }
    ];

    glossarySorts.forEach(sortItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.innerHTML = `<i class="fas fa-search"></i> ${sortItem.term}`;
        button.onclick = () => {
            window.location.href = `/pages/k_glossary.html?sort=${sortItem.sort.toLowerCase()}`;
        };
        container.appendChild(button);
    });

    // Additional glossary searches (e.g., specific terms like 'vessel', 'clay')
    const glossarySearches = [
        { term: 'vessel' },
        { term: 'clay' },
        { term: 'jar' },
        { term: 'Different firing techniques' },
        { term: 'Coiling technique' },
        { term: 'Slip casting' }
    ];

    glossarySearches.forEach(searchItem => {
        const button = document.createElement('button');
        button.className = 'filter-button gold-container';
        button.innerHTML = `<i class="fas fa-search"></i> ${searchItem.term}`;
        button.onclick = () => {
            window.location.href = `/pages/k_glossary.html?search=${searchItem.term.toLowerCase().replace(/\s+/g, '-')}`;
        };
        container.appendChild(button);
    });
}
