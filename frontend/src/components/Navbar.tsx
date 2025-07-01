export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-yellow-400 shadow-lg py-4 px-6 flex items-center justify-between rounded-b-2xl mb-8">
      <div className="flex items-center gap-3">
        {/* Dashboard Icon */}
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 8h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V7H7v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2z" />
        </svg>
        <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">DevOps Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for user/avatar/settings */}
        <svg className="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a7.5 7.5 0 0 1 13 0" />
        </svg>
      </div>
    </nav>
  );
} 