let artefacts = [];
document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const filters = {
        purpose: document.getElementById('purposeFilter'),
        region: document.getElementById('regionFilter'),
        material: document.getElementById('materialFilter'),
        historicPeriod: document.getElementById('historicPeriodFilter'),
    };

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

            Object.keys(filters).forEach(key => {
                generateFilters(artefacts, key, filters[key]);
            });
            setFiltersFromURL(filterParams);
            updateGallery(artefacts);

            searchInput.addEventListener('input', debounce(() => updateGallery(artefacts), 300));
            document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => updateGallery(artefacts));
            });

            document.querySelectorAll('.aSort').forEach(button => {
                button.addEventListener('click', (event) => {
                    const sortKey = event.target.getAttribute('data-sort') || event.target.closest('div').getAttribute('data-sort');

                    if (button.classList.contains('selected')) {
                        button.classList.remove('selected');
                        updateGallery(artefacts);
                    } else {
                        document.querySelectorAll('.aSort').forEach(btn => btn.classList.remove('selected'));
                        button.classList.add('selected');

                        applySorting(sortKey, artefacts);
                    }
                });
            });

        });
});

function generateFilters(artefacts, keyPath, filterContainer) {
    const valueCount = artefacts.reduce((acc, artefact) => {
        const value = artefact[keyPath];
        const subValue = (keyPath === 'purpose') ? artefact.type : (keyPath === 'material') ? artefact.ware : null;

        if (value) {
            if (!acc[value]) {
                acc[value] = { count: 0, subItems: {} };
            }
            acc[value].count++;
            if (subValue) {
                acc[value].subItems[subValue] = (acc[value].subItems[subValue] || 0) + 1;
            }
        }

        return acc;
    }, {});

    const uniqueValues = Object.keys(valueCount).sort();

    filterContainer.innerHTML = uniqueValues.map(value => {
        const subItems = valueCount[value].subItems;
        const hasSubItems = Object.keys(subItems).length > 0;
        const subItemsHTML = Object.keys(subItems).map(subValue => `
            <label class="dropdown-label">
                <input type="checkbox" name="${keyPath === 'purpose' ? 'type' : 'ware'}" value="${subValue}">
                <p>${subValue} (${subItems[subValue]})</p>
            </label>
        `).join('');

        return `
            <div class="dropdown-item">
                <label class="dropdown-label">
                    <input type="checkbox" name="${keyPath}" value="${value}">
                    <p>${value} (${valueCount[value].count})</p>
                    ${hasSubItems ? '<i class="fa-solid fa-chevron-down"></i>' : ''}
                </label>
                ${subItemsHTML ? `<div class="nested-dropdown">${subItemsHTML}</div>` : ''}
            </div>
        `;
    }).join('');

    filterContainer.querySelectorAll('.dropdown-label').forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const nestedDropdown = label.parentElement.querySelector('.nested-dropdown');
        const chevron = label.querySelector('.fa-chevron-down');

        label.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (nestedDropdown) {
                    nestedDropdown.classList.toggle('show');
                    chevron.classList.toggle('fa-chevron-up');
                    chevron.classList.toggle('fa-chevron-down');
                }
            }
        });

        // If parent checkbox is clicked, toggle all child checkboxes
        checkbox.addEventListener('click', () => {
            if (nestedDropdown) {
                const nestedCheckboxes = nestedDropdown.querySelectorAll('input[type="checkbox"]');
                nestedCheckboxes.forEach(cb => cb.checked = checkbox.checked);
            }
            updateGallery(artefacts);
        });
    });
}

// Sorting logic
function applySorting(sortKey, artefacts) {
    const sortedData = [...artefacts].sort((a, b) => {
        switch (sortKey) {
            case 'typeAsc':
                return a.type.localeCompare(b.type);
            case 'typeDesc':
                return b.type.localeCompare(a.type);
            case 'dateAsc':
                return getDate(a) - getDate(b);
            case 'dateDesc':
                return getDate(b) - getDate(a);
            default:
                return 0;
        }
    });
    updateGallery(sortedData);
}

// Get the date value from artefact
function getDate(artefact) {
    return artefact.date?.start || Infinity;
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
            (artefact.title && artefact.title.toLowerCase().includes(searchTerm)) ||
            artefact.description.toLowerCase().includes(searchTerm)
        )
    );

    updateSearchStatus(filteredData, selectedFilters);
    updateURLWithFilters(selectedFilters);
    displayGallery(filteredData);
}

function getSelectedFilters() {
    return {
        purpose: getCheckedValues('purpose'),
        type: getCheckedValues('type'),
        ware: getCheckedValues('ware'),
        region: getCheckedValues('region'),
        material: getCheckedValues('material'),
        historicPeriod: getCheckedValues('historicPeriod')
    };
}

function getCheckedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(checkbox => checkbox.value);
}

function displayGallery(artefacts) {
    const galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = artefacts.length ? artefacts.map(artefact => `
        <div class="gallery-item">
            <img class="small-img" src="${artefact.photo}" alt="${artefact.type}">
            <h3>${artefact.title || artefact.type}</h3>
            <p>${artefact.culturePeriod}</p>
        </div>
    `).join('') : '<p>No artefacts found matching the selected criteria.</p>';

    galleryContainer.querySelectorAll('.gallery-item').forEach((item, idx) => {
        item.addEventListener('click', () => window.location.href = `/pages/artefact.html?id=${artefacts[idx].id}`);
    });
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


function updateURLWithFilters(filters) {
    const urlParams = new URLSearchParams(window.location.search);

    Object.keys(filters).forEach(key => {
        if (filters[key].length) {
            urlParams.set(key, filters[key].join(','));
        } else {
            urlParams.delete(key);
        }
    });

    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
}

function updateSearchStatus(filteredData, filters) {
    document.getElementById('displayAmount').textContent = `${filteredData.length} Results`;
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
    filterText.textContent = `${filterValue}`;

    filterBox.addEventListener('click', () => removeFilter(filterCategory, filterValue));

    filterBox.appendChild(filterText);
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

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    const chevronIcon = button.querySelector('i');

    dropdownContent.classList.toggle('show');

    if (dropdownContent.classList.contains('show')) {
        chevronIcon.className = 'fa-solid fa-chevron-up';
    } else {
        chevronIcon.className = 'fa-solid fa-chevron-down';
    }

    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content !== dropdownContent) {
            content.classList.remove('show');
            const icon = content.previousElementSibling.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-chevron-down';
        }
    });
}


function toggleDisplayAmount(element) {
    const currentText = element.textContent;

    if (element.classList.contains("expanded")) {
        const numberOnly = currentText.split(" ")[0];
        element.textContent = numberOnly;
        element.classList.remove("expanded");
    } else {
        setTimeout(() => element.textContent = currentText + " Results", 50);
        element.classList.add("expanded");
    }
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(content => content.classList.remove('show'));
    }
});