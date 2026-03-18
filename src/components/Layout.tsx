import { Outlet, NavLink } from "react-router-dom";
import { BrainCircuit, Swords, Library, BarChart3, Wrench, Settings, User, GitCompare, Image as ImageIcon, Video as VideoIcon, Network, LogIn, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout() {
  const { user, signInWithGoogle, logout } = useAuth();

  const navItems = [
    { to: "/", icon: BrainCircuit, label: "Workspace" },
    { to: "/flow", icon: Network, label: "Visual Flow" },
    { to: "/compare", icon: GitCompare, label: "Agent Compare" },
    { to: "/arena", icon: Swords, label: "Agent Arena" },
    { to: "/studio", icon: ImageIcon, label: "Creative Studio" },
    { to: "/video", icon: VideoIcon, label: "Video Studio" },
    { to: "/vault", icon: Library, label: "Knowledge Vault" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/tools", icon: Wrench, label: "Tools Hub" },
    { to: "/test", icon: Zap, label: "Test Mode" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Animated Neural Network Background (CSS based) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/30 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Synaptixora
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-sm border border-white/5"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-white/90 mb-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="truncate">{user.displayName || user.email}</span>
              </div>
              <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mt-1">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-black/20 backdrop-blur-3xl">
        <Outlet />
      </main>
    </div>
  );
}
