import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ethers } from "ethers";

const AppContext = createContext();

// 1. Paste your Contract Address here after deployment
const CONTRACT_ADDRESS = "0xf7e6284c5Eb37146e7eF281f050bCaeb1e3F7E7C";

// 2. Paste your compiled Solidity ABI here
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_license",
        type: "string",
      },
    ],
    name: "authorizeProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_phone",
        type: "string",
      },
      {
        internalType: "string",
        name: "_email",
        type: "string",
      },
      {
        internalType: "address",
        name: "_pWallet",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string",
          },
          {
            internalType: "string",
            name: "value",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "prescription",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isConfidential",
            type: "bool",
          },
          {
            internalType: "address",
            name: "authorWallet",
            type: "address",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct GoldenTimeLedgerV3.MedicalEntry[]",
        name: "_initialRecords",
        type: "tuple[]",
      },
    ],
    name: "onboardPatient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "patientID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "confidential",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "address",
        name: "author",
        type: "address",
      },
    ],
    name: "EntryAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "patientID",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "doctor",
        type: "address",
      },
    ],
    name: "PatientOnboarded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "ProviderAuthorized",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "revokeProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "string[]",
        name: "_keys",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "_values",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "_descriptions",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "_prescriptions",
        type: "string[]",
      },
      {
        internalType: "bool",
        name: "_isConfidential",
        type: "bool",
      },
    ],
    name: "updatePatientData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getFullMedicalHistory",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string",
          },
          {
            internalType: "string",
            name: "value",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "prescription",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isConfidential",
            type: "bool",
          },
          {
            internalType: "address",
            name: "authorWallet",
            type: "address",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct GoldenTimeLedgerV3.MedicalEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyRecords",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string",
          },
          {
            internalType: "string",
            name: "value",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "prescription",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isConfidential",
            type: "bool",
          },
          {
            internalType: "address",
            name: "authorWallet",
            type: "address",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct GoldenTimeLedgerV3.MedicalEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_email",
        type: "string",
      },
    ],
    name: "getPatientIdByEmail",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_phone",
        type: "string",
      },
    ],
    name: "getPatientIdByPhone",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "getPatientIdByWallet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getPrimaryData",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string",
          },
          {
            internalType: "string",
            name: "value",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "prescription",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isConfidential",
            type: "bool",
          },
          {
            internalType: "address",
            name: "authorWallet",
            type: "address",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct GoldenTimeLedgerV3.MedicalEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "patientProfiles",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "phone",
        type: "string",
      },
      {
        internalType: "string",
        name: "email",
        type: "string",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "providers",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "licenseNumber",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isAuthorized",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [doctorToken, setDoctorToken] = useState(
    localStorage.getItem("doctorToken") || null,
  );
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken") || null,
  );

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Blockchain Connection
  const initBlockchain = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const ledgerContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer,
        );

        setContract(ledgerContract);
        const address = await signer.getAddress();
        setAccount(address);
        return { ledgerContract, address };
      } else {
        toast.error("Please install MetaMask to use Blockchain features");
      }
    } catch (error) {
      console.error("Blockchain Init Error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("adminToken");
    setDoctorToken(null);
    setAdminToken(null);
    navigate("/");
  };

  const value = {
    navigate,
    axios,
    doctorToken,
    setDoctorToken,
    adminToken,
    setAdminToken,
    account,
    contract,
    initBlockchain,
    logout,
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
