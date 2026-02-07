// All vendor menu items; super-admin can show/hide per vendor
export const VENDOR_MENU_ITEMS = [
  { menuKey: "home", label: "Home", path: "/vendor" },
  { menuKey: "applicants", label: "View Applicants", path: "/vendor/applicants" },
  { menuKey: "outlets", label: "Outlets", path: "/vendor/outlets" },
  { menuKey: "calendar", label: "Calendar", path: "/vendor/calendar" },
  { menuKey: "cv-links", label: "Active CV Links", path: "/vendor/cv-links" },
  { menuKey: "designation", label: "Designation", path: "/vendor/designation" },
  { menuKey: "client", label: "Client", path: "/vendor/client" },
  { menuKey: "manage-hr", label: "Manage HR", path: "/vendor/manage-hr" },
]

// User dropdown items that can be restricted (profile, settings, billing are usually always shown)
export const VENDOR_DROPDOWN_ITEMS = [
  { menuKey: "profile", label: "Profile", path: "/vendor/profile" },
  { menuKey: "settings", label: "Settings", path: "/vendor/settings" },
  { menuKey: "billing", label: "Billing", path: "/vendor/billing" },
]

export function getDefaultAllowedMap() {
  const map = {}
  VENDOR_MENU_ITEMS.forEach((m) => { map[m.menuKey] = true })
  VENDOR_DROPDOWN_ITEMS.forEach((m) => { map[m.menuKey] = true })
  return map
}
