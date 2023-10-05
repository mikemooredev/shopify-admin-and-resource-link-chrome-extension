class Popup {
  constructor () {
    this.setupListeners()
  }

  setupListeners  () {
    document.addEventListener('DOMContentLoaded', this.handleDomReady.bind(this))
    document.addEventListener('click', this.handleClick.bind(this))
  }

  handleDomReady () {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type:"shop-data-for-popup" }, this.handleResponse.bind(this))
    })
  }

  handleClick (event) {
    const buttonEl = event.target.closest('[data-copy-to-clipboard]')

    if (buttonEl) {
      buttonEl.toggleAttribute('data-pressed', true)
      navigator.clipboard.writeText(buttonEl.value)

      setTimeout(() => {
        buttonEl.toggleAttribute('data-pressed', false)
      }, 500)
    }
  }

  handleResponse (response) {
    if (!response?.data?.shopify && !response?.data?.meta) return

    this.data = response.data

    const defaultViewEl = document.querySelector('[data-view="default"]')
    const adminViewEl = document.querySelector('[data-view="admin"]')

    adminViewEl.innerHTML = `
      <h1>${response.shop.name}</h1>
      <p><strong>Store Name:</strong> ${this.storeName}</p>
      <p><strong>Theme Name:</strong> ${response.data.shopify.theme.name}</p>
      <p><strong>Theme ID:</strong> ${response.data.shopify.theme.id}</p>
      <button
        type="button"
        value="https://${this.data?.shopify?.shop}${response.data.location.pathname}?preview_theme_id=${response.data.shopify.theme.id}"
        title="https://${this.data?.shopify?.shop}${response.data.location.pathname}?preview_theme_id=${response.data.shopify.theme.id}"
        data-copy-to-clipboard
      >
        Copy Preview Link
      </button>

      <ul>
        <li>
          <a target="_blank" href="https://admin.shopify.com/store/${this.storeName}/">
            Shopify Admin
          </a>
        </li>
        <li>
          <a target="_blank" href="https://admin.shopify.com/store/${this.storeName}/themes/${response.data.shopify.theme.id}/editor?previewPath=${response.data.location.pathname}">
            Customiser
          </a>
        </li>

        ${this.resourceType && this.resourceId ? `
          <li>
            <a target="_blank" href="https://admin.shopify.com/store/${this.storeName}/${this.resourceType}s/${this.resourceId}">
              ${this.capitalizeFirstLetter(this.resourceType)} Admin
            </a>
          </li>
          <li>
            <a target="_blank" href="https://admin.shopify.com/store/${this.storeName}/${this.resourceType}s/${this.resourceId}/metafields">
              ${this.capitalizeFirstLetter(this.resourceType)} Metafields
            </a>
          </li>
          <li>
            <a target="_blank" href="https://shopify.dev/docs/api/liquid/objects/${this.resourceType}">
              Liquid Reference
            </a>
          </li>
        ` : ''}

        ${this.data?.shopify?.theme?.role === 'unpublished' ? `
          <li>
            <a target="_blank" href="https://admin.shopify.com/store/${this.storeName}/themes/${response.data.shopify.theme.id}">
              Edit Code
            </a>
          </li>
        ` : ''}
      </ul>
    `

    defaultViewEl?.setAttribute('aria-hidden', 'true')
    adminViewEl?.setAttribute('aria-hidden', 'false')
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

  get storeName () {
    return this.data?.shopify?.shop?.split('.')?.[0]
  }

  get resourceType () {
    return this.data?.meta?.page?.resourceType
  }

  get resourceId () {
    return this.data?.meta?.page?.resourceId
  }
}

const popup = new Popup()
