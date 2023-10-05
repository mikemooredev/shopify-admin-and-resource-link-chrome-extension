(async () => {
  if(!window?.Shopify) return

  const data = {
    Shopify: window.Shopify,
    meta: window.meta,
    location: window.location
  }

  window.postMessage(JSON.stringify(data), window.location.origin)
})()
