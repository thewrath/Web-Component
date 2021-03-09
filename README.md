# Vanilla component

Vanilla component is a personal project that aims to provide custom native Javascript components (web component). This project has no other goal than to make my own component library.

The interest of web components is to be able to take advantage of new methods of software development without making the decision to choose a specific framework. Some features found in the "big" JS front-end framework are not present but the browser APIs already provide a lot of features.

I would increment this repository as I need it.

# Usage

## Basics

The base class is the `Component` class, it inherits from `HTMLElement` and instantiates a `ShadowRoot` object which has as a child a template provided during construction.
```js
import {Component} from "./Component";

export class MyCustomComponent extends Component {
    
    constructor() {
        // Create new HTMLElement and add instance of 'my-custom-template' has first child.
        super('my-custom-component', 'my-custom-template', 'open');
    }
    
    connectedCallback() {
        // Find element in this component.
        this.getElementById('something-in-my-template');        
    }
}

```

Some more advanced classes allow more cool stuff.

```js
import {FormComponent} from "./FormComponent";

/**
 * <template id="contact-form-template">
 *     <form name="contact-form">
 *         <input name="email" type="email"></input>
 *         <input name="send" type="submit"></input>
 *     </form>    
 * </template>
 */

export class ContactFormComponent extends FormComponent {
    constructor() {
        super('contact-form-component', 'contact-form-template');
    }
    
    connectedCallback() {
        // Ypu can directly access to input of your form
        this.forms['contact-form'].onsubmit = _ => {
            e.preventDefault()
            const email = this.inputs['email'];
            // Send form using fetch API
            return false;
        }
    }
}
```
 
N'oubliez de déclarer vos web component avec : 
```js
customElements.define('contact-form-component', ContactFormComponent);
```

## Event handling

But how do I manage the communication between my components?

Like any other framework, using observer/observable:

```js
import {Component} from "./Component";

export class MyEventSenderComponent extends Component {
    constructor() {
        // You don't have to pass a template under construction if you don't need it.
        super('my-event-sender-component', null);
    }

    connectedCallback() {
        // Ypu can directly access to input of your form
        const coolButton = document.createElement('button');

        // Observable can listen to 'catch-this-event'
        coolButton.onclick = _ => this.dispatchEvent(new Event('catch-this-event'));
        
        this.appendChild(coolButton);
    }
}

export class MyEventCatcherComponent extends Component {
    constructor() {
        // You don't have to pass a template under construction if you don't need it.
        super('my-event-catcher-component', null);
    }

    connectedCallback() {
        const myEventSenderComponent = new MyEventSenderComponent();
        
        // Listen for event from myEventSenderComponent 
        myEventSenderComponent.addEventListener('catch-this-event', _ => {
            console.log('I catch your event !');
        })
        
        this.appendChild(myEventSenderComponent);
    }
}

```
And yes ... this is the event mechanism included in the HTML5 API of all browsers.
Why would you want another one?

# License
[MIT](https://choosealicense.com/licenses/mit/)