// All statuses with distinct color codes for badges/tags
// value: stored in DB (slug), label: display text, color: Tailwind badge classes
export const CANDIDATE_STATUSES = [
  { value: "all", label: "All Statuses", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "standby-cv", label: "Standby CV", color: "bg-slate-100 text-slate-800 border-slate-200" },
  { value: "online-telephonic-interview", label: "Online/Telephonic Interview", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { value: "online-interview-done-waiting-results", label: "Online Interview Done - Waiting Results", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "waiting-for-call-back", label: "Waiting for Call Back", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "waiting-resume-location-not-sent", label: "Waiting for Resume-Location Not Sent", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "waiting-interview-confirmation-location-not-sent", label: "Waiting for Interview Confirmation-Location Not Sent", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "no-response-follow-up-1", label: "No Response - Follow Up 1", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "no-response-follow-up-2", label: "No Response - Follow Up 2", color: "bg-yellow-100 text-yellow-900 border-yellow-300" },
  { value: "backed-out-not-attended-interview", label: "Backed Out - Not Attended Interview", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "joined-and-left", label: "Joined & Left", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "appointed-not-joined", label: "Appointed - Not Joined", color: "bg-red-100 text-red-900 border-red-300" },
  { value: "position-on-hold-by-client", label: "Position On Hold By Client", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "location-sent-cv-not-sent", label: "Location Sent - CV Not Sent", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "location-sent-cv-sent", label: "Location Sent - CV Sent", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "coming-for-interview-confirmed", label: "Coming for Interview - Confirmed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "attended-interview-waiting-results", label: "Attended the Interview - Waiting Results", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "attended-interview-not-selected", label: "Attended Interview - Not Selected", color: "bg-gray-100 text-gray-700 border-gray-300" },
  // Legacy / short statuses (keep for backward compatibility)
  { value: "recently-applied", label: "Recently Applied", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "suggested", label: "Suggested", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "backed-out", label: "Backed Out", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "interview-scheduled", label: "Interview Scheduled", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "hired", label: "Hired", color: "bg-purple-100 text-purple-800 border-purple-200" },
]

const statusByValue = new Map(CANDIDATE_STATUSES.map((s) => [s.value, s]))

export function getStatusInfo(status) {
  if (!status) return { label: status || "—", color: "bg-gray-100 text-gray-600 border-gray-200" }
  const info = statusByValue.get(status)
  if (info) return { label: info.label, color: info.color }
  return { label: status, color: "bg-gray-100 text-gray-700 border-gray-200" }
}

export function getStatusBadgeClass(status) {
  return getStatusInfo(status).color
}
