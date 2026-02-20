import React, { useState } from "react";
import {
  LucideUserPlus,
  LucidePlus,
  LucideTrash2,
  LucideShieldCheck,
  LucideLock,
  LucideLoader2,
} from "lucide-react";
import { useAppContext } from "../../contexts/AppContext";
import toast from "react-hot-toast";

const CreatePatient = () => {
  const { contract, initBlockchain, axios, navigate, account, doctorToken } =
    useAppContext();
  const [loading, setLoading] = useState(false);

  const [patientData, setPatientData] = useState({
    id: "",
    phone: "",
    email: "",
    wallet: "",
  });

  const [primaryRecords, setPrimaryRecords] = useState([
    { key: "", value: "", description: "", prescription: "" },
  ]);
  const [confidentialRecords, setConfidentialRecords] = useState([
    { key: "", value: "", description: "", prescription: "" },
  ]);

  const handleAddField = (type) => {
    const newField = { key: "", value: "", description: "", prescription: "" };
    if (type === "primary") setPrimaryRecords([...primaryRecords, newField]);
    else setConfidentialRecords([...confidentialRecords, newField]);
  };

  const handleRemoveField = (type, index) => {
    if (type === "primary")
      setPrimaryRecords(primaryRecords.filter((_, i) => i !== index));
    else
      setConfidentialRecords(confidentialRecords.filter((_, i) => i !== index));
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Connecting to Golden Time Ledger...");

    try {
      // 1. Ensure Blockchain Connection
      let activeContract = contract;
      let userWallet = account;

      if (!activeContract || !userWallet) {
        const res = await initBlockchain();
        activeContract = res.ledgerContract;
        userWallet = res.address;
      }

      if (!patientData.id) throw new Error("Aadhaar/ID is required");
      const numericId = BigInt(patientData.id);

      // 2. Prepare Data for Blockchain AND MongoDB
      const allRecords = [
        ...primaryRecords
          .filter((r) => r.key.trim() !== "")
          .map((r) => ({
            key: String(r.key),
            value: String(r.value),
            description: String(r.description),
            prescription: String(r.prescription),
            isConfidential: false,
            authorWallet: userWallet,
            authorName: "",
            timestamp: Math.floor(Date.now() / 1000), // Pre-generate timestamp for DB
          })),
        ...confidentialRecords
          .filter((r) => r.key.trim() !== "")
          .map((r) => ({
            key: String(r.key),
            value: String(r.value),
            description: String(r.description),
            prescription: String(r.prescription),
            isConfidential: true,
            authorWallet: userWallet,
            authorName: "",
            timestamp: Math.floor(Date.now() / 1000),
          })),
      ];

      if (allRecords.length === 0)
        throw new Error("Please add at least one medical record.");

      // 3. Execute Blockchain Transaction
      toast.loading("Action Required: Confirm in MetaMask...", { id: toastId });

      const tx = await activeContract.onboardPatient(
        numericId,
        String(patientData.phone),
        String(patientData.email || ""),
        patientData.wallet || "0x0000000000000000000000000000000000000000",
        allRecords,
        { gasLimit: 1200000 },
      );

      toast.loading("Mining Transaction: Please wait...", { id: toastId });
      const receipt = await tx.wait();

      // 4. ALWAYS SYNC TO MONGODB ON SUCCESS
      if (receipt.status === 1) {
        toast.loading(
          "Blockchain Confirmed. Generating QR & Saving to Cloud...",
          { id: toastId },
        );

        await axios.post(
          "/api/patient/sync",
          {
            patientID: patientData.id,
            phone: patientData.phone,
            email: patientData.email,
            walletAddress: patientData.wallet,
            initialRecords: allRecords,
          },
          {
            headers: {
              Authorization: `Bearer ${doctorToken}`,
            },
          },
        );
      }

      toast.success("Patient successfully secured on Blockchain & Cloud!", {
        id: toastId,
      });
      setTimeout(() => navigate("/doctor/home"), 1500);
    } catch (error) {
      console.error("Onboarding Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        (error.code === "ACTION_REJECTED"
          ? "Transaction rejected by user"
          : error.reason || error.message || "Execution Reverted");
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
      <form onSubmit={handleOnboard} className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <LucideUserPlus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                Initialize Patient
              </h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                Dual-Storage Ledger V3
              </p>
            </div>
          </div>
        </div>

        {/* IDENTITY SECTION */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
            Patient Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              required
              type="number"
              className="p-4 bg-slate-50 rounded-xl border-none font-bold outline-emerald-500"
              placeholder="Aadhaar ID"
              value={patientData.id}
              onChange={(e) =>
                setPatientData({ ...patientData, id: e.target.value })
              }
            />
            <input
              required
              className="p-4 bg-slate-50 rounded-xl border-none font-bold outline-emerald-500"
              placeholder="Phone Number"
              value={patientData.phone}
              onChange={(e) =>
                setPatientData({ ...patientData, phone: e.target.value })
              }
            />
            <input
              className="p-4 bg-slate-50 rounded-xl border-none font-bold outline-emerald-500"
              placeholder="Email (Optional)"
              value={patientData.email}
              onChange={(e) =>
                setPatientData({ ...patientData, email: e.target.value })
              }
            />
            <input
              className="p-4 bg-slate-50 rounded-xl border-none font-bold font-mono text-xs outline-emerald-500"
              placeholder="Wallet Address"
              value={patientData.wallet}
              onChange={(e) =>
                setPatientData({ ...patientData, wallet: e.target.value })
              }
            />
          </div>
        </div>

        {/* RECORDS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Primary */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-blue-600">
                <LucideShieldCheck className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">
                  Primary Data
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddField("primary")}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <LucidePlus className="w-4 h-4" />
              </button>
            </div>
            {primaryRecords.map((rec, i) => (
              <div
                key={i}
                className="space-y-2 mb-6 p-4 bg-slate-50 rounded-2xl relative group"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveField("primary", i)}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LucideTrash2 className="w-3 h-3" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Key"
                    className="p-2 bg-white rounded-lg text-xs font-bold"
                    value={rec.key}
                    onChange={(e) => {
                      const n = [...primaryRecords];
                      n[i].key = e.target.value;
                      setPrimaryRecords(n);
                    }}
                  />
                  <input
                    placeholder="Value"
                    className="p-2 bg-white rounded-lg text-xs font-bold"
                    value={rec.value}
                    onChange={(e) => {
                      const n = [...primaryRecords];
                      n[i].value = e.target.value;
                      setPrimaryRecords(n);
                    }}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  className="w-full p-2 bg-white rounded-lg text-xs"
                  value={rec.description}
                  onChange={(e) => {
                    const n = [...primaryRecords];
                    n[i].description = e.target.value;
                    setPrimaryRecords(n);
                  }}
                />
                <input
                  placeholder="Prescription"
                  className="w-full p-2 bg-white rounded-lg text-xs border-l-4 border-blue-400"
                  value={rec.prescription}
                  onChange={(e) => {
                    const n = [...primaryRecords];
                    n[i].prescription = e.target.value;
                    setPrimaryRecords(n);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Confidential */}
          <div className="bg-[#0F172A] rounded-[2rem] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-amber-500">
                <LucideLock className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">
                  Confidential
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddField("confidential")}
                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                <LucidePlus className="w-4 h-4" />
              </button>
            </div>
            {confidentialRecords.map((rec, i) => (
              <div
                key={i}
                className="space-y-2 mb-6 p-4 bg-white/5 rounded-2xl relative group"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveField("confidential", i)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LucideTrash2 className="w-3 h-3" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Diagnosis"
                    className="p-2 bg-slate-900 border-none rounded-lg text-xs font-bold text-white"
                    value={rec.key}
                    onChange={(e) => {
                      const n = [...confidentialRecords];
                      n[i].key = e.target.value;
                      setConfidentialRecords(n);
                    }}
                  />
                  <input
                    placeholder="Result"
                    className="p-2 bg-slate-900 border-none rounded-lg text-xs font-bold text-white"
                    value={rec.value}
                    onChange={(e) => {
                      const n = [...confidentialRecords];
                      n[i].value = e.target.value;
                      setConfidentialRecords(n);
                    }}
                  />
                </div>
                <textarea
                  placeholder="Private Notes"
                  className="w-full p-2 bg-slate-900 border-none rounded-lg text-xs text-slate-300"
                  value={rec.description}
                  onChange={(e) => {
                    const n = [...confidentialRecords];
                    n[i].description = e.target.value;
                    setConfidentialRecords(n);
                  }}
                />
                <input
                  placeholder="Medication"
                  className="p-2 bg-slate-900 border-none rounded-lg text-xs text-amber-500"
                  value={rec.prescription}
                  onChange={(e) => {
                    const n = [...confidentialRecords];
                    n[i].prescription = e.target.value;
                    setConfidentialRecords(n);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95"
        >
          {loading ? (
            <LucideLoader2 className="animate-spin" />
          ) : (
            "Secure to Blockchain & Cloud"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePatient;
