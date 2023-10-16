(async () => {
  if(!window?.Shopify) return

  const { Shopify, meta, location } = window

  const data = {
    isShopify: !!Shopify,
    isCheckout: !!Shopify?.Checkout,
    shop: {
      name: Shopify?.shop?.split('.')?.[0],
      url: Shopify?.shop
    },
    theme: {
      id: Shopify?.theme?.id,
      name: Shopify?.theme?.name,
      role: Shopify?.theme?.role
    },
    meta,
    location
  }

  window.postMessage(JSON.stringify(data), window.location.origin)
})()
