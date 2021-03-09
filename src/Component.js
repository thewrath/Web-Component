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
        this.inputs = {};
    }

    /**
     * Bind all inputs (find in shadow DOM) in inputs attributes.
     * @protected
     * @param {number} depth
     */
    _bindChildInputs(depth = 3) {
        this.inputs = [];
        const findInputs = (element, d) => {
            const inputs = [];
            for (let i = 0; i < element.children.length; ++i) {
                const element = element.children[i];
                if (element instanceof HTMLInputElement) {
                    if (inputs[element.name] || this.inputs[element.name]) {
                        throw new Error('Error, inputs already bind.');
                    }
                    inputs[element.name] = element;
                } else if (d > 0 && element.children.length > 0) {
                    inputs.concat(findInputs(element, d-1));
                }
            }

            return inputs;
        }

        this.inputs = findInputs(this._shadow, depth);
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

            this._shadow.appendChild(templateElement.content.cloneNode(true));

            this._bindChildInputs();
        }
    }

    /**
     * Call when element is disconnected from the DOM.
     */
    disconnectedCallback() {

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
     * @return {HTMLElementTagNameMap[K]}
     */
    getElementsByClassName(className) {
        this.querySelector(`.${className}`);
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
}