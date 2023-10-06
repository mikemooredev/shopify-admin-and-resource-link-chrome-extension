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
    this.windowData = this.isJsonString(event.data) ? JSON.parse(event.data) : {}

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

      window.sessionStorage.setItem(this.storageKey, JSON.stringify(response.shop))

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

  isJsonString (string) {
    try {
      JSON.parse(string)
    } catch (error) {
      return false
    }
    return true
  }

  get storeName () {
    const storeName = this.windowData?.Shopify?.shop?.split('.')?.[0]
    return storeName?.length ? storeName : null
  }

  get shopAdminDataFromSessionStorage () {
    const shopAdminData = window.sessionStorage.getItem(this.storageKey)
    if (!shopAdminData) return

    return JSON.parse(shopAdminData)
  }

  get storageKey () {
    return `${this.storeName}-${this.manifest.version}`
  }

  get manifest () {
    return chrome.runtime.getManifest()
  }
}

const contentScript = new ContentScript()


