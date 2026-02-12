"use strict";

(() => {
  const template = `
      <div class='cstmc-wrapper'>
        <span class='cstmc-label'></span>
        <input type='text' class='cstmc-input'>
        <button class='cstmc-btn'>Submit</button>
      </div>
  `;

  const customStyles = `
      .cstmc-wrapper {
        border: var(--border, none);
        background-color: white;
        border-radius: 6px;
        padding: 8px;       
      }
      
      .cstmc-label {
        color: var(--text-color, #000);
        font-size: 12px;
        font-weight: bold;
      }
      
      .cstmc-input {
        color: var(--text-color, #000);
        font-size: 14px;
      }
      
      .cstmc-btn {
        color: blue;
        border: 0;
        border-radius: 4px;
        background-color: light-gray;
      }
`;

  class PureJsWebComponent extends HTMLElement {
    #inputData = null;
    set inputData(inputData) {
      this.#inputData = inputData;
      this.handleInputChange(inputData);
    }

    get inputData() {
      return this.#inputData;
    }

    get descriptor() {
      return {
        valueModel: {
          type: 'object',
          objectModel: {
            label: { type: 'string' },
            styles: {
              type: 'object',
              objectModel: {
                textColor: { type: 'string' },
                showBorder: { type: 'boolean', default: true, input: ['static'] }
              }
            }
          }
        }
      }
    }

    static observedAttributes = ['inputData'];

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      const styles = document.createElement('style');
      styles.innerText = customStyles;

      this.shadowRoot.innerHTML = template;
      this.shadowRoot.appendChild(styles);
      this.input = this.shadowRoot.querySelector('input');
      this.button = this.shadowRoot.querySelector('button');
      this.labelElement = this.shadowRoot.querySelector('.cstmc-label');

      this.button.addEventListener('click', () => {
        const event = new CustomEvent('outputAction', {
          detail: {value: this.input.value},
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    connectedCallback() {
      if (this.hasAttribute('inputData')) {
        this.handleInputChange(this.inputData);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'inputData') {
        this.inputData = newValue;
      }
    }

    handleInputChange(inputData) {
      this.labelElement.textContent = inputData?.label ?? '';
      this.shadowRoot.host.style.setProperty('--border', inputData?.styles?.showBorder ? '1px solid blue' : 'none');
      this.shadowRoot.host.style.setProperty('--text-color', inputData?.styles?.textColor ?? '#000');
    }
  }

  customElements.define('purejs-component', PureJsWebComponent);
})();