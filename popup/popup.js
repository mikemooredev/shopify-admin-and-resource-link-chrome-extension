class Popup {
  constructor () {
    this.setupListeners()
  }

  setupListeners  () {
    document.addEventListener('DOMContentLoaded', this.handleDomReady.bind(this))
    document.addEventListener('click', this.handleClick.bind(this))
    document.addEventListener('focusin', this.handleFocusIn.bind(this))
  }

  handleDomReady () {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type:"shop-data-for-popup" }, this.handleResponse.bind(this))
    })
  }

  handleClick (event) {
    const openUrlButtonEl = event.target.closest('[data-open-url]')

    if (openUrlButtonEl) {
      window.open(openUrlButtonEl.value, '_blank')
      this.togglePressed(openUrlButtonEl)
    }

    const detailsButtonEl = event.target.closest('[data-copy-store-detail]')

    if (detailsButtonEl) {
      const detailEl =  document.querySelector('[data-store-detail]')
      if(!detailEl) return

      this.setClipboard(detailEl.outerHTML)
      this.togglePressed(detailsButtonEl)
    }

    const copyPreviewButtonEl = event.target.closest('[data-copy-preview-url]')

    if (copyPreviewButtonEl) {
      this.setClipboard(copyPreviewButtonEl.value)
      this.togglePressed(copyPreviewButtonEl)
    }

    const previewUrlInputEl = event.target.closest('[data-preview-url-input]')

    if (previewUrlInputEl) {
      previewUrlInputEl.select()
    }
  }

  handleFocusIn (event) {
    const previewUrlInputEl = event.target.closest('[data-preview-url-input]')

    if (previewUrlInputEl) {
      previewUrlInputEl.select()
    }
  }

  handleResponse (response) {
    if (!response?.isShopify && !response?.meta) return

    this.data = response

    const defaultViewEl = document.querySelector('[data-view="default"]')
    const accessRequiredViewEl = document.querySelector('[data-view="admin-access-required"]')
    const checkoutViewEl = document.querySelector('[data-view="checkout"]')
    const adminViewEl = document.querySelector('[data-view="admin"]')

    const params = new URLSearchParams(this.data?.location?.search)
    params.set('preview_theme_id', this.theme?.id)

    const adminUrl = `https://admin.shopify.com/store/${this.shopName}`
    const previewUrl = `https://${this.shopUrl}${this.data.location.pathname}?${params.toString()}`

    adminViewEl.innerHTML = `
      <h1>${this.data?.adminShop?.name}</h1>
      <div data-store-detail>
        <p>
          <strong>Store Name:</strong> <a href="${adminUrl}/" target="_blank">${this.shopName}</a><br />
          <strong>Theme Name:</strong> ${this.theme?.name}<br />
          <strong>Theme ID:</strong> ${this.theme?.id}<br />
          <span class="row">
            <strong>Preview URL:</strong><a href="${previewUrl}" class="visually-hidden">${previewUrl}</a>
            <input type="text" value="${previewUrl}" data-preview-url-input />

            <button
              type="button"
              class="icon"
              value="${previewUrl}"
              data-copy-preview-url
              title="Copy Preview URL"
            >
              <svg fill="currentColor" height="16px" xmlns="http://www.w3.org/2000/svg" viewBox="2.14 0 11.72 16"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M13.49 3 10.74.37A1.22 1.22 0 0 0 9.86 0h-4a1.25 1.25 0 0 0-1.22 1.25v11a1.25 1.25 0 0 0 1.25 1.25h6.72a1.25 1.25 0 0 0 1.25-1.25V3.88a1.22 1.22 0 0 0-.37-.88zm-.88 9.25H5.89v-11h2.72v2.63a1.25 1.25 0 0 0 1.25 1.25h2.75zm0-8.37H9.86V1.25l2.75 2.63z"></path><path d="M10.11 14.75H3.39v-11H4V2.5h-.61a1.25 1.25 0 0 0-1.25 1.25v11A1.25 1.25 0 0 0 3.39 16h6.72a1.25 1.25 0 0 0 1.25-1.25v-.63h-1.25z"></path></g></svg>
            </button>

            <button
              type="button"
              class="icon"
              value="${previewUrl}"
              data-open-url
              title="Open preview"
            >
              <svg fill="none" height="16px" xmlns="http://www.w3.org/2000/svg" viewBox="1.71 1.71 20.9 20.9"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13.2218 3.32234C15.3697 1.17445 18.8521 1.17445 21 3.32234C23.1479 5.47022 23.1479 8.95263 21 11.1005L17.4645 14.636C15.3166 16.7839 11.8342 16.7839 9.6863 14.636C9.48752 14.4373 9.30713 14.2271 9.14514 14.0075C8.90318 13.6796 8.97098 13.2301 9.25914 12.9419C9.73221 12.4688 10.5662 12.6561 11.0245 13.1435C11.0494 13.1699 11.0747 13.196 11.1005 13.2218C12.4673 14.5887 14.6834 14.5887 16.0503 13.2218L19.5858 9.6863C20.9526 8.31947 20.9526 6.10339 19.5858 4.73655C18.219 3.36972 16.0029 3.36972 14.636 4.73655L13.5754 5.79721C13.1849 6.18774 12.5517 6.18774 12.1612 5.79721C11.7706 5.40669 11.7706 4.77352 12.1612 4.383L13.2218 3.32234Z" fill="currentColor"></path> <path d="M6.85787 9.6863C8.90184 7.64233 12.2261 7.60094 14.3494 9.42268C14.7319 9.75083 14.7008 10.3287 14.3444 10.685C13.9253 11.1041 13.2317 11.0404 12.7416 10.707C11.398 9.79292 9.48593 9.88667 8.27209 11.1005L4.73655 14.636C3.36972 16.0029 3.36972 18.219 4.73655 19.5858C6.10339 20.9526 8.31947 20.9526 9.6863 19.5858L10.747 18.5251C11.1375 18.1346 11.7706 18.1346 12.1612 18.5251C12.5517 18.9157 12.5517 19.5488 12.1612 19.9394L11.1005 21C8.95263 23.1479 5.47022 23.1479 3.32234 21C1.17445 18.8521 1.17445 15.3697 3.32234 13.2218L6.85787 9.6863Z" fill="currentColor"></path> </g></svg>
            </button>
          </span>
        </p>
      </div>

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

    if (!this.data?.isShopify) {
      defaultViewEl?.setAttribute('aria-hidden', 'false')
      accessRequiredViewEl?.setAttribute('aria-hidden', 'true')
      checkoutViewEl?.setAttribute('aria-hidden', 'true')
      adminViewEl?.setAttribute('aria-hidden', 'true')
      return
    }

    if (this.data?.isShopify && !this.data?.adminShop?.name) {
      defaultViewEl?.setAttribute('aria-hidden', 'true')
      accessRequiredViewEl?.setAttribute('aria-hidden', 'false')
      checkoutViewEl?.setAttribute('aria-hidden', 'true')
      adminViewEl?.setAttribute('aria-hidden', 'true')
      return
    }

    if (this.data?.isCheckout) {
      defaultViewEl?.setAttribute('aria-hidden', 'true')
      accessRequiredViewEl?.setAttribute('aria-hidden', 'true')
      checkoutViewEl?.setAttribute('aria-hidden', 'false')
      adminViewEl?.setAttribute('aria-hidden', 'true')
      return
    }

    if (this.data?.isShopify && this.data?.adminShop?.name) {
      defaultViewEl?.setAttribute('aria-hidden', 'true')
      accessRequiredViewEl?.setAttribute('aria-hidden', 'true')
      checkoutViewEl?.setAttribute('aria-hidden', 'true')
      adminViewEl?.setAttribute('aria-hidden', 'false')
      return
    }
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

  get shopUrl () {
    return this.data?.shop?.url
  }

  get shopName () {
    return this.data?.shop?.name
  }

  get theme () {
    return this.data?.theme
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
