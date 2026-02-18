// All vendor menu items; super-admin can show/hide per vendor
export const VENDOR_MENU_ITEMS = [
  { menuKey: "home", label: "Home", path: "/vendor" },
  { menuKey: "applicants", label: "Applicants", path: "/vendor/applicants" },
  { menuKey: "outlets", label: "Outlets", path: "/vendor/outlets" },
  { menuKey: "calendar", label: "Calendar", path: "/vendor/calendar" },
  { menuKey: "replacements", label: "Replacements", path: "/vendor/replacements" },
  { menuKey: "cv-links", label: "Active CV Links", path: "/vendor/cv-links" },
  { menuKey: "data_management", label: "Data Management", path: "/vendor/data-management" },
  { menuKey: "client", label: "Client", path: "/vendor/client" },
  { menuKey: "manage-hr", label: "Manage HR", path: "/vendor/manage-hr" },
  { menuKey: "analytics", label: "Analytics", path: "/vendor/analytics" },
  { menuKey: "menu-permissions", label: "Action menu control", path: "/vendor/menu-permissions" },
]

// Top-level nav (before "More" dropdown); rest appear inside "More" dropdown
export const PRIMARY_NAV_KEYS = ["home", "applicants", "outlets", "calendar"]

// User dropdown items that can be restricted (profile, settings, billing are usually always shown)
export const VENDOR_DROPDOWN_ITEMS = [
  { menuKey: "profile", label: "Profile", path: "/vendor/profile" },
  { menuKey: "settings", label: "Settings", path: "/vendor/settings" },
  { menuKey: "billing", label: "Billing", path: "/vendor/billing" },
]

// Feature flags: export CSV, bulk status, analytics page (calendar is a menu item)
export const FEATURE_KEYS = [
  { menuKey: "export_csv", label: "Export CSV" },
  { menuKey: "bulk_status", label: "Bulk status change" },
]

// Action menu items in candidate row dropdown (show/hide per vendor/HR)
export const ACTION_ITEM_KEYS = [
  { menuKey: "action_view_details", label: "View Details" },
  { menuKey: "action_edit", label: "Edit" },
  { menuKey: "action_schedule_interview", label: "Schedule Interview" },
  { menuKey: "action_share_info", label: "Share info" },
  { menuKey: "action_call", label: "Call" },
  { menuKey: "action_email", label: "Email" },
  { menuKey: "action_download_resume", label: "Download Resume" },
  { menuKey: "action_history", label: "History" },
  { menuKey: "action_activate_cv_link", label: "Activate CV Link" },
  { menuKey: "action_deactivate_cv_link", label: "Deactivate CV Link" },
  { menuKey: "action_mark_inactive", label: "Mark inactive" },
  { menuKey: "action_activate", label: "Activate" },
  { menuKey: "action_delete", label: "Delete" },
]

export function getDefaultAllowedMap() {
  const map = {}
  VENDOR_MENU_ITEMS.forEach((m) => { map[m.menuKey] = true })
  VENDOR_DROPDOWN_ITEMS.forEach((m) => { map[m.menuKey] = true })
  FEATURE_KEYS.forEach((f) => { map[f.menuKey] = true })
  ACTION_ITEM_KEYS.forEach((a) => { map[a.menuKey] = true })
  return map
}
