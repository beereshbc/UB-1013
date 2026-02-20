import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  LucideAlertCircle,
  LucideArrowLeft,
  LucideCamera,
  LucideUpload,
  LucideX,
} from "lucide-react";
import { QrReader } from "react-qr-reader";
import jsQR from "jsqr"; // For processing local gallery images
import { useAppContext } from "../../contexts/AppContext";
import toast from "react-hot-toast";

const SearchPatient = () => {
  const { method } = useParams(); // 'qr', 'aadhaar', 'phone', 'email', 'wallet', 'bio'
  const navigate = useNavigate();
  const { contract, account, initBlockchain } = useAppContext();

  // Core States
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // QR Specific States
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // Data States
  const [patientId, setPatientId] = useState("");
  const [primaryRecords, setPrimaryRecords] = useState([]);
  const [confidentialRecords, setConfidentialRecords] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // UI Configuration based on URL parameter
  const methodConfig = {
    aadhaar: {
      label: "Aadhaar / ID Number",
      icon: LucideIdCard,
      placeholder: "Enter 12-digit Aadhaar",
    },
    phone: {
      label: "Phone Number",
      icon: LucideSmartphone,
      placeholder: "Enter Phone Number",
    },
    email: {
      label: "Email Address",
      icon: LucideMail,
      placeholder: "Enter Email Address",
    },
    wallet: {
      label: "Wallet Address",
      icon: LucideWallet,
      placeholder: "Enter 0x... Address",
    },
    qr: {
      label: "QR Code Data",
      icon: LucideQrCode,
      placeholder: "Aadhaar embedded in QR",
    },
    bio: {
      label: "Biometric Hash",
      icon: LucideLock,
      placeholder: "Enter Biometric Hash",
    },
  };

  const currentConfig = methodConfig[method] || methodConfig.aadhaar;
  const Icon = currentConfig.icon;

  // --- CORE SEARCH LOGIC ---
  const handleSearch = async (e, directValue = null) => {
    if (e) e.preventDefault();

    // Use the direct value from QR, or the typed input
    let queryValue = directValue || searchInput;
    if (!queryValue) return toast.error("Please provide search data");

    setLoading(true);
    setSearched(true);
    setPrimaryRecords([]);
    setConfidentialRecords([]);
    setShowScanner(false); // Close camera if open

    const toastId = toast.loading("Querying Blockchain Ledger...");

    try {
      // 1. Connection Check
      let activeContract = contract;
      let userWallet = account;
      if (!activeContract || !userWallet) {
        const res = await initBlockchain();
        activeContract = res.ledgerContract;
        userWallet = res.address;
      }

      // 2. Extract ID if QR Code contains a full URL (e.g. http://localhost/doctor/patient/1234)
      if (method === "qr" && queryValue.includes("/")) {
        const parts = queryValue.split("/");
        queryValue = parts[parts.length - 1]; // Grabs the ID from the end of the URL
      }

      // 3. Resolve Patient ID
      let resolvedId = 0n;
      if (method === "aadhaar" || method === "qr") {
        resolvedId = BigInt(queryValue);
      } else if (method === "phone") {
        resolvedId = await activeContract.getPatientIdByPhone(queryValue);
      } else if (method === "email") {
        resolvedId = await activeContract.getPatientIdByEmail(queryValue);
      } else if (method === "wallet") {
        resolvedId = await activeContract.getPatientIdByWallet(queryValue);
      }

      if (resolvedId === 0n)
        throw new Error("Patient not found on the network.");
      setPatientId(resolvedId.toString());

      // 4. Authorization Check
      const providerInfo = await activeContract.providers(userWallet);
      const authorized = providerInfo && providerInfo.isAuthorized;
      setIsAuthorized(authorized);

      // 5. Fetch Data
      if (authorized) {
        toast.loading("Authorized. Fetching Full Medical History...", {
          id: toastId,
        });
        const fullHistory =
          await activeContract.getFullMedicalHistory(resolvedId);
        setPrimaryRecords(fullHistory.filter((r) => !r.isConfidential));
        setConfidentialRecords(fullHistory.filter((r) => r.isConfidential));
        toast.success("Full Ledger Retrieved Successfully", { id: toastId });
      } else {
        toast.loading("Unauthorized. Fetching Public Emergency Data...", {
          id: toastId,
        });
        const primaryData = await activeContract.getPrimaryData(resolvedId);
        setPrimaryRecords(primaryData);
        toast.success("Emergency Data Retrieved", { id: toastId });
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast.error(error.reason || error.message || "Search failed", {
        id: toastId,
      });
      setSearched(false);
    } finally {
      setLoading(false);
    }
  };

  // --- LIVE CAMERA SCANNER ---
  const handleCameraScan = (result, error) => {
    if (result) {
      const qrData = result?.text || result;
      setSearchInput(qrData);
      toast.success("QR Code Detected!");
      handleSearch(null, qrData); // Auto-trigger search
    }
  };

  // --- LOCAL GALLERY IMAGE UPLOAD ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw image to canvas to extract pixel data for jsQR
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Decode QR
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          toast.success("QR Code Read Successfully!");
          setSearchInput(code.data);
          handleSearch(null, code.data); // Auto-trigger search
        } else {
          toast.error("Could not find a valid QR code in this image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <button
          onClick={() => navigate("/doctor/home")}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <LucideArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                Search via {currentConfig.label}
              </h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                Decentralized Retrieval Engine
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Search Area (QR vs Standard) */}
        {method === "qr" ? (
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            {showScanner ? (
              <div className="relative max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-slate-100 bg-black">
                <button
                  onClick={() => setShowScanner(false)}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
                >
                  <LucideX className="w-4 h-4" />
                </button>
                <QrReader
                  onResult={handleCameraScan}
                  constraints={{ facingMode: "environment" }}
                  className="w-full"
                />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/70 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm">
                    Point camera at QR Code
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera Button */}
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <LucideCamera className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="font-bold text-slate-700">Open Camera</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Scan physical code
                  </span>
                </button>

                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <LucideUpload className="w-8 h-8 text-emerald-500" />
                  </div>
                  <span className="font-bold text-slate-700">Upload Image</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Select from gallery
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

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Or enter manually
              </span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <form onSubmit={(e) => handleSearch(e)} className="mt-6 flex gap-4">
              <input
                type="text"
                className="flex-1 p-4 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-blue-500"
                placeholder={currentConfig.placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  <LucideLoader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Standard Input Bar for Aadhaar, Phone, Email, etc. */
          <form
            onSubmit={(e) => handleSearch(e)}
            className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100 flex gap-4"
          >
            <div className="flex-1 relative">
              <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type={method === "email" ? "email" : "text"}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-xl border-none font-bold outline-blue-500 text-slate-700"
                placeholder={currentConfig.placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              {loading ? (
                <LucideLoader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LucideSearch className="w-5 h-5" />
              )}
              Retrieve Node
            </button>
          </form>
        )}

        {/* Blockchain Results Section */}
        {searched && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Primary Data Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-100">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <LucideShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg uppercase tracking-tight text-slate-900">
                      Primary Data
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Emergency Access (Public)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Patient ID
                  </p>
                  <p className="font-mono font-bold text-slate-700">
                    {patientId}
                  </p>
                </div>
              </div>

              {primaryRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {primaryRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-500"
                    >
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                        {rec.key}
                      </p>
                      <p className="font-bold text-slate-800 text-lg mb-2">
                        {rec.value}
                      </p>
                      {rec.description && (
                        <p className="text-xs text-slate-500 mb-2">
                          {rec.description}
                        </p>
                      )}
                      {rec.prescription && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Prescription
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {rec.prescription}
                          </p>
                        </div>
                      )}
                      <p className="text-[9px] font-bold text-slate-400 text-right mt-3">
                        By: {rec.authorName || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 font-bold py-8">
                  No primary data available.
                </p>
              )}
            </div>

            {/* Confidential Data Card */}
            <div
              className={`rounded-[2.5rem] p-8 shadow-xl ${isAuthorized ? "bg-[#0F172A] border border-slate-800" : "bg-slate-100 border border-slate-200 border-dashed"}`}
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 text-amber-500">
                  <div
                    className={`p-2 rounded-lg ${isAuthorized ? "bg-amber-500/10" : "bg-slate-200 text-slate-400"}`}
                  >
                    <LucideLock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      className={`font-black text-lg uppercase tracking-tight ${isAuthorized ? "text-white" : "text-slate-500"}`}
                    >
                      Confidential Data
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Authorized Personnel Only
                    </p>
                  </div>
                </div>
                {!isAuthorized && (
                  <span className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <LucideAlertCircle className="w-4 h-4" /> Access Denied
                  </span>
                )}
              </div>

              {!isAuthorized ? (
                <div className="text-center py-10">
                  <LucideLock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">
                    You are not authorized to view this patient's confidential
                    data.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Contact the system administrator to authorize your wallet
                    address.
                  </p>
                </div>
              ) : confidentialRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {confidentialRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white/5 border-l-4 border-amber-500"
                    >
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
                        {rec.key}
                      </p>
                      <p className="font-bold text-white text-lg mb-2">
                        {rec.value}
                      </p>
                      {rec.description && (
                        <p className="text-xs text-slate-400 mb-2">
                          {rec.description}
                        </p>
                      )}
                      {rec.prescription && (
                        <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-white/10">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            Secure Medication
                          </p>
                          <p className="text-xs font-bold text-amber-100">
                            {rec.prescription}
                          </p>
                        </div>
                      )}
                      <p className="text-[9px] font-bold text-slate-500 text-right mt-3">
                        By: {rec.authorName || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 font-bold py-8">
                  No confidential data available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPatient;
