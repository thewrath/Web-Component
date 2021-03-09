import { Component } from "./Component";

class TestComponent extends Component {

    constructor() {
        super("test-component", null, 'open');
    }

}
customElements.define("test-component", TestComponent);

test("Add component to DOM", () => {
    const testComponent = new TestComponent();
    document.appendChild(testComponent);
    expect(document.getElementsByTagName("test-component")).toContain(testComponent);
});