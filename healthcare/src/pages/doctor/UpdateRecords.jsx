import React, { useState, useRef } from "react";
import {
  LucideSearch,
  LucideLoader2,
  LucideArrowLeft,
  LucideHistory,
  LucideIdCard,
  LucideSmartphone,
  LucideMail,
  LucideWallet,
  LucideQrCode,
  LucideFingerprint,
  LucideActivity,
  LucideLock,
  LucideShieldCheck,
  LucideNetwork,
  LucideDatabaseZap,
  LucideCamera,
  LucideUpload,
  LucideX,
} from "lucide-react";
import { QrReader } from "react-qr-reader";
import jsQR from "jsqr";
import { useAppContext } from "../../contexts/AppContext";
import toast from "react-hot-toast";

const UpdateRecords = () => {
  const { contract, initBlockchain, navigate } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("aadhaar"); // Default
  const [patientId, setPatientId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // QR Specific States
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // Form for new data
  const [newData, setNewData] = useState([
    {
      key: "",
      value: "",
      description: "",
      prescription: "",
      isConfidential: false,
    },
  ]);

  const searchOptions = [
    {
      id: "aadhaar",
      label: "Aadhaar",
      icon: LucideIdCard,
      color: "text-blue-600",
      bg: "bg-blue-50/80",
      placeholder: "Enter 12-digit Aadhaar",
    },
    {
      id: "phone",
      label: "Phone",
      icon: LucideSmartphone,
      color: "text-emerald-600",
      bg: "bg-emerald-50/80",
      placeholder: "Enter Phone Number",
    },
    {
      id: "email",
      label: "Email",
      icon: LucideMail,
      color: "text-rose-600",
      bg: "bg-rose-50/80",
      placeholder: "Enter Email Address",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: LucideWallet,
      color: "text-amber-600",
      bg: "bg-amber-50/80",
      placeholder: "Enter 0x... Wallet Address",
    },
    {
      id: "qr",
      label: "QR Code",
      icon: LucideQrCode,
      color: "text-indigo-600",
      bg: "bg-indigo-50/80",
      placeholder: "Scan or Paste QR Data",
    },
    {
      id: "bio",
      label: "Biometrics",
      icon: LucideFingerprint,
      color: "text-cyan-600",
      bg: "bg-cyan-50/80",
      placeholder: "Enter Fingerprint Hash",
    },
  ];

  // --- CORE SEARCH LOGIC ---
  const handleSearch = async (e, directValue = null) => {
    if (e) e.preventDefault();

    let queryValue = directValue || searchQuery;
    if (!queryValue) return toast.error("Please provide search data");

    setLoading(true);
    setShowScanner(false); // Close camera if open

    try {
      let activeContract = contract;
      if (!activeContract) {
        const res = await initBlockchain();
        activeContract = res.ledgerContract;
      }

      // Handle QR URL extraction
      if (searchType === "qr" && queryValue.includes("/")) {
        const parts = queryValue.split("/");
        queryValue = parts[parts.length - 1];
      }

      let resolvedId;
      // Resolve credentials to ID
      if (searchType === "phone")
        resolvedId = await activeContract.getPatientIdByPhone(queryValue);
      else if (searchType === "email")
        resolvedId = await activeContract.getPatientIdByEmail(queryValue);
      else if (searchType === "wallet")
        resolvedId = await activeContract.getPatientIdByWallet(queryValue);
      else resolvedId = queryValue; // QR or Aadhaar direct ID

      if (!resolvedId || resolvedId.toString() === "0") {
        throw new Error("Patient not found on network");
      }

      setPatientId(resolvedId.toString());

      // Fetch History
      try {
        const fullData = await activeContract.getFullMedicalHistory(resolvedId);
        setHistory(fullData);
        setIsAuthorized(true);
        toast.success("Identity Verified. Full access granted.");
      } catch (err) {
        const primaryOnly = await activeContract.getPrimaryData(resolvedId);
        setHistory(primaryOnly);
        setIsAuthorized(false);
        toast.error("Standard Access: Confidential records locked.");
      }
    } catch (error) {
      toast.error(error.message || "Search Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- QR SCANNER HANDLERS ---
  const handleCameraScan = (result, error) => {
    if (result) {
      const qrData = result?.text || result;
      setSearchQuery(qrData);
      toast.success("QR Code Detected!");
      handleSearch(null, qrData); // Auto-trigger search
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          toast.success("QR Read Successfully!");
          setSearchQuery(code.data);
          handleSearch(null, code.data); // Auto-trigger search
        } else {
          toast.error("Invalid QR code image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- RECORD UPDATE LOGIC ---
  const handleUpdate = async () => {
    if (!newData[0].key || !newData[0].value) {
      return toast.error("Key and Value are required fields.");
    }

    setLoading(true);
    const toastId = toast.loading("Syncing New Vitals to Ledger...");
    try {
      const keys = newData.map((d) => d.key);
      const values = newData.map((d) => d.value);
      const descriptions = newData.map((d) => d.description);
      const prescriptions = newData.map((d) => d.prescription);
      const isConf = newData[0].isConfidential;

      const tx = await contract.updatePatientData(
        patientId,
        keys,
        values,
        descriptions,
        prescriptions,
        isConf,
      );
      await tx.wait();

      toast.success("Ledger Updated Successfully", { id: toastId });
      handleSearch(null, patientId); // Refresh history
      setNewData([
        {
          key: "",
          value: "",
          description: "",
          prescription: "",
          isConfidential: false,
        },
      ]);
    } catch (error) {
      toast.error("Transaction Rejected", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = searchOptions.find((o) => o.id === searchType);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden selection:bg-blue-200 pb-20">
      {/* --- AMBIENT BACKGROUNDS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/doctor/home")}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all bg-white hover:bg-blue-50 px-4 py-2 rounded-xl border border-slate-200"
          >
            <LucideArrowLeft className="w-4 h-4" /> Provider Dashboard
          </button>

          <div className="flex items-center gap-2 opacity-60">
            <LucideNetwork className="w-4 h-4 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Live Network Write
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {!patientId ? (
          /* =========================================
             STEP 1: PATIENT IDENTIFICATION
          ========================================= */
          <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-600/30">
                <LucideDatabaseZap className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                Append to Ledger
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">
                Identify Patient Node to Initiate Write Sequence
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 border border-white">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {searchOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSearchType(opt.id);
                      setSearchQuery("");
                      setShowScanner(false);
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${
                      searchType === opt.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform ${searchType === opt.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110" : `${opt.bg} ${opt.color}`}`}
                    >
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${searchType === opt.id ? "text-blue-700" : "text-slate-500"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* DYNAMIC SEARCH INPUT AREA */}
              <div className="relative group">
                {searchType === "qr" ? (
                  /* QR Scanner Interface */
                  <div className="mb-4">
                    {showScanner ? (
                      <div className="relative max-w-sm mx-auto overflow-hidden rounded-3xl border-8 border-slate-100 bg-black shadow-inner">
                        <button
                          onClick={() => setShowScanner(false)}
                          className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg hover:scale-110 transition-transform"
                        >
                          <LucideX className="w-4 h-4" />
                        </button>
                        <QrReader
                          onResult={handleCameraScan}
                          constraints={{ facingMode: "environment" }}
                          className="w-full"
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                          <span className="bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md">
                            Align QR Code in frame
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setShowScanner(true)}
                          className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-3xl transition-all group/cam"
                        >
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-4 group-hover/cam:scale-110 transition-transform">
                            <LucideCamera className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-sm text-slate-700">
                            Open Camera
                          </span>
                        </button>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-3xl transition-all cursor-pointer group/up"
                        >
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 mb-4 group-hover/up:scale-110 transition-transform">
                            <LucideUpload className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-sm text-slate-700">
                            Upload Image
                          </span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center gap-4 max-w-2xl mx-auto">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1 rounded-md">
                        Or enter manually
                      </span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                  </div>
                ) : null}

                {/* Standard Input Form */}
                <form
                  onSubmit={handleSearch}
                  className={`flex flex-col md:flex-row gap-4 ${searchType === "qr" ? "mt-6 max-w-2xl mx-auto" : ""}`}
                >
                  <div className="flex-1 relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      {activeConfig && (
                        <activeConfig.icon className="w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={
                        activeConfig?.placeholder || "Enter Search Query"
                      }
                      className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none font-bold text-lg text-slate-800 transition-all shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 md:w-auto w-full"
                  >
                    {loading ? (
                      <LucideLoader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <LucideSearch className="w-6 h-6" />
                    )}
                    Identify
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================
             STEP 2: DATA ENTRY TERMINAL
          ========================================= */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-md border border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPatientId(null)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                >
                  <LucideArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Active Session
                  </p>
                  <p className="font-mono font-bold text-slate-800 text-lg">
                    {patientId}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border ${
                  isAuthorized
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                {isAuthorized ? (
                  <LucideShieldCheck className="w-4 h-4" />
                ) : (
                  <LucideLock className="w-4 h-4" />
                )}
                {isAuthorized ? "Full Read/Write Access" : "Restricted Access"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* --- PATIENT HISTORY TIMELINE (LEFT) --- */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 max-h-[800px] overflow-y-auto sticky top-24">
                <div className="flex items-center gap-4 mb-8 sticky top-0 bg-white pb-4 border-b border-slate-50 z-10">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <LucideHistory className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Medical Timeline
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Existing Blockchain Records
                    </p>
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {history.map((rec, i) => (
                      <div
                        key={i}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md ${rec.isConfidential ? "bg-amber-500" : "bg-blue-500"}`}
                        >
                          <LucideActivity className="w-4 h-4 text-white" />
                        </div>

                        {/* Timeline Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${rec.isConfidential ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                            >
                              {rec.key}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                              {new Date(
                                Number(rec.timestamp) * 1000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-lg font-black text-slate-800 mb-2 leading-tight">
                            {rec.value}
                          </p>
                          {rec.description && (
                            <p className="text-xs text-slate-500 leading-relaxed mb-3 bg-slate-50 p-3 rounded-xl">
                              {rec.description}
                            </p>
                          )}
                          {rec.prescription && (
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 mb-3">
                              <span className="text-[9px] text-blue-500 uppercase font-black block mb-1">
                                Prescription
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {rec.prescription}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
                            <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase">
                              {rec.authorName[0]}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Dr. {rec.authorName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <LucideHistory className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-bold">
                      No previous records found.
                    </p>
                  </div>
                )}
              </div>

              {/* --- DATA ENTRY TERMINAL (RIGHT) --- */}
              <div className="bg-[#0F172A] rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

                <div className="mb-8 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
                    Network Connected
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                    Append Record
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">
                    Data entered here will be cryptographically signed by your
                    wallet and permanently appended to the patient's
                    decentralized ledger.
                  </p>
                </div>

                <div className="space-y-6 relative z-10">
                  {newData.map((item, i) => (
                    <div
                      key={i}
                      className="space-y-5 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Data Key
                          </label>
                          <input
                            placeholder="e.g. Current BP, Diagnosis"
                            className="w-full p-4 bg-slate-900 rounded-xl border border-slate-700 text-white font-bold text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={item.key}
                            onChange={(e) => {
                              const n = [...newData];
                              n[i].key = e.target.value;
                              setNewData(n);
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Data Value
                          </label>
                          <input
                            placeholder="e.g. 120/80, Type 2 Diabetes"
                            className="w-full p-4 bg-slate-900 rounded-xl border border-slate-700 text-white font-bold text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={item.value}
                            onChange={(e) => {
                              const n = [...newData];
                              n[i].value = e.target.value;
                              setNewData(n);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Clinical Notes (Optional)
                        </label>
                        <textarea
                          placeholder="Detailed observation, symptoms, or analysis..."
                          className="w-full p-4 bg-slate-900 rounded-xl border border-slate-700 text-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                          rows="3"
                          value={item.description}
                          onChange={(e) => {
                            const n = [...newData];
                            n[i].description = e.target.value;
                            setNewData(n);
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest ml-1">
                          Prescription (Optional)
                        </label>
                        <input
                          placeholder="Medication name, dosage, frequency..."
                          className="w-full p-4 bg-blue-900/20 rounded-xl border border-blue-500/30 text-blue-200 font-bold text-sm focus:border-blue-400 focus:bg-blue-900/40 outline-none transition-all"
                          value={item.prescription}
                          onChange={(e) => {
                            const n = [...newData];
                            n[i].prescription = e.target.value;
                            setNewData(n);
                          }}
                        />
                      </div>

                      <div className="pt-2">
                        <label
                          className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${newData[i].isConfidential ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-900 border-slate-700 hover:bg-slate-800"}`}
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-amber-500"
                            checked={item.isConfidential}
                            onChange={(e) => {
                              const n = [...newData];
                              n[i].isConfidential = e.target.checked;
                              setNewData(n);
                            }}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-black uppercase tracking-widest ${newData[i].isConfidential ? "text-amber-400" : "text-slate-400"}`}
                            >
                              Mark as Confidential
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              Hides this record from public emergency scans
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full mt-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <LucideLoader2 className="w-5 h-5 animate-spin" />{" "}
                        Transacting...
                      </>
                    ) : (
                      <>
                        <LucideDatabaseZap className="w-5 h-5" /> Commit to
                        Ledger
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                    Requires MetaMask Signature & Gas Fee
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateRecords;
