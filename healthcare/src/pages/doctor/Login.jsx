import React, { useState } from "react";
import {
  LucideUser,
  LucideMail,
  LucideWallet,
  LucideBuilding2,
  LucideShieldCheck,
  LucideActivity,
  LucideArrowLeft,
  LucideStethoscope,
  LucideFileBadge,
  LucideUpload,
  LucideFileCheck,
  LucideLock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../../contexts/AppContext";

const Login = () => {
  const { axios, navigate, setDoctorToken } = useAppContext();
  const [isLogin, setIsLogin] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [degreeCertificate, setDegreeCertificate] = useState(null);
  const [medicalLicense, setMedicalLicense] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    hospitalName: "",
    specialization: "",
    licenseId: "",
    email: "",
    otp: ["", "", "", "", "", ""],
  });

  // Robust Wallet Sync (Silences the "Message channel" extension error)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .catch((err) => {
            if (err.code === -32002)
              toast.error("Check MetaMask for pending request");
            throw err;
          });
        setWalletAddress(accounts[0]);
        toast.success("Identity Synchronized");
      } catch (error) {
        console.log("Extension handled: connection rejected.");
      }
    } else {
      toast.error("Please install MetaMask!");
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress)
      return toast.error("Please link your Web3 wallet first");

    setLoading(true);
    const endpoint = isLogin ? "/api/doctor/login" : "/api/doctor/register";

    try {
      // ALWAYS use FormData so the Backend Router (Multer) can parse it
      const data = new FormData();
      data.append("email", formData.email);
      data.append("walletAddress", walletAddress);

      if (!isLogin) {
        data.append("fullName", formData.fullName);
        data.append("hospitalName", formData.hospitalName);
        data.append("specialization", formData.specialization);
        data.append("licenseId", formData.licenseId);

        if (degreeCertificate)
          data.append("degreeCertificate", degreeCertificate);
        if (medicalLicense) data.append("medicalLicense", medicalLicense);
      }

      // Send the FormData directly
      const response = await axios.post(endpoint, data);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowOtp(true);
      }
    } catch (error) {
      // Improved error logging
      const errorMsg =
        error.response?.data?.message || "Node Synchronization Failed";
      toast.error(errorMsg);
      console.error("Auth Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/doctor/verify-otp", {
        email: formData.email,
        otp: formData.otp.join(""),
      });

      if (data.success) {
        localStorage.setItem("doctorToken", data.token);
        setDoctorToken(data.token);
        toast.success("Identity Verified. Node Active.");
        navigate("/doctor/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Security Code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...formData.otp];
    newOtp[index] = element.value;
    setFormData({ ...formData, otp: newOtp });
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col lg:flex-row border border-white">
        {/* Left Sidebar */}
        <div className="lg:w-2/5 bg-[#1E40AF] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-[100px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <LucideActivity className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black italic">GoldenTime</h2>
            </div>
            <h3 className="text-4xl font-bold mb-6 leading-tight">
              Doctor Node <br /> Authorization
            </h3>
            <p className="text-blue-100 opacity-80 leading-relaxed">
              Securely synchronize your medical credentials with the
              decentralized health ledger.
            </p>
          </div>
          <div className="relative z-10 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
            <LucideShieldCheck className="w-6 h-6 text-blue-200 mb-2" />
            <p className="text-xs text-blue-50 font-bold tracking-widest uppercase">
              V3 Encrypted Protocol
            </p>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="flex-1 p-8 lg:p-16 bg-white flex flex-col justify-center overflow-y-auto">
          {showOtp ? (
            <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setShowOtp(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase mb-12 transition-all"
              >
                <LucideArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                Security Code
              </h1>
              <p className="text-slate-500 mb-10 text-sm">
                Enter the code sent to{" "}
                <span className="font-bold text-blue-600">
                  {formData.email}
                </span>
              </p>
              <div className="flex gap-3 mb-10">
                {formData.otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-full h-16 text-center text-3xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
              >
                {loading ? "Verifying..." : "Connect Identity"}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-10">
                {isLogin ? "Sign In" : "Register Node"}
              </h1>
              <form className="space-y-4" onSubmit={handleInitialSubmit}>
                {!isLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                        Full Name
                      </span>
                      <input
                        required={!isLogin}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold shadow-sm transition-all"
                        placeholder="Dr. Beeresh"
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                        Hospital
                      </span>
                      <input
                        required={!isLogin}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold shadow-sm transition-all"
                        placeholder="GMIT Hospital"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hospitalName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                        Specialty
                      </span>
                      <input
                        required={!isLogin}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold shadow-sm transition-all"
                        placeholder="Cardiology"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialization: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                        License ID
                      </span>
                      <input
                        required={!isLogin}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold shadow-sm transition-all"
                        placeholder="MC-2025"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseId: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <label
                        className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${degreeCertificate ? "border-blue-600 bg-blue-50 text-blue-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-600"}`}
                      >
                        <span className="text-[10px] font-bold uppercase truncate max-w-[120px] tracking-widest">
                          {degreeCertificate
                            ? degreeCertificate.name
                            : "Degree (JPG)"}
                        </span>
                        {degreeCertificate ? (
                          <LucideFileCheck className="w-5 h-5" />
                        ) : (
                          <LucideUpload className="w-5 h-5" />
                        )}
                        <input
                          type="file"
                          accept="image/jpeg"
                          required={!isLogin}
                          className="hidden"
                          onChange={(e) =>
                            setDegreeCertificate(e.target.files[0])
                          }
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${medicalLicense ? "border-blue-600 bg-blue-50 text-blue-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-600"}`}
                      >
                        <span className="text-[10px] font-bold uppercase truncate max-w-[120px] tracking-widest">
                          {medicalLicense
                            ? medicalLicense.name
                            : "License (JPG)"}
                        </span>
                        {medicalLicense ? (
                          <LucideFileCheck className="w-5 h-5" />
                        ) : (
                          <LucideUpload className="w-5 h-5" />
                        )}
                        <input
                          type="file"
                          accept="image/jpeg"
                          required={!isLogin}
                          className="hidden"
                          onChange={(e) => setMedicalLicense(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                    Medical Email
                  </span>
                  <input
                    required={!showOtp}
                    type="email"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold shadow-sm transition-all"
                    placeholder="doctor@hospital.com"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={connectWallet}
                  className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center transition-all shadow-sm ${walletAddress ? "border-green-600 bg-green-50 text-green-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-600"}`}
                >
                  <span className="font-bold uppercase text-[10px] tracking-widest flex items-center gap-3">
                    <LucideWallet className="w-5 h-5" />
                    {walletAddress
                      ? "Wallet Authenticated"
                      : "Link Web3 Identity"}
                  </span>
                  {walletAddress && (
                    <span className="text-[10px] font-mono font-bold bg-green-200 text-green-800 px-3 py-1 rounded-lg">
                      {walletAddress.slice(0, 10)}...
                    </span>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all"
                >
                  {loading
                    ? "Authorizing..."
                    : isLogin
                      ? "Request Login Code"
                      : "Create Doctor Node"}
                </button>

                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-2 border-transparent hover:border-blue-600/20 pb-1"
                  >
                    {isLogin
                      ? "Need a node? Register Here"
                      : "Already registered? Sign In"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
