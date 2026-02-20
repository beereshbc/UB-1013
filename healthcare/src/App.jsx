import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAppContext } from "./contexts/AppContext";

import Login from "./pages/doctor/Login";
import DoctorHome from "./pages/doctor/DoctorHome";
import CreatePatient from "./pages/doctor/CreatePatient";
import UpdateRecords from "./pages/doctor/UpdateRecords";
import SearchPatient from "./pages/doctor/SearchPatient";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import PatientDashboard from "./pages/patient/PatientDashboard";
import MainHome from "./pages/patient/MainHome";

const App = () => {
  const { adminToken, doctorToken } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Routes>
        <Route path="/" element={<MainHome />} />

        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        {doctorToken ? (
          <>
            <Route path="/doctor/home" element={<DoctorHome />} />
            <Route path="/doctor/create-patient" element={<CreatePatient />} />
            <Route path="/doctor/update-records" element={<UpdateRecords />} />
            <Route path="/doctor/search/:method" element={<SearchPatient />} />
            <Route
              path="/doctor/login"
              element={<Navigate to="/doctor/home" />}
            />
          </>
        ) : (
          <>
            <Route path="/doctor/login" element={<Login />} />
            <Route path="/doctor/*" element={<Navigate to="/doctor/login" />} />
          </>
        )}

        {adminToken ? (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<Navigate to="/admin" />} />
          </>
        ) : (
          <>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
