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

    const data = this.isJsonString(event.data) ? JSON.parse(event.data) : {}

    if (!data?.isShopify) return

    this.data = data

    if (this.adminShopDataFromSessionStorage) {
      this.data.adminShop = this.adminShopDataFromSessionStorage
      return
    }

    // Get shop admin data
    if (!this.data?.shop?.name) return
    chrome.runtime.sendMessage({ type: 'get-shop', shopName: this.data?.shop?.name }, (response) => {
      if (!response.shop) return

      window.sessionStorage.setItem(this.storageKey, JSON.stringify(response.shop))

      this.data.adminShop = response.shop
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

  isJsonString (string) {
    try {
      JSON.parse(string)
    } catch (error) {
      return false
    }
    return true
  }

  get adminShopDataFromSessionStorage () {
    const adminShopData = window.sessionStorage.getItem(this.storageKey)
    if (!adminShopData) return

    return JSON.parse(adminShopData)
  }

  get storageKey () {
    return `${this.shopName}-${this.manifest.version}`
  }

  get manifest () {
    return chrome.runtime.getManifest()
  }
}

const contentScript = new ContentScript()


