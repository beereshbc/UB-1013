import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { QrReader } from "react-qr-reader";
import jsQR from "jsqr";
import { useAppContext } from "../../contexts/AppContext";
import toast from "react-hot-toast";
import {
  LucideSearch,
  LucideShieldCheck,
  LucideLock,
  LucideLoader2,
  LucideIdCard,
  LucideSmartphone,
  LucideMail,
  LucideWallet,
  LucideQrCode,
  LucideArrowLeft,
  LucideCamera,
  LucideUpload,
  LucideX,
  LucideActivity,
  LucideFingerprint,
  LucideDownload,
  LucideServer,
  LucideZap,
  LucideFileCheck,
  LucideArrowRight,
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { CONTRACT_ADDRESS, CONTRACT_ABI, initBlockchain, account, axios } =
    useAppContext();

  // View States: 'grid' -> 'input' -> 'results'
  const [currentView, setCurrentView] = useState("grid");
  const [searchMethod, setSearchMethod] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  // QR States
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // Data States
  const [resolvedPatientId, setResolvedPatientId] = useState("");
  const [primaryRecords, setPrimaryRecords] = useState([]);
  const [confidentialRecords, setConfidentialRecords] = useState([]);
  const [isPrivateView, setIsPrivateView] = useState(false);
  const [myQrCode, setMyQrCode] = useState(null);

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
      color: "text-amber-600",
      bg: "bg-amber-50/80",
      placeholder: "Enter Email Address",
    },
    {
      id: "qr",
      label: "Scan QR",
      icon: LucideQrCode,
      color: "text-indigo-600",
      bg: "bg-indigo-50/80",
      placeholder: "Scan or Paste QR Data",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: LucideWallet,
      color: "text-purple-600",
      bg: "bg-purple-50/80",
      placeholder: "Enter 0x... Address",
    },
    {
      id: "bio",
      label: "Biometrics",
      icon: LucideFingerprint,
      color: "text-rose-600",
      bg: "bg-rose-50/80",
      placeholder: "Enter Fingerprint Hash",
    },
  ];

  const infoBoxes = [
    {
      icon: LucideZap,
      title: "Zero Latency",
      desc: "Emergency responders get instant, read-only access to critical vitals.",
    },
    {
      icon: LucideShieldCheck,
      title: "Military Grade",
      desc: "Data is cryptographically secured. You own the private keys.",
    },
    {
      icon: LucideServer,
      title: "Decentralized",
      desc: "No single point of failure. Your records survive hospital downtimes.",
    },
    {
      icon: LucideFileCheck,
      title: "Immutable Truth",
      desc: "Prescriptions and diagnoses cannot be altered or forged.",
    },
  ];

  // Helper: Get Read-Only Contract
  const getReadOnlyContract = () => {
    let provider;
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const formatRecord = (rec) => ({
    key: rec.key,
    value: rec.value,
    description: rec.description,
    prescription: rec.prescription,
    isConfidential: rec.isConfidential,
    authorName: rec.authorName,
    timestamp: Number(rec.timestamp),
  });

  // --- SEARCH LOGIC ---
  const handlePublicSearch = async (e, directValue = null) => {
    if (e) e.preventDefault();
    const queryValue = directValue || searchInput;
    if (!queryValue) return toast.error("Please provide search data");

    setLoading(true);
    setPrimaryRecords([]);
    setConfidentialRecords([]);
    setIsPrivateView(false);
    setShowScanner(false);
    const toastId = toast.loading("Querying Decentralized Ledger...");

    try {
      const readOnlyContract = getReadOnlyContract();
      let resolvedId = 0n;
      let finalInput = queryValue;
      if (searchMethod === "qr" && queryValue.includes("/")) {
        const parts = queryValue.split("/");
        finalInput = parts[parts.length - 1];
      }

      if (
        searchMethod === "aadhaar" ||
        searchMethod === "qr" ||
        searchMethod === "bio"
      ) {
        resolvedId = BigInt(finalInput);
      } else if (searchMethod === "phone") {
        resolvedId = await readOnlyContract.getPatientIdByPhone(finalInput);
      } else if (searchMethod === "email") {
        resolvedId = await readOnlyContract.getPatientIdByEmail(finalInput);
      } else if (searchMethod === "wallet") {
        resolvedId = await readOnlyContract.getPatientIdByWallet(finalInput);
      }

      if (resolvedId === 0n)
        throw new Error("No medical profile found for this input.");

      setResolvedPatientId(resolvedId.toString());
      const primaryData = await readOnlyContract.getPrimaryData(resolvedId);
      setPrimaryRecords(primaryData.map(formatRecord));

      setCurrentView("results");
      toast.success("Emergency Data Retrieved", { id: toastId });
    } catch (error) {
      console.error("Search Error:", error);
      toast.error(error.reason || error.message || "Search failed", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMyRecords = async () => {
    setLoading(true);
    const toastId = toast.loading("Connecting to Web3 Identity...");

    try {
      const res = await initBlockchain();
      if (!res)
        throw new Error(
          "MetaMask connection required to view private records.",
        );

      const activeContract = res.ledgerContract;
      const userWallet = res.address;

      toast.loading("Decrypting Personal Ledger...", { id: toastId });

      const fullHistory = await activeContract.getMyRecords();
      const formatted = fullHistory.map(formatRecord);

      setPrimaryRecords(formatted.filter((r) => !r.isConfidential));
      setConfidentialRecords(formatted.filter((r) => r.isConfidential));

      try {
        const qrRes = await axios.get(
          `/api/patient/qr?walletAddress=${userWallet}`,
        );
        if (qrRes.data.success) {
          setMyQrCode(qrRes.data.qrCode);
        }
      } catch (dbErr) {
        console.warn("QR Code not found in database for this wallet.");
      }

      setResolvedPatientId("My Wallet");
      setIsPrivateView(true);
      setCurrentView("results");

      toast.success("Identity Verified. Full Ledger Unlocked.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Fetch Own Records Error:", error);
      toast.error(
        error.reason ||
          error.message ||
          "You do not have any registered records on this wallet.",
        { id: toastId },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = (result, error) => {
    if (result) {
      const qrData = result?.text || result;
      setSearchInput(qrData);
      toast.success("QR Code Detected!");
      handlePublicSearch(null, qrData);
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
          setSearchInput(code.data);
          handlePublicSearch(null, code.data);
        } else {
          toast.error("Invalid QR code image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const activeConfig = searchOptions.find((o) => o.id === searchMethod);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden selection:bg-blue-200 pb-20">
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <LucideActivity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                Patient Node
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Decentralized Data Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm transition-all"
          >
            Exit Portal
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* =========================================
            VIEW 1: METHOD SELECTION GRID (LONG PAGE)
        ========================================= */}
        {currentView === "grid" && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-12">
            {/* Split Hero Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Private Access (The Big Button) */}
              <div className="bg-[#0F172A] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group border border-slate-800 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700"></div>

                <div className="relative z-10 mb-8">
                  <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                    <LucideWallet className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                    My Personal <br />
                    <span className="text-blue-400">Web3 Ledger</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-4 leading-relaxed pr-4">
                    Take absolute control of your health data. Connect your
                    MetaMask wallet to cryptographically unlock your full
                    medical history, confidential notes, and download your
                    Emergency QR Passport.
                  </p>
                </div>

                <button
                  onClick={handleFetchMyRecords}
                  disabled={loading}
                  className="relative z-10 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-3 group/btn"
                >
                  {loading ? (
                    <LucideLoader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      Connect MetaMask{" "}
                      <LucideArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Public Search Grid */}
              <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <LucideSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Public Emergency Search
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Retrieve Vitals Without Authentication
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSearchMethod(option.id);
                        setSearchInput("");
                        setCurrentView("input");
                      }}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl shadow-sm hover:shadow-md transition-all group/card"
                    >
                      <div
                        className={`w-10 h-10 ${option.bg} ${option.color} rounded-xl flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform`}
                      >
                        <option.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[10px] text-slate-600 uppercase tracking-widest text-center group-hover/card:text-blue-600">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* The "Small Boxes with Text" Section */}
            <div className="pt-8 border-t border-slate-200/60">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  Why Web3 Healthcare?
                </h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                  The architecture saving lives
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {infoBoxes.map((box, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform"
                  >
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4">
                      <box.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight mb-2">
                      {box.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {box.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            VIEW 2: SEARCH INPUT AREA
        ========================================= */}
        {currentView === "input" && activeConfig && (
          <div className="animate-in slide-in-from-right-8 duration-300 max-w-3xl mx-auto mt-10">
            <button
              onClick={() => setCurrentView("grid")}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors mb-6"
            >
              <LucideArrowLeft className="w-4 h-4" /> Back to Methods
            </button>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100%] -z-10"></div>

              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`p-4 rounded-2xl ${activeConfig.bg} ${activeConfig.color}`}
                >
                  <activeConfig.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Search via {activeConfig.label}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Public Ledger Query
                  </p>
                </div>
              </div>

              {/* QR Scanner Interface */}
              {searchMethod === "qr" && (
                <div className="mb-8">
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
                        className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-3xl transition-all group"
                      >
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                          <LucideCamera className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm text-slate-700">
                          Open Camera
                        </span>
                      </button>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-3xl transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
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
                </div>
              )}

              {/* Standard Input Form */}
              <form
                onSubmit={handlePublicSearch}
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 relative">
                  <activeConfig.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 outline-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                    placeholder={activeConfig.placeholder}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  {loading ? (
                    <LucideLoader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LucideSearch className="w-5 h-5" />
                  )}
                  Retrieve
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================
            VIEW 3: RESULTS AREA
        ========================================= */}
        {currentView === "results" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 mt-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentView("grid")}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
              >
                <LucideArrowLeft className="w-4 h-4" /> New Search
              </button>
            </div>

            {/* MY QR CODE PASSPORT (Private Only) */}
            {isPrivateView && myQrCode && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="bg-white rounded-[2.3rem] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-8 h-full w-full">
                  <div className="p-4 bg-slate-50 border-4 border-slate-100 rounded-[2rem] shadow-inner relative group">
                    <img
                      src={myQrCode}
                      alt="Emergency QR Code"
                      className="w-48 h-48 object-contain rounded-xl mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4">
                      <LucideShieldCheck className="w-3 h-3" /> Secure Node
                      Identity
                    </div>
                    <h2 className="font-black text-3xl uppercase tracking-tight text-slate-900 mb-3">
                      Emergency Passport
                    </h2>
                    <p className="text-sm text-slate-500 mb-8 max-w-md font-medium leading-relaxed">
                      Save this QR code. In an emergency, paramedics scan this
                      to bypass MetaMask and instantly view your life-saving
                      primary vitals.
                    </p>
                    <a
                      href={myQrCode}
                      download={`GoldenTime_Passport_${account?.substring(0, 6)}.png`}
                      className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                    >
                      <LucideDownload className="w-4 h-4" /> Download Identity
                      Tag
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* PRIMARY DATA CARD */}
            <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4 text-blue-600">
                  <div className="p-3 bg-blue-50 rounded-2xl shadow-sm text-blue-600">
                    <LucideShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-black text-2xl uppercase tracking-tight text-slate-900">
                      Primary Data
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Public Emergency Records
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl text-right w-fit">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Subject Hash / ID
                  </p>
                  <p className="font-mono font-black text-slate-700 text-sm">
                    {resolvedPatientId}
                  </p>
                </div>
              </div>

              {primaryRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {primaryRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-3xl bg-white border border-slate-100 border-t-4 border-t-blue-500 shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform group"
                    >
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                        {rec.key}
                      </p>
                      <p className="font-black text-slate-800 text-xl mb-4">
                        {rec.value}
                      </p>

                      {rec.description && (
                        <p className="text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-4 rounded-2xl leading-relaxed">
                          {rec.description}
                        </p>
                      )}

                      {rec.prescription && (
                        <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5">
                            Prescription
                          </p>
                          <p className="text-sm font-bold text-slate-700">
                            {rec.prescription}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Dr. {rec.authorName || "Verified"}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          {rec.timestamp > 0
                            ? new Date(
                                rec.timestamp * 1000,
                              ).toLocaleDateString()
                            : "Recent"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <LucideSearch className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                    No Primary Records Found
                  </p>
                </div>
              )}
            </div>

            {/* CONFIDENTIAL DATA CARD (Private Only) */}
            {isPrivateView && (
              <div className="bg-[#0F172A] rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 relative z-10">
                  <div className="flex items-center gap-4 text-amber-500">
                    <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/20 rounded-2xl shadow-inner">
                      <LucideLock className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="font-black text-2xl uppercase tracking-tight text-white">
                        Confidential Ledger
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                        Decrypted via Wallet Signature
                      </p>
                    </div>
                  </div>
                </div>

                {confidentialRecords.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {confidentialRecords.map((rec, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 border-t-4 border-t-amber-500 backdrop-blur-md hover:bg-white/10 transition-colors group"
                      >
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 bg-amber-500/10 w-fit px-3 py-1.5 rounded-lg border border-amber-500/20">
                          {rec.key}
                        </p>
                        <p className="font-black text-white text-xl mb-4">
                          {rec.value}
                        </p>

                        {rec.description && (
                          <p className="text-xs font-medium text-slate-300 mb-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 leading-relaxed">
                            {rec.description}
                          </p>
                        )}

                        {rec.prescription && (
                          <div className="mt-2 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5">
                              Secure Medication
                            </p>
                            <p className="text-sm font-bold text-amber-50">
                              {rec.prescription}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Dr. {rec.authorName || "Verified"}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                            {rec.timestamp > 0
                              ? new Date(
                                  rec.timestamp * 1000,
                                ).toLocaleDateString()
                              : "Recent"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 relative z-10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <LucideLock className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                      No Confidential Records Found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
