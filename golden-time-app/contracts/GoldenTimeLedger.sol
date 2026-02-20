// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GoldenTimeLedgerV3
 * @dev Advanced decentralized medical ledger with Treatment Descriptions and Prescriptions.
 */
contract GoldenTimeLedgerV3 {
    address public admin;

    struct Provider {
        string name;
        string licenseNumber;
        bool isAuthorized;
    }

    struct MedicalEntry {
        string key;             // e.g., "Diabetes Checkup"
        string value;           // e.g., "HbA1c: 7.2"
        string description;     // Detailed treatment/diagnosis notes
        string prescription;    // Medication details (e.g., "Metformin 500mg BD")
        bool isConfidential;    // false = Primary (Emergency), true = Confidential
        address authorWallet;
        string authorName;
        uint256 timestamp;
    }

    struct PatientProfile {
        uint256 id;             // Primary Key (e.g. Aadhaar Hash)
        string phone;
        string email;
        address wallet;
        bool exists;
    }

    // --- STATE VARIABLES ---
    mapping(address => Provider) public providers;
    mapping(uint256 => PatientProfile) public patientProfiles;
    mapping(uint256 => MedicalEntry[]) private patientRecords;

    // Lookup mappings for cross-referencing credentials
    mapping(string => uint256) private phoneToId;
    mapping(string => uint256) private emailToId;
    mapping(address => uint256) private walletToId;

    // --- EVENTS ---
    event ProviderAuthorized(address indexed provider, string name);
    event PatientOnboarded(uint256 indexed patientID, address indexed doctor);
    event EntryAdded(uint256 indexed patientID, bool confidential, address indexed author);

    // --- MODIFIERS ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }

    modifier onlyAuthorized() {
        require(providers[msg.sender].isAuthorized, "Doctor not authorized by Admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // =============================================================
    // 1. ADMIN FUNCTIONS
    // =============================================================

    function authorizeProvider(address _wallet, string memory _name, string memory _license) public onlyAdmin {
        providers[_wallet] = Provider(_name, _license, true);
        emit ProviderAuthorized(_wallet, _name);
    }

    function revokeProvider(address _wallet) public onlyAdmin {
        providers[_wallet].isAuthorized = false;
    }

    // =============================================================
    // 2. DOCTOR FUNCTIONS (Batch Operations)
    // =============================================================

    /**
     * @dev Initialize a new patient profile with multiple categories of data.
     */
    function onboardPatient(
        uint256 _id,
        string memory _phone,
        string memory _email,
        address _pWallet,
        MedicalEntry[] memory _initialRecords
    ) public onlyAuthorized {
        require(!patientProfiles[_id].exists, "Patient already exists");

        patientProfiles[_id] = PatientProfile(_id, _phone, _email, _pWallet, true);
        
        if (bytes(_phone).length > 0) phoneToId[_phone] = _id;
        if (bytes(_email).length > 0) emailToId[_email] = _id;
        if (_pWallet != address(0)) walletToId[_pWallet] = _id;

        string memory docName = providers[msg.sender].name;

        for (uint i = 0; i < _initialRecords.length; i++) {
            MedicalEntry memory entry = _initialRecords[i];
            entry.authorWallet = msg.sender;
            entry.authorName = docName;
            entry.timestamp = block.timestamp;
            patientRecords[_id].push(entry);
        }

        emit PatientOnboarded(_id, msg.sender);
    }

    /**
     * @dev Add new medical data (Prescriptions, Vitals, Checkups) to existing patient.
     */
    function updatePatientData(
        uint256 _id,
        string[] memory _keys,
        string[] memory _values,
        string[] memory _descriptions,
        string[] memory _prescriptions,
        bool _isConfidential
    ) public onlyAuthorized {
        require(patientProfiles[_id].exists, "Patient not found");
        require(_keys.length == _values.length && _keys.length == _descriptions.length, "Array length mismatch");

        string memory docName = providers[msg.sender].name;

        for (uint i = 0; i < _keys.length; i++) {
            patientRecords[_id].push(MedicalEntry({
                key: _keys[i],
                value: _values[i],
                description: _descriptions[i],
                prescription: _prescriptions[i],
                isConfidential: _isConfidential,
                authorWallet: msg.sender,
                authorName: docName,
                timestamp: block.timestamp
            }));
        }
        emit EntryAdded(_id, _isConfidential, msg.sender);
    }

    // =============================================================
    // 3. RETRIEVAL FUNCTIONS
    // =============================================================

    function getPatientIdByPhone(string memory _phone) public view returns (uint256) {
        return phoneToId[_phone];
    }

    function getPatientIdByEmail(string memory _email) public view returns (uint256) {
        return emailToId[_email];
    }

    function getPatientIdByWallet(address _wallet) public view returns (uint256) {
        return walletToId[_wallet];
    }

    /**
     * @dev Emergency Access: Returns Primary data only.
     */
    function getPrimaryData(uint256 _id) public view returns (MedicalEntry[] memory) {
        return _filterRecords(_id, false);
    }

    /**
     * @dev Full Access: Returns Primary + Confidential (Authorized Doctors Only).
     */
    function getFullMedicalHistory(uint256 _id) public view onlyAuthorized returns (MedicalEntry[] memory) {
        return patientRecords[_id];
    }

    /**
     * @dev Patient Personal Access: Returns everything. 
     * Note: UI should call this for the connected patient wallet.
     */
    function getMyRecords() public view returns (MedicalEntry[] memory) {
        uint256 id = walletToId[msg.sender];
        require(id != 0, "No records found for this wallet");
        return patientRecords[id];
    }

    // Internal filter for Primary (false) vs Confidential (true)
    function _filterRecords(uint256 _id, bool _confidential) internal view returns (MedicalEntry[] memory) {
        uint256 count = 0;
        MedicalEntry[] storage all = patientRecords[_id];
        
        for (uint i = 0; i < all.length; i++) {
            if (all[i].isConfidential == _confidential) count++;
        }

        MedicalEntry[] memory result = new MedicalEntry[](count);
        uint256 index = 0;
        for (uint i = 0; i < all.length; i++) {
            if (all[i].isConfidential == _confidential) {
                result[index] = all[i];
                index++;
            }
        }
        return result;
    }
}