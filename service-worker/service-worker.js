class ServiceWorker {
  constructor () {
    this.setupListeners()
  }

  setupListeners () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request).then(sendResponse);
      return true;
    })
  }

  async handleMessage (message) {
    if (message.type !== "get-shop") return
    const response = await fetch(`https://admin.shopify.com/store/${message.shopName}/shop.json`)
    const data = response.ok ? await response.json() : {}
    return data
  }
}

const serviceWorker = new ServiceWorker()
