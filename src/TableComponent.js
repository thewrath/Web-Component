import {Component} from "./Component";

/**
 * Table component is an html table that is filled with content from a remote resource (API, file, ...). A pagination is automatically generated.
 *
 * @abstract
 */
export class TableComponent extends Component {

    /**
     * Builds a new table element.
     *
     * @param {string} name, component name.
     * @param {string | null} template, template used for this component.
     * @param {"open" | "closed"} mode,
     */
    constructor(name, template, mode = 'open') {
        super(name, template, mode);
        this.currentPage = 1;
        this._allowMultipleSelection = true;
    }

    connectedCallback() {
        this.table = document.createElement('table');
        this.table.setAttribute('class', 'table table-hover table-sm');

        this.appendChild(this.table);

        this.pagination = document.createElement('div');
        this.pagination.setAttribute('class', 'navigation');

        this.appendChild(this.pagination);
        this._changePage(this.currentPage);
    }

    /**
     * Returns selected items.
     *
     * @param {boolean} unSelect
     * @return {[]}
     */
    getSelectedItems(unSelect = false) {
        return this._getCheckedBoxes('item-selection-checkbox', unSelect).map(el => el.getAttribute('data-item-id'));
    }

    /**
     * Update list content using items from json.
     *
     * @param {Object} json
     * @protected
     */
    _update(json) {
        this._clearTable();
        this._fillTableWithElement(json);
        this._generatePagination(json);
    }


    /**
     * Change the page of the listing.
     *
     * @param {number} index
     * @protected
     */
    _changePage(index) {
        this.currentPage = index;
        this.pagination.innerHTML = '';

        this._getItems(index).then(items => this._update(items));
    }

    /**
     * Returns the list headers.
     *
     * @return {string[]}
     * @abstract
     * @protected
     */
    _getTableHeaders(){};

    /**
     * Retrieves the items in the list from a remote resource.
     *
     * @return {Object[]}
     * @abstract
     * @protected
     */
    async _getItems(){};

    /**
     * Turns the raw item into an item to be displayed.
     *
     * @param {Object} item
     * @abstract
     * @protected
     */
    _parseItem(item){};

    /**
     * Useful function to create a checkbox for the line corresponding to the id.
     *
     * @param {number} id
     * @return {HTMLDivElement}
     * @protected
     */
    _createCheckbox(id) {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.setAttribute('class', 'custom-control custom-checkbox');

        const checkboxId = `item-selection-checkbox-${id}`;
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', checkboxId);
        checkbox.setAttribute('class', 'item-selection-checkbox custom-control-input');

        // Set data to we save the event id to retrieve it during validation.
        checkbox.dataset.itemId = id;

        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('class', 'custom-control-label');
        checkboxLabel.setAttribute('for', checkboxId);

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(checkboxLabel);

        return checkboxDiv;
    }

    /**
     * Fill table content with data from json.
     *
     * @param {Object} json
     * @protected
     */
    _fillTableWithElement(json) {
        // Create and fill table header
        const thead = this.table.createTHead();
        const theadRow = thead.insertRow(0);
        this._getTableHeaders().forEach((header) => {
            const cell = document.createElement('th');
            cell.innerText = header;
            cell.setAttribute('scope', 'col');
            theadRow.appendChild(cell);
        });

        // Create and fill table body
        const tbdy = document.createElement('tbody');
        json.items.forEach((item) => {
            const tr = document.createElement('tr');
            tr.onclick = _ => this._selectItem(item);
            this._parseItem(item).forEach((parsedItem) => {
                const td = document.createElement('td');
                td.appendChild(parsedItem);
                tr.appendChild(td);
            });
            tbdy.appendChild(tr);
        });
        this.table.appendChild(tbdy);
    }

    /**
     * Generate pagination with data from json.
     * Todo : Make the pagination generation dynamic
     *
     * @param {Object} json
     * @protected
     */
    _generatePagination(json) {
        // Helper to add li with inner a tag to ul
        const addLiToUl = (ul, liClass, aClass, pageIndex, text) => {
            const clickItemFunction = (e) => {
                e.preventDefault();
                this._changePage(pageIndex);
                return false;
            };
            const li = document.createElement('li');
            liClass.forEach((c) => {
                li.classList.add(c);
            });
            const a = document.createElement('a');
            aClass.forEach((c) => {
                a.classList.add(c);
            });
            if (pageIndex) {
                a.onclick = clickItemFunction;
            }
            a.innerText = text;
            li.appendChild(a);
            ul.appendChild(li);
        };

        // Get all page
        const limit = Math.ceil(json.total_count / json.num_items_per_page);
        const spacing = 5;
        const start = json.current_page_number;
        const end = json.current_page_number + spacing;
        const ul = document.createElement('ul');
        ul.classList.add('pagination');
        ul.classList.add('justify-content-center');

        // Add previous button
        addLiToUl(ul, ['page-item'], ['page-link'], json.current_page_number - 1, 'Précédent');

        // Add numbers button
        if (json.current_page_number !== 1) {
            addLiToUl(ul, ['page-item'], ['page-link'], 1, 1);
            if (json.current_page_number > 2) {
                addLiToUl(ul, ['page-item'], ['page-link'], null, '...');
            }
        }

        for (let i = start; i < end; i++) {
            if (i < limit) {
                const liClasses = ['page-item'];
                if (i === json.current_page_number) {
                    liClasses.push('active');
                }
                addLiToUl(ul, liClasses, ['page-link'], i, i);
            }
        }
        if (json.current_page_number + spacing < limit) {
            addLiToUl(ul, ['page-item'], ['page-link'], null, '...');
        }
        addLiToUl(ul, ['page-item'], ['page-link'], limit, limit);

        // Add next button
        addLiToUl(ul, ['page-item'], ['page-link'], json.current_page_number + 1, 'Suivant');
        this.pagination.appendChild(ul);
    }

    /**
     * Select given item.
     *
     * @param {number} item
     * @protected
     */
    _selectItem(item) {
        const checkbox = this.getElementById(`item-selection-checkbox-${item.id}`);
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
        }
    }

    /**
     * Return all checked checkboxes.
     *
     * @param {string} checkboxClass
     * @param {boolean} unSelect
     * @returns {*[]}
     * @protected
     */
    _getCheckedBoxes(checkboxClass, unSelect) {
        // get by class name is not available for a shadowRoot element
        const checkboxes = this.getElementsByClassName(checkboxClass);
        const checkboxesChecked = [];
        if (this._allowMultipleSelection) {
            // loop over them all
            for (let i = 0; i < checkboxes.length; i++) {
                // And stick the checked ones onto an array...
                if (checkboxes[i].checked) {
                    checkboxesChecked.push(checkboxes[i]);

                    if (unSelect) {
                        checkboxes[i].checked = false;
                    }
                }
            }
        } else {
            if (checkboxes[0].checked) {
                checkboxesChecked.push(checkboxes[0]);

                if (unSelect) {
                    checkboxes[0].checked = false;
                }
            }
        }
        return checkboxesChecked;
    }

    /**
     * Clear table content.
     *
     * @protected
     */
    _clearTable() {
        this.table.innerHTML = '';
    }
}
