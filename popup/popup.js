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
    const detailsButtonEl = event.target.closest('[data-copy-store-detail]')

    if (detailsButtonEl) {
      const detailEl =  document.querySelector('[data-store-detail]')
      if(!detailEl) return

      this.setClipboard(detailEl.outerHTML)
      this.togglePressed(detailsButtonEl)
    }

    const previewButtonEl = event.target.closest('[data-copy-preview-url]')

    if (previewButtonEl) {
      this.setClipboard(previewButtonEl.value)
      this.togglePressed(previewButtonEl)
    }
  }

  handleResponse (response) {
    if (!response?.data?.Shopify && !response?.data?.meta) return

    this.data = response.data

    const defaultViewEl = document.querySelector('[data-view="default"]')
    const adminViewEl = document.querySelector('[data-view="admin"]')

    const params = new URLSearchParams(this.data?.location?.search)
    params.set('preview_theme_id', this.theme?.id)

    const adminUrl = `https://admin.shopify.com/store/${this.storeName}`
    const previewUrl = `https://${this.Shopify?.shop}${this.data.location.pathname}?${params.toString()}`

    adminViewEl.innerHTML = `
      <h1>${response.shop.name}</h1>
      <div data-store-detail>
        <p>
          <strong>Store Name:</strong> <a href="${adminUrl}/" target="_blank">${this.storeName}</a><br />
          <strong>Theme Name:</strong> ${this.theme?.name}<br />
          <strong>Theme ID:</strong> ${this.theme?.id}<br />
          <strong>Preview URL:</strong> <a href="${previewUrl}" target="_blank">${previewUrl}</a>
        </p>
      </div>

      <button
        type="button"
        value="${previewUrl}"
        data-copy-preview-url
      >
        Copy Preview URL
      </button>

      <button
        type="button"
        data-copy-store-detail
      >
        Copy Details
      </button>

      <ul>
        <li>
          <a target="_blank" href="${adminUrl}/">
            Shopify Admin
          </a>
        </li>
        <li>
          <a target="_blank" href="${adminUrl}/themes/${this.theme?.id}/editor?previewPath=${this.data.location.pathname}">
            Customiser
          </a>
        </li>

        ${this.resourceType && this.resourceId ? `
          <li>
            <a target="_blank" href="${adminUrl}/${this.resourceType}s/${this.resourceId}">
              ${this.capitalizeFirstLetter(this.resourceType)} Admin
            </a>
          </li>
          <li>
            <a target="_blank" href="${adminUrl}/${this.resourceType}s/${this.resourceId}/metafields">
              ${this.capitalizeFirstLetter(this.resourceType)} Metafields
            </a>
          </li>
          <li>
            <a target="_blank" href="https://shopify.dev/docs/api/liquid/objects/${this.resourceType}">
              Liquid Reference (${this.resourceType})
            </a>
          </li>
        ` : ''}

        ${this.hasPageTypeReference ? `
          <li>
            <a target="_blank" href="https://shopify.dev/docs/api/liquid/objects/${this.pageType}">
              Liquid Reference (${this.pageType})
            </a>
          </li>
        ` : ''}

        ${this.theme?.role === 'unpublished' ? `
          <li>
            <a target="_blank" href="${adminUrl}/themes/${this.theme?.id}">
              Edit Code
            </a>
          </li>
        ` : ''}
      </ul>
    `

    defaultViewEl?.setAttribute('aria-hidden', 'true')
    adminViewEl?.setAttribute('aria-hidden', 'false')
  }

  togglePressed (element) {
    element.toggleAttribute('data-pressed', true)

    setTimeout(() => {
      element.toggleAttribute('data-pressed', false)
    }, 400)
  }

  capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  setClipboard(content) {
    const blob = new Blob([content], {type: 'text/html'})
    const clipboardItem = new ClipboardItem({'text/html' : blob})
    navigator.clipboard.write([clipboardItem])
  }

  get hasPageTypeReference () {
    if(!this.pageType?.length || this.pageType === this.resourceType) return

    switch(this.pageType) {
      case 'home':
        return false
      default:
        return true
    }
  }

  get Shopify () {
    return this.data?.Shopify
  }

  get storeName () {
    return this.Shopify?.shop?.split('.')?.[0]
  }

  get theme () {
    return this.Shopify?.theme
  }

  get resourceType () {
    return this.data?.meta?.page?.resourceType
  }

  get resourceId () {
    return this.data?.meta?.page?.resourceId
  }

  get pageType () {
    return this.data?.meta?.page?.pageType
  }
}

const popup = new Popup()
