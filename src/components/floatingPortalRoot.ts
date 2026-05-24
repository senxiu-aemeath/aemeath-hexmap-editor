const APP_FLOATING_PORTAL_ROOT_ID = 'app-floating-portal-root'

export function getFloatingPortalRoot() {
  if (typeof document === 'undefined') {
    return null
  }

  return document.getElementById(APP_FLOATING_PORTAL_ROOT_ID) ?? document.body
}

export { APP_FLOATING_PORTAL_ROOT_ID }
