// ==UserScript==
// @name        Hololive shop display item quantity
// @version     1.0.0
// @include     https://shop.hololivepro.com/*
// @run-at      document-end
// @grant       GM_addStyle
// @noframes
// ==/UserScript==
'use strict';

const items = document.querySelectorAll("[data-quantity]");
items.forEach((item) => {
    const quantity = item.dataset.quantity;
    const tooltip = `在庫: ${quantity}`;

    const parent = item.parentElement;
    if (parent) {
        parent.classList.add("shiaupiau_tooltip");
        parent.insertAdjacentHTML("beforeend", `<span class="shiaupiau_tooltiptext">${tooltip}</span>`);
    }
});

GM_addStyle(`
/* Tooltip container */
.shiaupiau_tooltip {
  position: relative;
}

/* Tooltip text */
.shiaupiau_tooltip .shiaupiau_tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  /* Fade in tooltip */
  opacity: 0;
  transition: opacity 0.3s;
}

/* Tooltip arrow */
.shiaupiau_tooltip .shiaupiau_tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.shiaupiau_tooltip:hover .shiaupiau_tooltiptext {
  visibility: visible;
  opacity: 1;
}
`);
