class ServiceWorker {
  constructor () {
    this.setupListeners()
  }

  setupListeners () {
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))
  }

  handleMessage (message, sender, senderResponse) {
    if (message.type !== "get-shop") return

    fetch(`https://admin.shopify.com/store/${message.storeName}/shop.json`)
    .then(response => {
      return response.ok ? response.json() : {}
    }).then(response => {
      senderResponse(response)
    })

    return true
  }
}

const serviceWorker = new ServiceWorker()
