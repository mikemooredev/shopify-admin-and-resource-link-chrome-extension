# Shopify Admin and Resource link - Chrome Extension

## Installation

- Navigate to the [extensions page](chrome://extensions/) `(chrome://extensions/)` in Google Chrome
- Turn on "Developer mode". (Toggle in top right corner)
- Click on "Load Unpacked" and select the folder on your machine containing the extension's code

## How does it work?

- The file `content-script.js` initialises the functionality by injecting a JS file called `post-message.js` into every website visited when the extension is enabled
- If `window.Shopify` exists on that website `post-message.js` collects data from the `window` object and sends it back to `content-script.js`
- The extension then needs to check if the user has admin access to that Shopify store.
  - `service-worker.js` performs a fetch request to the `https://admin.shopify.com/store/{storeName}/shop.json` endpoint which only succeeds when the user is signed in and has admin rights
  - `service-worker.js` returns the collected shop data to `content-script.js`
  - `content-script.js` stores the shop data in `sessionStorage` so the extension only needs to perform one fetch request per session, per store.
- When the user clicks on the extension 'popup.js' requests the shop data from `content-script.js`
  - When shop data exists the popup displays helpful links relevant to the current page being viewed by the user

## What does it look like?

<img width="360" alt="image" src="https://github.com/mikemooredev/shopify-admin-and-resource-link-chrome-extension/assets/20971511/218ad791-8948-46f5-bd54-eefae6677c7a">
