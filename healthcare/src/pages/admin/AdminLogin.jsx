import React, { useState } from "react";
import {
  LucideLock,
  LucideMail,
  LucideShieldAlert,
  LucideActivity,
  LucideArrowRight,
  LucideArrowLeft,
  LucideLoader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../../contexts/AppContext";

const AdminLogin = () => {
  const { axios, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("email", email);
      data.append("password", password);

      const response = await axios.post("/api/admin/login", data);

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        toast.success(response.data.message);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden selection:bg-blue-200">
      {/* --- AMBIENT BACKGROUNDS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="w-full bg-transparent px-6 py-6 absolute top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all bg-white/50 backdrop-blur-md hover:bg-white px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm"
          >
            <LucideArrowLeft className="w-4 h-4" /> Return Home
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 mt-12">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          {/* Decorative background glow inside card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-[80px] -z-10"></div>

          <div className="relative z-10 text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <LucideActivity className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              System Portal
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
              Administrative Access Only
            </p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-left block">
                Admin Email
              </label>
              <div className="relative group">
                <LucideMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                <input
                  required
                  type="email"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
                  placeholder="admin@goldentime.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-left block">
                Access Cipher
              </label>
              <div className="relative group">
                <LucideLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                <input
                  required
                  type="password"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 group"
            >
              {loading ? (
                <>
                  <LucideLoader2 className="w-4 h-4 animate-spin" />{" "}
                  Authorizing...
                </>
              ) : (
                <>
                  Authorize Session{" "}
                  <LucideArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <LucideShieldAlert className="text-amber-500 w-5 h-5 flex-shrink-0" />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider text-left">
              Unauthorized access attempts are logged and reported to network
              security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
