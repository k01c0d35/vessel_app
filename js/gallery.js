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
    const wareFilterContainer = document.getElementById('wareFilter');
    const culturePeriodFilterContainer = document.getElementById('culturePeriodFilter');
    const sortContainer = document.getElementById('sortContainer'); // Add this for sorting options

    fetch('/data/artefacts.json')
        .then(response => response.json())
        .then(data => {
            const artefacts = data.artefacts;

            // Display gallery on page load
            displayGallery(artefacts);

            // Generate filter options
            generateFilters(artefacts, 'type', typeFilterContainer);
            generateFilters(artefacts, 'region', regionFilterContainer);
            generateFilters(artefacts, 'ware', wareFilterContainer);
            generateFilters(artefacts, 'culturePeriod', culturePeriodFilterContainer);

            // Generate sorting options
            generateSortOptions(sortContainer, artefacts);

            // Search input event listener
            searchInput.addEventListener('input', function () {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredData = filterGallery(data.artefacts, searchTerm);
                displayGallery(filteredData);
            });

            // Filter by dropdown selections
            const filterContainers = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
            filterContainers.forEach((checkbox) => {
                checkbox.addEventListener('change', function () {
                    const selectedTypes = getSelectedFilters('type');
                    const selectedRegions = getSelectedFilters('region');
                    const selectedWares = getSelectedFilters('ware');
                    const selectedCulturePeriods = getSelectedFilters('culturePeriod');

                    const filteredData = artefacts.filter(artefact =>
                        (selectedTypes.length === 0 || selectedTypes.includes(artefact.type)) &&
                        (selectedRegions.length === 0 || selectedRegions.includes(artefact.region)) &&
                        (selectedWares.length === 0 || selectedWares.includes(artefact.ware)) &&
                        (selectedCulturePeriods.length === 0 || selectedCulturePeriods.includes(artefact.culturePeriod))
                    );

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
            const location = artefact.location ? artefact.location.toLowerCase() : '';
            return title.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
        });
    }

    // Generate filters
    function generateFilters(artefacts, key, filterContainer) {
        const uniqueValues = [...new Set(artefacts.map(artefact => artefact[key]))].sort();

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
            radio.type = 'checkbox';
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

    /**
     * Get the values of all checked checkboxes with the given name
     * @param {string} filterName
     * @returns {string[]}
     */
    function getSelectedFilters(filterName) {
        return [...document.querySelectorAll(`input[name="${filterName}"]:checked`)]
            .map(checkbox => checkbox.value);
    }

    // Close dropdowns if the user clicks outside of them
    window.addEventListener('click', function (event) {
        if (!event.target.matches('.dropdown-button')) {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content.classList.contains('show')) {
                    content.classList.remove('show');
                }
            });
        }
    });

    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    });
});
