'use strict';

/**
 * Base component class.
 */
export class Component extends HTMLElement {

    /**
     *  Create new Vanilla WebComponent.
     *
     * @constructor
     * @param {string} name, component name.
     * @param {string | null} template, template used for this component.
     * @param {"open" | "closed"} mode,
     */
    constructor(name, template, mode = 'open') {
        super();
        this._template = template;
        this._shadow = this.attachShadow({ mode: mode });
    }

    /**
     * Call when element is connected to the DOM.
     */
    connectedCallback() {
        if (this._template) {
            const templateElement = document.getElementById(this._template);
            if (!templateElement instanceof HTMLTemplateElement) {
                throw new Error('Cannot find template element.');
            }

            this.appendChild(templateElement.content.cloneNode(true));
        }
    }

    /**
     * Call when element is disconnected from the DOM.
     */
    disconnectedCallback() {

    }

    /**
     * Adds inline style to the DOM shadow.
     * @param {string} css
     */
    _addInlineCss(css) {
        // Use host DOM CSS
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', css);

        // Append elements to shadow DOM
        this.appendChild(link);
    }

    /**
     * Append child to this element.
     *
     * @param newChild
     */
    appendChild(newChild) {
        this._shadow.appendChild(newChild);
    }

    /**
     * Get element in shadow DOM by ID.
     *
     * @param {string} id
     * @returns {*}
     */
    getElementById(id) {
        return this._shadow.getElementById(id);
    }

    /**
     * Get elements in shadow DOM by class name.
     *
     * @param {string} className
     * @return {NodeListOf<Element>}
     */
    getElementsByClassName(className) {
        return this._shadow.querySelectorAll(`.${className}`);
    }

    /**
     * Get element using query.
     *
     * @param {string} selector
     * @returns {HTMLElementTagNameMap[K]}
     */
    querySelector(selector) {
        return this._shadow.querySelector(selector);
    }

    /**
     * Clear content of this component.
     */
    clear() {
        this._shadow.innerHTML = '';
    }
}
