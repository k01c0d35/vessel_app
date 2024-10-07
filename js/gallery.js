document.addEventListener('DOMContentLoaded', () => {
    let artefacts = [];
    const searchInput = document.getElementById('searchInput');
    const filters = {
        purpose: document.getElementById('purposeFilter'),
        type: document.getElementById('typeFilter'),
        ware: document.getElementById('wareFilter'),
        region: document.getElementById('regionFilter'),
        material: document.getElementById('materialFilter'),
        historicPeriod: document.getElementById('historicPeriodFilter'),
    };
    const sortContainer = document.getElementById('sortContainer');

    fetch('/data/artefacts.json')
        .then(response => response.json())
        .then(data => {
            artefacts = data.artefacts;
            const queryParams = new URLSearchParams(window.location.search);
            const filterParams = {
                purpose: queryParams.get('purpose'),
                ware: queryParams.get('ware'),
                region: queryParams.get('region'),
                material: queryParams.get('material'),
                historicPeriod: queryParams.get('period'),
                type: queryParams.get('type')
            };

            // Generate filters and sort options
            Object.keys(filters).forEach(key => {
                generateFilters(artefacts, key, filters[key]);
            });

            generateSortOptions(sortContainer, artefacts);
            setFiltersFromURL(filterParams);
            updateGallery(artefacts);

            // Event listeners
            searchInput.addEventListener('input', debounce(() => updateGallery(artefacts), 300));
            document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => updateGallery(artefacts));
            });
        });

        function generateFilters(artefacts, keyPath, filterContainer) {
            const valueCount = artefacts.reduce(function(acc, artefact) {
                const value = artefact[keyPath]; // Top-level keys like 'purpose', 'region', etc.
        
                if (value) {
                    acc[value] = (acc[value] || 0) + 1;
                }
        
                return acc;
            }, {});
        
            const uniqueValues = Object.keys(valueCount).sort();
        
            filterContainer.innerHTML = uniqueValues.map(function(value) {
                return `
                    <label class="dropdown-label">
                        <input type="checkbox" name="${keyPath}" value="${value}">
                        <p>${value} (${valueCount[value]})</p>
                    </label>
                `;
            }).join('');
        }
        



    function generateSortOptions(container, artefacts) {
        const options = [
            { value: 'typeAsc', text: 'Sort by Type (A-Z)' },
            { value: 'typeDesc', text: 'Sort by Type (Z-A)' },
            { value: 'dateAsc', text: 'Sort by Date (Oldest First)' },
            { value: 'dateDesc', text: 'Sort by Date (Newest First)' }
        ];

        container.innerHTML = options.map(option => `
            <label class="dropdown-label">
                <input type="radio" name="sort" value="${option.value}">
                <p>${option.text}</p>
            </label>
        `).join('');

        container.addEventListener('change', (e) => applySorting(e.target.value, artefacts));
    }

    function applySorting(sortKey, artefacts) {
        const sortedData = [...artefacts].sort((a, b) => {
            switch (sortKey) {
                case 'typeAsc': return a.type.localeCompare(b.type);
                case 'typeDesc': return b.type.localeCompare(a.type);
                case 'dateAsc': return getDate(a) - getDate(b);
                case 'dateDesc': return getDate(b) - getDate(a);
                default: return 0;
            }
        });
        updateGallery(sortedData);
    }

    function getDate(artefact) {
        return artefact.date?.start || Infinity;
    }

    function setFiltersFromURL(params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                value.split(',').forEach(val => {
                    const checkbox = document.querySelector(`input[name="${key}"][value="${val}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        });
    }

    function updateGallery(artefacts) {
        const selectedFilters = getSelectedFilters();
        const searchTerm = searchInput.value.toLowerCase();
    
        const filteredData = artefacts.filter(artefact =>
            (selectedFilters.purpose.length === 0 || selectedFilters.purpose.includes(artefact.purpose)) &&
            (selectedFilters.ware.length === 0 || selectedFilters.ware.includes(artefact.ware)) &&
            (selectedFilters.region.length === 0 || selectedFilters.region.includes(artefact.region)) &&
            (selectedFilters.material.length === 0 || selectedFilters.material.includes(artefact.material)) &&
            (selectedFilters.historicPeriod.length === 0 || selectedFilters.historicPeriod.includes(artefact.historicPeriod)) &&
            (selectedFilters.type.length === 0 || selectedFilters.type.includes(artefact.type)) &&
            (
                artefact.type.toLowerCase().includes(searchTerm) ||
                (artefact.title && artefact.title.toLowerCase().includes(searchTerm)) || // Check for title existence
                artefact.description.toLowerCase().includes(searchTerm)
            )
        );
    
        updateSearchStatus(filteredData, selectedFilters);
        updateURLWithFilters(selectedFilters);
        displayGallery(filteredData);
    }
    
    

    function getSelectedFilters() {
        return {
            purpose: getCheckedValues('purpose'), // Top-level key in your artefact JSON
            ware: getCheckedValues('ware'),       // Top-level key
            region: getCheckedValues('region'),   // Top-level key
            material: getCheckedValues('material'), // Top-level key
            historicPeriod: getCheckedValues('historicPeriod'), // Top-level key
            type: getCheckedValues('type')        // Top-level key
        };
    }
    

    function getCheckedValues(name) {
        return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(checkbox => checkbox.value);
    }

    function updateSearchStatus(filteredData, filters) {
        document.getElementById('displayAmount').textContent = `${filteredData.length}`;
        const selectedFiltersContainer = document.querySelector('.selectedFilters');
        selectedFiltersContainer.innerHTML = '';

        Object.keys(filters).forEach(key => {
            filters[key].forEach(value => createFilterBox(key, value));
        });

        if (!selectedFiltersContainer.children.length) {
            selectedFiltersContainer.textContent = 'None';
        }
    }

    function createFilterBox(filterCategory, filterValue) {
        const filterBox = document.createElement('span');
        filterBox.classList.add('filter-box');

        const filterText = document.createElement('span');
        filterText.textContent = `${filterCategory}: ${filterValue}`;

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-filter');
        removeButton.textContent = 'X';
        removeButton.addEventListener('click', () => removeFilter(filterCategory, filterValue));

        filterBox.appendChild(filterText);
        filterBox.appendChild(removeButton);
        document.querySelector('.selectedFilters').appendChild(filterBox);
    }

    function removeFilter(filterCategory, filterValue) {
        const checkbox = document.querySelector(`input[name="${filterCategory}"][value="${filterValue}"]`);
        if (checkbox) checkbox.checked = false;

        const selectedFilters = getSelectedFilters();
        updateGallery(artefacts);
        updateSearchStatus(artefacts, selectedFilters);
        updateURLWithFilters(selectedFilters);
    }

    function updateURLWithFilters(filters) {
        const urlParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key].length) {
                urlParams.set(key, filters[key].join(','));
            }
        });
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    }

    function displayGallery(artefacts) {
        const galleryContainer = document.getElementById('gallery');
        galleryContainer.innerHTML = artefacts.length ? artefacts.map(artefact => `
            <div class="gallery-item">
                <div class="img-container">
                    <img src="${artefact.photo}" alt="${artefact.type}">
                </div>
                <h3>${artefact.title || artefact.type}</h3>
                <p>${artefact.culturePeriod || 'Unknown Period'} | ${artefact.height || 'N/A'}cm</p>
            </div>
        `).join('') : '<p>No artefacts found matching the selected criteria.</p>';

        galleryContainer.querySelectorAll('.gallery-item').forEach((item, idx) => {
            item.addEventListener('click', () => window.location.href = `/pages/artefact.html?id=${artefacts[idx].id}`);
        });
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(content => content.classList.remove('show'));
    }
});

function toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    dropdownContent.classList.toggle('show');

    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content !== dropdownContent) {
            content.classList.remove('show');
        }
    });
}
