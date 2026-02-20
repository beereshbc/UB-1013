import React, { useState } from "react";
import {
  LucideSearch,
  LucideQrCode,
  LucideFingerprint,
  LucideUserPlus,
  LucideFileEdit,
  LucideDatabase,
  LucideSmartphone,
  LucideMail,
  LucideWallet,
  LucideIdCard,
  LucideArrowRight,
  LucideShieldCheck,
  LucideActivity,
} from "lucide-react";
import { useAppContext } from "../../contexts/AppContext";

const DoctorHome = () => {
  const { navigate } = useAppContext();
  const [activeSection, setActiveSection] = useState(null);

  const primarySearchOptions = [
    {
      id: "qr",
      label: "Scan QR Code",
      icon: LucideQrCode,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "aadhaar",
      label: "Aadhaar Number",
      icon: LucideIdCard,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "phone",
      label: "Phone Number",
      icon: LucideSmartphone,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "email",
      label: "Email Address",
      icon: LucideMail,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      id: "wallet",
      label: "Wallet ID",
      icon: LucideWallet,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "bio",
      label: "Fingerprint Scan",
      icon: LucideFingerprint,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans relative overflow-hidden selection:bg-blue-200">
      {/* --- AMBIENT BACKGROUND EFFECTS --- */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- HEADER SECTION --- */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 text-white">
                <LucideActivity className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                Practitioner Node
              </h1>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] ml-12">
              Verified Medical Access Point
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==========================================
              SECTION 1: PRIMARY DATA RETRIEVAL 
          ========================================== */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
              <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <LucideDatabase className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Retrieve Patient Data
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Decentralized Search Engine
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {primarySearchOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => navigate(`/doctor/search/${option.id}`)}
                    className="flex flex-col items-center justify-center p-6 rounded-[2rem] border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group/item hover:-translate-y-1"
                  >
                    <div
                      className={`w-14 h-14 ${option.bg} ${option.color} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:shadow-sm`}
                    >
                      <option.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center group-hover/item:text-blue-700 transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: ACTION LINKS 
          ========================================== */}
          <div className="space-y-8">
            {/* SECTION 2: UPDATE DATA */}
            <div
              onClick={() => navigate("/doctor/update-records")}
              className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border border-slate-800"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full opacity-10 blur-[80px] group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-inner">
                  <LucideFileEdit className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Modify Records
                  </h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    Update Ledger
                  </p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group/btn hover:bg-white/10 hover:border-white/10 transition-all">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-widest group-hover/btn:text-white transition-colors">
                    Append Existing Data
                  </span>
                  <LucideArrowRight className="w-4 h-4 text-blue-400 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group/btn hover:bg-white/10 hover:border-white/10 transition-all">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-widest group-hover/btn:text-white transition-colors">
                    Sync New Vitals
                  </span>
                  <LucideArrowRight className="w-4 h-4 text-blue-400 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* SECTION 3: CREATE NEW PATIENT */}
            <div
              onClick={() => navigate("/doctor/create-patient")}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 cursor-pointer hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 transition-colors group-hover:bg-emerald-100">
                  <LucideUserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Onboard Node
                  </h2>
                  <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest mt-1">
                    New Patient Registry
                  </p>
                </div>
              </div>

              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                Initialize a new identity on the decentralized medical network.
                Requires valid government ID for hashing.
              </p>

              <div className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all">
                Start Enrollment{" "}
                <LucideArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* --- SYSTEM STATUS HUD (FOOTER) --- */}
        <div className="mt-16 flex justify-center">
          <div className="px-8 py-4 bg-white/60 backdrop-blur-md rounded-full border border-slate-200/60 shadow-lg shadow-slate-200/20 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Testnet Synchronized
              </span>
            </div>

            <div className="hidden md:block w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <LucideShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Encryption Active (AES-256)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
