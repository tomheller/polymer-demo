class UserStatus extends HTMLElement {

      static get is() { 
        return 'user-status'; 
      }


      static get observedAttributes() { 
        return ['name', 'status'];
      }

      /*
      * Attribute properties
      */
      get name() {
        return this.getAttribute('name') || 'Hello Stahlstadt';
      }

      set name(val) {
        this.setAttribute('name', val);
        this.shadowRoot.querySelector('#user-status-name').innerText = val;
        this.shadowRoot.querySelector('#user-status-avatar').innerText = this.userAbbreviation(this.name);
        this._applyUserColor();
      }

      get status() {
        return this.getAttribute('status') || 'offline';
      }

      set status(val) {
        this.setAttribute('status', val);
        this.shadowRoot.querySelector('#user-status-statussymbol').setAttribute('xlink:href', `#${val}`);
      }

      // observer for name
      _nameChange(newValue, oldValue) {
        const hash = newValue.split('').reduce((prevHash, currVal) => {
          return ((prevHash << 5) - prevHash) + currVal.charCodeAt(0)
        } , 0);
        const color = '#' + Math.abs(hash).toString(16).slice(0, 6);
        this.updateStyles({'--usercolor': color});
      }

      // computed property function
      userAbbreviation(name) {
        if (name) {
          return name.split(' ')
            .map(e => e[0])
            .slice(0, 2)
            .join('');
        }
        return 'JS';
      }

      // click on status handler
      _handleStatusClick(evt) {
        const isHidden = this.hasAttribute('hidden');
        if (isHidden) {
          this.removeAttribute('hidden');
        } else {
          this.setAttribute('hidden', true);
        }
      }

      _applyUserColor() {
        const name = this.name;
        const hash = name.split('').reduce((prevHash, currVal) => {
          return ((prevHash << 5) - prevHash) + currVal.charCodeAt(0)
        } , 0);
        const color = '#' + Math.abs(hash).toString(16).slice(0, 6);
        this.style.setProperty('--usercolor', color);
      }

      // click handler for status change
      _changeStatus(evt) {
        evt.stopPropagation();
        const newStatus = evt.target.dataset.status;
        this.status = newStatus;
        this.shadowRoot.querySelector('#user-status-selector').setAttribute('hidden', true);
      }

      constructor() {
        super();
        let shadowRoot = this.attachShadow({mode: 'open'});
        const template = document.querySelector('#user-status');
        const instance = template.content.cloneNode(true);
        
        // set defaults
        instance.querySelector('#user-status-name').innerText = this.name;
        instance.querySelector('#user-status-avatar').innerText = this.userAbbreviation(this.name);
        instance.querySelector('#user-status-statussymbol').setAttribute('xlink:href', `#${this.status}`);
        shadowRoot.appendChild(instance);
      }

      connectedCallback() {
        this._applyUserColor();
        const statusToggle = this.shadowRoot.querySelector('#user-status-status');
        const statusSelector = this.shadowRoot.querySelector('#user-status-selector');
        statusToggle.addEventListener('click', this._handleStatusClick.bind(statusSelector));

        [].slice.call(statusSelector.querySelectorAll('.status-button')).forEach(btn => {
          btn.addEventListener('click', this._changeStatus.bind(this));
        });
      }

      disconnectedCallback() {
        // could clear eventlisteners if ones were attached outside of the shadow-root
      }

      attributeChangedCallback(attribute, oldValue, newValue) {
        if (oldValue === newValue) {
          return;
        }
        switch(attribute) {
          case 'name':
            this.name = newValue;
            break;
          case 'status':
            this.status = newValue;
            break;
          default: 
            return;
        }
      }
    }

    window.customElements.define(UserStatus.is, UserStatus);