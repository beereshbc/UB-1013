import React, { useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";
import {
  LucideShieldCheck,
  LucideShieldAlert,
  LucideBan,
  LucideUserCheck,
  LucideExternalLink,
  LucideLoader2,
  LucideServer,
  LucideActivity,
  LucideLogOut,
  LucideNetwork,
  LucideWallet,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { axios, contract, initBlockchain, navigate, setAdminToken } =
    useAppContext();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-doctors");
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      toast.error("Failed to fetch practitioners");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (doctor) => {
    setProcessingId(doctor._id);
    const toastId = toast.loading("Initializing Blockchain Authorization...");

    try {
      let activeContract = contract;
      if (!activeContract) {
        const res = await initBlockchain();
        activeContract = res.ledgerContract;
      }

      toast.loading("Writing to Ledger: Please confirm in MetaMask...", {
        id: toastId,
      });

      const tx = await activeContract.authorizeProvider(
        doctor.walletAddress,
        doctor.fullName,
        doctor.licenseId,
      );

      await tx.wait();

      toast.loading("Ledger Sync Success. Updating Database...", {
        id: toastId,
      });

      const { data } = await axios.post("/api/admin/change-status", {
        doctorId: doctor._id,
        status: "approved",
      });

      if (data.success) {
        toast.success("Practitioner Node Authorized Successfully", {
          id: toastId,
        });
        fetchDoctors();
      }
    } catch (error) {
      console.error("Authorization Error:", error);
      toast.error(
        error.reason || "Authorization Failed: User rejected or gas error",
        { id: toastId },
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleBlock = async (doctor) => {
    setProcessingId(doctor._id);
    const toastId = toast.loading("Synchronizing Blocklist...");

    try {
      if (!doctor.isBlocked) {
        let activeContract = contract;
        if (!activeContract) {
          const res = await initBlockchain();
          activeContract = res.ledgerContract;
        }
        const tx = await activeContract.revokeProvider(doctor.walletAddress);
        await tx.wait();
      }

      const { data } = await axios.post("/api/admin/toggle-block", {
        doctorId: doctor._id,
      });

      if (data.success) {
        toast.success(data.message, { id: toastId });
        fetchDoctors();
      }
    } catch (error) {
      toast.error("Network block synchronization failed", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    navigate("/");
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden selection:bg-blue-200 pb-20">
      {/* --- AMBIENT BACKGROUNDS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
              <LucideServer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                Root Command
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Network Active
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <LucideLogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-10">
        {/* --- DASHBOARD HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              Node Authority
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Manage the decentralized registry of medical practitioners.
              Approving a provider writes their cryptographic signature to the
              blockchain, granting them immutable write access to patient
              ledgers.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <LucideNetwork className="w-4 h-4 text-blue-500" /> Active Nodes
              </span>
              <span className="text-4xl font-black text-slate-800">
                {doctors.length}
              </span>
            </div>
            <div className="bg-[#0F172A] px-8 py-6 rounded-[2rem] border border-slate-800 shadow-2xl shadow-blue-900/10 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                <LucideActivity className="w-4 h-4" /> Pending Sync
              </span>
              <span className="text-4xl font-black text-white relative z-10">
                {doctors.filter((d) => d.status === "pending").length}
              </span>
            </div>
          </div>
        </div>

        {/* --- PROVIDER REGISTRY TABLE --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Provider Registry
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Smart Contract Authorization List
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <LucideShieldCheck className="w-4 h-4 text-blue-500" /> End-to-End
              Encrypted
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Practitioner Identity
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Specialization
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Verification Asset
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Network Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Ledger Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-900/20">
                          {doctor.fullName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                            {doctor.fullName}
                          </p>
                          <div className="flex items-center gap-2">
                            <LucideWallet className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {doctor.walletAddress.substring(0, 6)}...
                              {doctor.walletAddress.substring(38)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                        {doctor.specialization}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <a
                        href={doctor.degreeCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors border border-blue-100"
                      >
                        <LucideExternalLink className="w-4 h-4" /> View Proof
                      </a>
                    </td>

                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                          doctor.status === "approved"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : doctor.status === "pending"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            doctor.status === "approved"
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                              : doctor.status === "pending"
                                ? "bg-amber-500 animate-pulse"
                                : "bg-red-500"
                          }`}
                        ></div>
                        {doctor.status}
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        {doctor.status === "pending" && (
                          <button
                            disabled={processingId === doctor._id}
                            onClick={() => handleApproveDoctor(doctor)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processingId === doctor._id ? (
                              <LucideLoader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <LucideUserCheck className="w-4 h-4" />
                            )}
                            Write to Chain
                          </button>
                        )}

                        {/* Block/Unblock Toggle Button */}
                        <button
                          disabled={processingId === doctor._id}
                          onClick={() => handleToggleBlock(doctor)}
                          title={
                            doctor.isBlocked
                              ? "Restore Access"
                              : "Revoke Access"
                          }
                          className={`p-3 rounded-xl transition-all shadow-sm border ${
                            doctor.isBlocked
                              ? "bg-red-600 border-red-600 text-white shadow-red-600/20 hover:bg-red-700"
                              : "bg-white border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          }`}
                        >
                          {processingId === doctor._id &&
                          doctor.status !== "pending" ? (
                            <LucideLoader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <LucideBan className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {doctors.length === 0 && !loading && (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LucideServer className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">
                  Registry is Empty
                </h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                  No practitioner nodes have been registered on the network yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- SYSTEM INFO BANNER --- */}
        <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
              <LucideShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">
                Administrative Note
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Writing a node to the chain requires MetaMask confirmation and
                incurs gas fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
