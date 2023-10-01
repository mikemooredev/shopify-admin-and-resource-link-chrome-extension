class ContentScript {
  constructor () {
    this.injectWebAccessibleResources()
    this.setupListeners()
  }

  injectWebAccessibleResources () {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('web-accessible-resources/js/post-message.js')
    script.onload = () => {
      script.remove()
    }
    (document.head || document.documentElement).appendChild(script)
  }

  setupListeners () {
    window.addEventListener("message", this.handlePostMessages.bind(this), false)

    chrome.runtime.onMessage.addListener(this.handleChromeRuntimeMessages.bind(this))
  }

  handlePostMessages (event) {
    if (event.origin !== window.location.origin || !event.isTrusted || !event.data.length) return
    this.windowData = JSON.parse(event.data)

    if (this.shopAdminDataFromSessionStorage) {
      this.data = {
        shop: this.shopAdminDataFromSessionStorage,
        data: this.windowData
      }
      return
    }

    // Get shop admin data
    if (!this.storeName) return
    chrome.runtime.sendMessage({ type: 'get-shop', storeName: this.storeName }, (response) => {
      if (!response.shop) return

      window.sessionStorage.setItem(this.storeName, JSON.stringify(response.shop))

      this.data = {
        shop: response.shop,
        data: this.windowData
      }
    })
  }

  handleChromeRuntimeMessages (request, sender, sendResponse) {
    if (this.data && request.type === 'shop-data-for-popup') {
      sendResponse(this.data)
    } else {
      sendResponse({})
    }

    return true
  }

  get storeName () {
    return this.windowData?.shopify?.shop?.split('.')?.[0]
  }

  get shopAdminDataFromSessionStorage () {
    const shopAdminData = window.sessionStorage.getItem(this.storeName)
    if (!shopAdminData) return

    return JSON.parse(shopAdminData)
  }
}

const contentScript = new ContentScript()


