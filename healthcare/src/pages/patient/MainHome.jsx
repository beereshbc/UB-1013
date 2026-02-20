import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  Clock,
  Database,
  ArrowRight,
  Stethoscope,
  Lock,
  ServerCrash,
  UserCircle,
  Zap,
  Globe,
  CheckCircle2,
  XCircle,
  Key,
  Cpu,
} from "lucide-react";

const MainHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-200 relative overflow-hidden">
      {/* --- GLOBAL AMBIENT BACKGROUNDS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-xl border-b border-white/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Golden Time
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => navigate("/admin/login")}
              className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors hidden sm:block"
            >
              System Admin
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors hidden md:flex items-center gap-1.5"
            >
              <UserCircle className="w-4 h-4" /> Patient Portal
            </button>
            <button
              onClick={() => navigate("/doctor/login")}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Provider Access <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 lg:pt-52 lg:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-widest shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              Web3 Medical Ledger Live
            </div>

            <h1 className="text-6xl lg:text-[5rem] font-black text-slate-900 tracking-tighter leading-[1.05]">
              The Golden Hour, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                Secured.
              </span>
            </h1>

            <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
              In an emergency, inaccessible medical data costs lives. Golden
              Time replaces fragmented hospital silos with a unified,
              patient-owned cryptographic passport.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigate("/doctor/login")}
                className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95"
              >
                <Stethoscope className="w-5 h-5" /> Launch Practitioner Node
              </button>

              <button
                onClick={() => navigate("/patient/dashboard")}
                className="px-8 py-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 group"
              >
                <UserCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />{" "}
                Access My Identity
              </button>
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white/80 backdrop-blur-sm bg-white/50 transform rotate-2 hover:rotate-0 transition-transform duration-700 group">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200"
                alt="Emergency Medical Response"
                className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white w-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                      <QrCodeIcon />
                    </div>
                    <div>
                      <span className="font-black tracking-widest uppercase text-xs block text-emerald-400">
                        Scan to Retrieve
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-300">
                        0ms Latency Access
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">
                    First responders bypass authentication to read life-saving
                    vitals instantly via secure QR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE SHIFT: PROBLEM VS SOLUTION (BENTO UI) --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest mb-6">
              The Paradigm Shift
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6">
              Breaking Down Silos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem Textbox */}
            <div className="bg-red-50/80 backdrop-blur-xl rounded-[3rem] p-10 lg:p-14 border border-red-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity duration-500"></div>

              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 border border-red-200">
                <ServerCrash className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                The Fatal Problem
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                Currently, your medical data belongs to the hospital, not you.
                When you face an emergency in a different city, doctors have
                zero access to your allergies, previous surgeries, or blood
                type.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start text-slate-700 font-medium">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>
                    Fatal delays in accessing life-saving primary data.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-slate-700 font-medium">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>
                    Centralized databases act as single points of failure for
                    ransomware.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-slate-700 font-medium">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>
                    Patients possess zero ownership over their own medical
                    identity.
                  </span>
                </li>
              </ul>
            </div>

            {/* The Solution Textbox */}
            <div className="bg-[#0F172A] rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden group border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 blur-[100px] group-hover:opacity-30 transition-opacity duration-500"></div>

              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-6">
                The Web3 Solution
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed mb-8">
                We utilize decentralized blockchain ledgers to create a
                universal, immutable medical passport. The data is
                cryptographic, owned solely by the patient, and universally
                accessible.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start text-slate-200 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>
                    Paramedics bypass firewalls instantly via Emergency QR tags.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-slate-200 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>
                    Data is decentralized across nodes; it cannot be deleted or
                    hacked.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-slate-200 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>
                    Patients grant read/write access dynamically via MetaMask
                    signatures.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- PLATFORM COMPARISON --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[3rem] p-10 lg:p-16 shadow-2xl shadow-slate-200/50">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                Why Golden Time is Different
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                Traditional electronic health records (EHR) are designed for
                billing, not for patients. Here is how we redefine the
                architecture of care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[2rem] border border-slate-100">
              {/* Legacy */}
              <div className="bg-slate-50 p-10 lg:p-12 border-b md:border-b-0 md:border-r border-slate-200">
                <div className="flex items-center gap-3 mb-8 opacity-60">
                  <ServerCrash className="w-6 h-6 text-slate-500" />
                  <h4 className="font-black text-lg text-slate-600 uppercase tracking-widest">
                    Legacy EHR Systems
                  </h4>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <span className="text-sm font-bold text-slate-500">
                      Data Ownership
                    </span>
                    <span className="text-xs font-black bg-slate-200 text-slate-500 px-3 py-1 rounded-md uppercase">
                      Hospital Owned
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <span className="text-sm font-bold text-slate-500">
                      Emergency Access
                    </span>
                    <span className="text-xs font-black bg-slate-200 text-slate-500 px-3 py-1 rounded-md uppercase">
                      Delayed / Blocked
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <span className="text-sm font-bold text-slate-500">
                      Security Model
                    </span>
                    <span className="text-xs font-black bg-slate-200 text-slate-500 px-3 py-1 rounded-md uppercase">
                      Centralized Server
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">
                      Trust
                    </span>
                    <span className="text-xs font-black bg-slate-200 text-slate-500 px-3 py-1 rounded-md uppercase">
                      Paper Trails
                    </span>
                  </li>
                </ul>
              </div>

              {/* Golden Time */}
              <div className="bg-blue-600 p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[200%] bg-white/5 rotate-12 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Globe className="w-6 h-6 text-blue-200" />
                  <h4 className="font-black text-lg text-white uppercase tracking-widest">
                    Golden Time Protocol
                  </h4>
                </div>
                <ul className="space-y-6 relative z-10">
                  <li className="flex items-center justify-between border-b border-blue-500/50 pb-4">
                    <span className="text-sm font-bold text-blue-100">
                      Data Ownership
                    </span>
                    <span className="text-xs font-black bg-emerald-400 text-slate-900 px-3 py-1 rounded-md uppercase">
                      Patient Wallet
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-blue-500/50 pb-4">
                    <span className="text-sm font-bold text-blue-100">
                      Emergency Access
                    </span>
                    <span className="text-xs font-black bg-emerald-400 text-slate-900 px-3 py-1 rounded-md uppercase">
                      Instant QR Scan
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-blue-500/50 pb-4">
                    <span className="text-sm font-bold text-blue-100">
                      Security Model
                    </span>
                    <span className="text-xs font-black bg-emerald-400 text-slate-900 px-3 py-1 rounded-md uppercase">
                      AES + Blockchain
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-100">
                      Trust
                    </span>
                    <span className="text-xs font-black bg-emerald-400 text-slate-900 px-3 py-1 rounded-md uppercase">
                      Cryptographic Math
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE ADVANTAGES (GRID) --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              Core Network Advantages
            </h2>
            <p className="text-slate-500 max-w-2xl font-medium">
              We leverage Solidity smart contracts to ensure data integrity
              while optimizing the frontend for high-stakes medical emergencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Zero Latency Vitals"
              desc="Paramedics scan your QR tag to instantly fetch life-saving primary data like blood type and allergies without requiring login."
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <FeatureCard
              icon={<Key className="w-7 h-7" />}
              title="Tiered Privacy"
              desc="Your confidential records (psychiatric, sensitive conditions) are cryptographically locked and require your wallet signature to view."
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <FeatureCard
              icon={<Cpu className="w-7 h-7" />}
              title="Immutable Ledger"
              desc="Once a verified practitioner prescribes medication, it is permanently written to the blockchain, eliminating prescription fraud."
              color="text-blue-600"
              bg="bg-blue-50"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="bg-[#0F172A] pt-24 pb-12 px-6 text-center relative z-10 border-t border-slate-800 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/20 blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-[0_0_50px_rgba(59,130,246,0.5)] transform rotate-12">
            <Activity className="w-10 h-10 -rotate-12" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">
            Join the Next Generation <br />
            <span className="text-slate-500">of Healthcare.</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-12">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1"
            >
              Initialize Identity
            </button>
            <button
              onClick={() => navigate("/doctor/login")}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1"
            >
              Provider Login
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-1 backdrop-blur-md"
            >
              System Admin
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">
          <p>© {new Date().getFullYear()} Golden Time Protocol.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">
              Decentralized
            </span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">
              Immutable
            </span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">
              Secure
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-component for advantages grid
const FeatureCard = ({ icon, title, desc, color, bg }) => (
  <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-transform duration-500 group">
    <div
      className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-300`}
    >
      {icon}
    </div>
    <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4 uppercase">
      {title}
    </h4>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

// Custom QR Icon SVG for Hero Section
const QrCodeIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-500"
  >
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

export default MainHome;
