import { Shadow, useState } from "../index.js";
import "./home.js";
import { sanitize } from "./utils.js";

export let App = new Shadow("my-app", {
  onMount: () => {
    console.log("Mounted my-app");
  },

  getInitialProps: self => {
    return useState({ name: "hi" }, self);
  },

  methods: {
    sayHi: e => {
      e.preventDefault();
      console.log("Saying hello");
    },

    handleInput: function(e, self) {
      e.preventDefault();
      let value = sanitize(e.target.value);
      self.setState({ name: value });
    }
  },

  template: self => {
    return /*html*/ `
      <div  @click="sayHi">
        Hello 
      </div>
      <div @bind="name">  </div>
      <input @change="handleInput"  />
      <home-el> </home-el>
    `;
  }
});
