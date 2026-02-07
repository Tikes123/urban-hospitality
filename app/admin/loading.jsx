export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
