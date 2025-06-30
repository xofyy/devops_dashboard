import Navbar from "./components/Navbar";
import SystemStats from "./components/SystemStats";
import UptimeStatus from "./components/UptimeStatus";
import DockerStatus from "./components/DockerStatus";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 grid gap-10 grid-cols-1 md:grid-cols-3">
        <SystemStats />
        <UptimeStatus />
        <DockerStatus />
      </main>
    </div>
  );
}

export default App;
