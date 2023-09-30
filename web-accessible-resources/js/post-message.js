(async () => {
  const windowData = window?.Shopify ? {
    shopify: window.Shopify,
    meta: window.meta,
    location: window.location
  } : {}

  window.postMessage(JSON.stringify(windowData), window.location.origin)
})()
