# 🏥 GoldenTime: Decentralized Health Ledger & Emergency Grid

**GoldenTime** is a blockchain-integrated medical record management system. It provides a secure, immutable, and instant-access platform for patient data, designed to bridge the gap between healthcare providers and emergency responders using the MERN stack and Ethereum-based blockchain technology.

---

## 🚀 Key Features

- **On-Chain Medical Records:** Doctors append patient diagnosis and history directly to the blockchain for a permanent, tamper-proof record.
- **Emergency QR Grid:** A unique QR code for every patient allows first responders to scan and instantly fetch life-saving data (Blood group, allergies, emergency contacts).
- **Ayush-Score:** A proprietary health scoring system that evaluates historical patient data to provide a quick, unified health rating.
- **Secure Document Storage:** Integration with **Cloudinary** for storing high-resolution medical reports and imaging securely off-chain.
- **Role-Based Dashboards:** Custom interfaces with specific permissions for Patients, Doctors, and Administrators.

---

## 📸 System Previews

### 1. Public Page Interface

The landing page allows users to register, log in, and features the primary "Emergency Scan" portal for quick access.
![Public Page Interface](<img width="1416" height="925" alt="image" src="https://github.com/user-attachments/assets/29c5bd33-c7e1-4a82-8505-f45506f9d727" />
)

### 2. Admin Panel

Administrators can verify doctor credentials, manage system users, and oversee the health of the decentralized network.
![Admin Panel](<img width="1559" height="637" alt="image" src="https://github.com/user-attachments/assets/a454c513-44ba-452a-aada-f36b26760f53" />
)

### 3. Doctor Dashboard: Appending Patient Data

Doctors use this interface to write medical notes and upload reports. When submitted, the data hash is securely stored on-chain.
![Doctor Dashboard](<img width="1514" height="1022" alt="image" src="https://github.com/user-attachments/assets/facd6e29-b7b2-4ded-a309-c780381634a1" />
)

### 4. Patient Data Fetch (Public/Emergency View)

The view triggered by the QR scan. It prioritizes "Golden Hour" information like blood type and chronic conditions for immediate action.
![Patient Data Fetch](<img width="793" height="917" alt="image" src="https://github.com/user-attachments/assets/dad974e6-3699-44e4-a0d2-c578d1851254" />
)

---

## 🛠️ Tech Stack

### Frontend (`/healthcare`)

- **React 19** & **Vite**: Ultra-fast development and optimized production build.
- **Ethers.js (v6)**: Interacting with Ethereum smart contracts.
- **Tailwind CSS** & **Framer Motion**: Utility-first styling and smooth UI animations.
- **HTML5-QRCode** & **React-QR-Reader**: Processing emergency QR code scans.
- **React Router v7**: Client-side routing.

### Backend (`/backend`)

- **Node.js** & **Express**: Handling REST API routing and business logic.
- **MongoDB** & **Mongoose**: Managing user profiles, metadata, and the Ayush-Score.
- **Cloudinary**: Secure cloud storage for medical files.
- **Nodemailer**: Automated email notifications.
- **JWT** & **Bcryptjs**: Secure authentication and password hashing.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd HealthCare-Utkarsh
```

2. Environment Variables (.env)
   You will need to create two separate .env files. Do not commit these files to GitHub.

Backend .env (Create in /backend/.env):

Code snippet

```bash
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Authentication
JWT_SECRET=your_super_secret_random_string_here

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary (Image/Report Storage)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret

# Default Admin Credentials
ADMIN_EMAIL=admin@goldentime.com
ADMIN_PASSWORD=admin_secure_password_123
Frontend .env (Create in /healthcare/.env):

Code snippet
# Backend API URL
VITE_BASE_URL=http://localhost:4000

# Smart Contract Address (Optional/If deployed)
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
3. Start the Backend
Navigate to the /backend folder, install dependencies, and start the server:

Bash
cd backend
npm install
npm run dev
The backend will run on http://localhost:4000

4. Start the Frontend
Open a new terminal, navigate to the /healthcare folder, install dependencies, and start the Vite server:

Bash
cd healthcare
npm install
npm run dev
```

The frontend will run on http://localhost:5173

🌟 Advantages
Data Integrity: Medical history cannot be altered, forged, or deleted once appended to the blockchain.

Instant Access: The Emergency-Grid eliminates the need for manual record-searching during emergencies.

Privacy: Patients maintain control over their detailed medical history while keeping emergency data accessible.

📄 License
Distributed under the ISC License.

Developed by: Beereshkumar B C

Would you like me to help you set up the Cloudinary connection logic or the Mongoose m
