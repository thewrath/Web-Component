'use strict';

import {Component} from "./Component";

/**
 * Form component, allow you to easily access to form inputs of corresponding template.
 */
export class FormComponent extends Component {

    /**
     *  Create new FormComponent.
     *
     * @constructor
     * @param {string} name, component name.
     * @param {string | null} template, template used for this component.
     * @param {"open" | "closed"} mode,
     */
    constructor(name, template, mode = 'open') {
        super(name, template, mode);
        this.forms = {};
        this.inputs = {};
    }

    /**
     * Bind all inputs (find in shadow DOM) in inputs attributes.
     * @protected
     * @param types
     * @return {{}} elements corresponding to one of the types
     */
    _findChildElements(...types) {
        const findInputs = (parent, d) => {
            let elements = {};
            for (let i = 0; i < parent.children.length; i++) {
                const child = parent.children[i];
                if (types.find(type => type.prototype.isPrototypeOf(child))) {
                    if (elements[child.name] || this.inputs[child.name]) {
                        throw new Error('Error, inputs already bind.');
                    }
                    elements[child.name] = child;
                }
                if (d > 0 && child.children.length > 0) {
                    Object.assign(elements, findInputs(child, d-1));
                }
            }

            return elements;
        }

        return findInputs(this._shadow, 10);
    }

    connectedCallback() {
        super.connectedCallback();
        if (this._template) {
            this.inputs = this._findChildElements(HTMLInputElement, HTMLSelectElement);
            this.forms = this._findChildElements(HTMLFormElement);
        }
    }
}
