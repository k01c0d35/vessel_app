function toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    dropdownContent.classList.toggle('show');

    // Hide all other dropdowns
    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content !== dropdownContent) {
            content.classList.remove('show');
        }
    });
}

// Display gallery on page load
document.addEventListener('DOMContentLoaded', function () {
    const galleryContainer = document.getElementById('gallery');
    const searchInput = document.getElementById('searchInput');
    const typeFilterContainer = document.getElementById('typeFilter');
    const regionFilterContainer = document.getElementById('regionFilter');
    const materialFilterContainer = document.getElementById('materialFilter');
    const historicPeriodFilterContainer = document.getElementById('historicPeriodFilter');
    const sortContainer = document.getElementById('sortContainer');
    const displayAmountContainer = document.getElementById('displayAmount');
    const selectedFiltersContainer = document.querySelector('.selectedFilters');

    fetch('/data/artefacts.json')
        .then(response => response.json())
        .then(data => {
            const artefacts = data.artefacts;

            // Display gallery on page load
            displayGallery(artefacts);
            updateSearchStatus(artefacts, getSelectedFilters());

            // Generate filter options
            generateFilters(artefacts, 'filterType', typeFilterContainer);
            generateFilters(artefacts, 'filterRegion', regionFilterContainer);
            generateFilters(artefacts, 'filterMaterial', materialFilterContainer);
            generateFilters(artefacts, 'filterHistoricPeriod', historicPeriodFilterContainer);

            // Generate sorting options
            generateSortOptions(sortContainer, artefacts);

            // Search input event listener
            searchInput.addEventListener('input', function () {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = filterGallery(artefacts, searchTerm);
                updateSearchStatus(filteredData, getSelectedFilters());
                displayGallery(filteredData);
            });

            // Filter by dropdown selections
            const filterContainers = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
            filterContainers.forEach((checkbox) => {
                checkbox.addEventListener('change', function () {
                    const selectedFilters = getSelectedFilters();

                    // Use selectedFilters object properties to filter artefacts
                    const filteredData = artefacts.filter(artefact =>
                        (selectedFilters.type.length === 0 || selectedFilters.type.includes(artefact.filters.filterType)) &&
                        (selectedFilters.region.length === 0 || selectedFilters.region.includes(artefact.filters.filterRegion)) &&
                        (selectedFilters.material.length === 0 || selectedFilters.material.includes(artefact.filters.filterMaterial)) &&
                        (selectedFilters.historicPeriod.length === 0 || selectedFilters.historicPeriod.includes(artefact.filters.filterHistoricPeriod))
                    );

                    updateSearchStatus(filteredData, selectedFilters);
                    displayGallery(filteredData);
                });
            });
        });

    // Display gallery of artefacts
    function displayGallery(artefacts) {
        galleryContainer.innerHTML = '';

        artefacts.forEach(artefact => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';

            const titleElement = document.createElement('h3');
            titleElement.textContent = artefact.type;

            const culturePeriodHeightElement = document.createElement('p');
            culturePeriodHeightElement.textContent = `${artefact.culturePeriod} | ${artefact.height}cm`;

            const imgElement = document.createElement('img');
            imgElement.src = artefact.photo;
            imgElement.alt = artefact.type;

            galleryItem.appendChild(titleElement);
            galleryItem.appendChild(culturePeriodHeightElement);
            galleryItem.appendChild(imgContainer);
            imgContainer.appendChild(imgElement);

            galleryItem.addEventListener('click', () => {
                window.location.href = `/pages/artefact.html?id=${artefact.id}`;
            });

            galleryContainer.appendChild(galleryItem);
        });
    }

    // Search gallery
    function filterGallery(artefacts, searchTerm) {
        return artefacts.filter(artefact => {
            const title = artefact.title ? artefact.title.toLowerCase() : '';
            const type = artefact.type ? artefact.type.toLowerCase() : '';
            const location = artefact.location ? artefact.location.toLowerCase() : '';
            return type.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase() || title.includes(searchTerm.toLowerCase()));
        });
    }

    // Generate filters
    function generateFilters(artefacts, key, filterContainer) {
        const uniqueValues = [...new Set(artefacts.map(artefact => artefact.filters[key]))].sort();

        filterContainer.innerHTML = '';

        uniqueValues.forEach(value => {
            const checkboxLabel = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = value;
            checkbox.name = key;
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(document.createTextNode(value));
            filterContainer.appendChild(checkboxLabel);
        });
    }

    // Generate sorting options
    function generateSortOptions(sortContainer, artefacts) {
        const sortingOptions = [
            { value: 'typeAsc', text: 'Type Ascending' },
            { value: 'typeDesc', text: 'Type Descending' },
            { value: 'dateAsc', text: 'Date Ascending' },
            { value: 'dateDesc', text: 'Date Descending' }
        ];

        sortContainer.innerHTML = '';

        sortingOptions.forEach(option => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'sort';
            radio.value = option.value;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(option.text));
            sortContainer.appendChild(label);

            // Add event listener for sorting
            radio.addEventListener('change', function () {
                const selectedSort = this.value;
                let sortedData;

                switch (selectedSort) {
                    case 'typeAsc':
                        sortedData = [...artefacts].sort((a, b) => a.type.localeCompare(b.type));
                        break;
                    case 'typeDesc':
                        sortedData = [...artefacts].sort((a, b) => b.type.localeCompare(a.type));
                        break;
                    case 'dateAsc':
                        sortedData = [...artefacts].sort((a, b) => {
                            const dateA = a.date && a.date.start ? a.date.start : Infinity;
                            const dateB = b.date && b.date.start ? b.date.start : Infinity;
                            return dateA - dateB;
                        });
                        break;
                    case 'dateDesc':
                        sortedData = [...artefacts].sort((a, b) => {
                            const dateA = a.date && a.date.start ? a.date.start : -Infinity;
                            const dateB = b.date && b.date.start ? b.date.start : -Infinity;
                            return dateB - dateA;
                        });
                        break;
                }

                displayGallery(sortedData);
            });
        });
    }

    // Get selected filters for all categories
    function getSelectedFilters() {
        return {
            type: [...document.querySelectorAll('input[name="filterType"]:checked')].map(checkbox => checkbox.value),
            region: [...document.querySelectorAll('input[name="filterRegion"]:checked')].map(checkbox => checkbox.value),
            material: [...document.querySelectorAll('input[name="filterMaterial"]:checked')].map(checkbox => checkbox.value),
            historicPeriod: [...document.querySelectorAll('input[name="filterHistoricPeriod"]:checked')].map(checkbox => checkbox.value)
        };
    }

    // Update search status (results count and selected filters display)
    function updateSearchStatus(filteredData, selectedFilters) {
        // Update the results count
        displayAmountContainer.textContent = `${filteredData.length}`;

        // Update the selected filters display
        const filters = [];
        if (selectedFilters.type.length > 0) {
            filters.push(`Type: ${selectedFilters.type.join(', ')}`);
        }
        if (selectedFilters.region.length > 0) {
            filters.push(`Region: ${selectedFilters.region.join(', ')}`);
        }
        if (selectedFilters.material.length > 0) {
            filters.push(`Material: ${selectedFilters.material.join(', ')}`);
        }
        if (selectedFilters.historicPeriod.length > 0) {
            filters.push(`Period: ${selectedFilters.historicPeriod.join(', ')}`);
        }

        selectedFiltersContainer.textContent = filters.length > 0 ? filters.join(' | ') : 'None';
    }
});


