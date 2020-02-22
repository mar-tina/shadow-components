// Solution from https://stackoverflow.com/questions/10585029/parse-an-html-string-with-js
const parseRange = document.createRange();
export const html = Range.prototype.createContextualFragment.bind(parseRange);

/**
 * Initializes the application .
 * @param {string} selector
 * @param {html-template} component
 * @param {doc} document - Passing in the document for testing purposes
 * @returns {void}
 */
export let init = function(selector, component, doc) {
  let el = {};
  if (doc !== undefined) {
    el = doc.querySelector(selector);
  } else {
    el = document.querySelector(selector);
  }
  el.attachShadow({
    mode: "open"
  });

  el.shadowRoot.appendChild(component);
};

let addListener = (type, elem, f, args) => {
  elem[`${type}`] = e => {
    if (args.defaultAction === "true") {
      e.preventDefault();
    }
    f(e, args);
  };
};

/**
 * Passes the 'this' object to all the executing functions when node is mounted or unmounted
 * @param {THIS} elem - object that has reference to the current execution context
 * @param {function} f - onmount function to be called in the connectedCallback function
 */
let bindCycle = (elem, f) => {
  if (typeof f !== "undefined") {
    f(elem);
  } else {
    console.log("Onmount function is undefined");
  }
};

export let Shadow;

(function(Shadow) {
  (function(Base) {
    let BaseElement = (function() {
      function BaseElement() {}
      BaseElement.prototype.clone = function(args) {
        let clone = class extends HTMLElement {
          connectedCallback() {
            bindCycle(this, args.lifecycle.onMount);
          }
          constructor() {
            super();
            this.state = args.state;
            this.methods = args.methods;
            this.nestedNodes = [];
            this.renderTemplate = document.createElement("template");

            this._shadowRoot = this.attachShadow({
              mode: "open"
            });

            this._render();
          }

          setState(props) {
            for (var key in props) {
              if (props.hasOwnProperty(key)) {
                this.state[key] = props[key];
              }
            }
            // Solution inspired by https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
            //clearing all the nodes in the shadow root
            var i = 0;
            for (; i < this._shadowRoot.childNodes.length; ) {
              this._shadowRoot.removeChild(this.shadowRoot.childNodes[i]);
              i = +1;
            }

            this._render();
          }

          clean(node) {
            var i = 0;

            for (; i < node.childNodes.length; ) {
              if (
                node.childNodes[i].nodeType === 8 ||
                node.childNodes[i].nodeType === 3
              ) {
                node.removeChild(node.childNodes[i]);
              } else if (child.nodeType === 1) {
                this.clean(node.childNodes[i]);
              }
              i += 1;
            }

            return node;
          }

          _render() {
            let newTemplate = args.template(this.state);
            let tempDiv = document.createElement("div");

            tempDiv.appendChild(newTemplate);
            this.renderTemplate.innerHTML = tempDiv.innerHTML;

            tempDiv.innerHTML = "";
            let cloned = this.clean(
              this.renderTemplate.content.cloneNode(true)
            );

            tempDiv.appendChild(cloned);
            this._shadowRoot.appendChild(tempDiv.cloneNode(true));
            this._handleAttributes(this._shadowRoot.childNodes[0].childNodes);
          }

          setPassedAttribute = item => {
            let attrArray = Array.from(item.attributes);

            var allattributes = new Map();
            attrArray.map(attr => {
              allattributes.set(`${attr.nodeName}`, `${attr.nodeValue}`);
            }, "");

            let component = this._shadowRoot.getElementById(
              allattributes.get("id")
            );

            for (let [key, value] of allattributes.entries()) {
              if (key.startsWith("@")) {
                key = key.substr(1);
                addListener(`${key}`, component, this.methods[`${value}`], {
                  defaultAction: allattributes.get("default"),
                  ctx: this,
                  bound: allattributes.get("bind")
                });
              }
            }
          };

          _handleAttributes(newTemplate) {
            console.log("Has child nodes", newTemplate[0].hasChildNodes());
            newTemplate.forEach(this.recursivelyCheckForNodes);

            let filteredNodes = this.nestedNodes.filter(
              elem => elem.id !== undefined && elem.id !== ""
            );

            //empty nested nodes after every page refresh
            this.nestedNodes = [];
            filteredNodes.forEach(this.setPassedAttribute);
          }

          recursivelyCheckForNodes = node => {
            if (node.hasChildNodes()) {
              for (var i = 0; i < node.childNodes.length; i++) {
                this.nestedNodes.push(node);
                this.recursivelyCheckForNodes(node.childNodes[i]);
              }
            } else {
              this.nestedNodes.push(node);
            }
          };
        };

        return clone;
      };
      return BaseElement;
    })();
    Base.BaseElement = BaseElement;
  })(Shadow.Base || (Shadow.Base = {}));
})(Shadow || (Shadow = {}));

export let createShadowElement = args => {
  let newClass = new Shadow.Base.BaseElement.prototype.clone(args);

  return newClass;
};
