// TON Web setup
let tonweb;
let contract;
let walletConnection;
let userAddress;
let contractAddress = "EQC..."; // Replace with your deployed contract address

// Initialize TON Web
    tonweb = new TonWeb();

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const disconnectWalletBtn = document.getElementById('disconnect-wallet');
const walletInfo = document.getElementById('wallet-info');
const walletAddressSpan = document.getElementById('wallet-address');
const dashboard = document.getElementById('dashboard') || document.getElementById('admin-dashboard');

// Wallet Connection
async function connectWallet() {
    try {
        if (window.tonConnectUI) {
            await window.tonConnectUI.openModal();
            const wallet = window.tonConnectUI.wallet;
            if (wallet) {
                userAddress = wallet.account.address;
                walletAddressSpan.textContent = shortenAddress(userAddress);
                walletInfo.classList.remove('hidden');
                connectWalletBtn.classList.add('hidden');
                if (dashboard) dashboard.classList.remove('hidden');
                
                // Initialize contract with wallet
                await initializeContract();
                
                // Load initial data
                await loadContractData();
                await loadUserData();
            }
        } else {
            alert('TON Connect UI not available. Please install a TON wallet extension.');
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

function disconnectWallet() {
    userAddress = null;
    contract = null;
    walletInfo.classList.add('hidden');
    connectWalletBtn.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    
    if (window.tonConnectUI) {
        window.tonConnectUI.disconnect();
    }
}

// Contract Initialization
async function initializeContract() {
    if (!contractAddress || !userAddress) return;
    
    try {
        const wallet = window.tonConnectUI.wallet;
        if (!wallet) throw new Error('Wallet not connected');
        
        // Initialize contract with TON Web
        const provider = tonweb.provider;
        const keyPair = await tonweb.getKeyPairFromSeed(wallet.account.publicKey);
        
        // Create contract instance
        contract = new tonweb.Contract(provider, {
            address: contractAddress,
            abi: {
                types: [
                    { name: 'Transfer', type: 'struct', fields: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint128' },
                        { name: 'responseAddress', type: 'address' }
                    ]},
                    { name: 'Mint', type: 'struct', fields: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint128' }
                    ]},
                    { name: 'ToggleTransfers', type: 'struct', fields: []},
                    { name: 'SetFee', type: 'struct', fields: [
                        { name: 'feePercentage', type: 'uint32' }
                    ]},
                    { name: 'SetFeeCollector', type: 'struct', fields: [
                        { name: 'collector', type: 'address' }
                    ]},
                    { name: 'SetUserPermissions', type: 'struct', fields: [
                        { name: 'user', type: 'address' },
                        { name: 'canTransfer', type: 'bool' },
                        { name: 'isWhitelisted', type: 'bool' },
                        { name: 'customFee', type: 'uint32' }
                    ]}
                ],
                getters: [
                    { name: 'get_total_supply', inputs: [], outputs: [{ name: 'totalSupply', type: 'uint128' }] },
                    { name: 'get_user_balance', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'balance', type: 'uint128' }] },
                    { name: 'get_transfer_enabled', inputs: [], outputs: [{ name: 'enabled', type: 'bool' }] },
                    { name: 'get_fee_percentage', inputs: [], outputs: [{ name: 'fee', type: 'uint32' }] },
                    { name: 'get_user_permissions', inputs: [{ name: 'user', type: 'address' }], outputs: [
                        { name: 'canTransfer', type: 'bool' },
                        { name: 'isWhitelisted', type: 'bool' },
                        { name: 'customFee', type: 'uint32' }
                    ]}
                ],
                messages: [
                    { name: 'Transfer', inputs: [{ name: 'msg', type: 'Transfer' }] },
                    { name: 'Mint', inputs: [{ name: 'msg', type: 'Mint' }] },
                    { name: 'ToggleTransfers', inputs: [{ name: 'msg', type: 'ToggleTransfers' }] },
                    { name: 'SetFee', inputs: [{ name: 'msg', type: 'SetFee' }] },
                    { name: 'SetFeeCollector', inputs: [{ name: 'msg', type: 'SetFeeCollector' }] },
                    { name: 'SetUserPermissions', inputs: [{ name: 'msg', type: 'SetUserPermissions' }] }
                ]
            }
        });
        
        console.log('Contract initialized successfully');
    } catch (error) {
        console.error('Failed to initialize contract:', error);
        alert('Failed to initialize contract: ' + error.message);
    }
}

function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// Contract Data Loading
async function loadContractData() {
    if (!contract || !contractAddress) {
        console.warn('Contract not initialized');
        return;
    }
    
    try {
        const totalSupplyResult = await contract.methods.get_total_supply({});
        const transferEnabledResult = await contract.methods.get_transfer_enabled({});
        const feePercentageResult = await contract.methods.get_fee_percentage({});

        const data = {
            totalSupply: TonWeb.utils.fromNano(totalSupplyResult.totalSupply.toString()),
            transferEnabled: transferEnabledResult.enabled,
            feePercentage: feePercentageResult.fee.toString(),
            feeCollector: contractAddress
        };
        
        updateContractUI(data);
    } catch (error) {
        console.error('Failed to load contract data:', error);
    }
}

async function loadUserData() {
    if (!userAddress || !contract || !contractAddress) return;
    
    try {
        const balanceResult = await contract.methods.get_user_balance({ user: userAddress });
        const permissionsResult = await contract.methods.get_user_permissions({ user: userAddress });
        
        document.getElementById('user-balance').textContent = formatAmount(TonWeb.utils.fromNano(balanceResult.balance.toString()));
        updatePermissionsUI({
            canTransfer: permissionsResult.canTransfer,
            isWhitelisted: permissionsResult.isWhitelisted,
            customFee: permissionsResult.customFee.toString()
        });
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}



function updateContractUI(data) {
    const totalSupplyEl = document.getElementById('total-supply') || document.getElementById('admin-total-supply');
    const transferStatusEl = document.getElementById('transfer-status') || document.getElementById('admin-transfer-status');
    const feeRateEl = document.getElementById('fee-rate') || document.getElementById('admin-fee-rate');
    
    if (totalSupplyEl) totalSupplyEl.textContent = formatAmount(data.totalSupply);
    if (transferStatusEl) {
        transferStatusEl.textContent = data.transferEnabled ? 'Enabled' : 'Disabled';
        transferStatusEl.className = data.transferEnabled ? 'text-green-400 font-medium' : 'text-red-400 font-medium';
    }
    if (feeRateEl) feeRateEl.textContent = data.feePercentage;
}

function updatePermissionsUI(permissions) {
    // Update any permission-related UI
    console.log('User permissions:', permissions);
}

// Utility Functions
function formatAmount(amount) {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString();
}

function calculateFee(amount, feePercentage = 2) {
    if (!amount || amount <= 0) return 0;
    return (amount * feePercentage) / 100;
}

// Event Listeners
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
}

if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
}

// Fee Calculator
const calcAmountInput = document.getElementById('calc-amount');
const calcFeeSpan = document.getElementById('calc-fee');
const calcNetSpan = document.getElementById('calc-net');

if (calcAmountInput && calcFeeSpan && calcNetSpan) {
    calcAmountInput.addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value) || 0;
        const fee = calculateFee(amount);
        calcFeeSpan.textContent = fee.toFixed(6);
        calcNetSpan.textContent = (amount - fee).toFixed(6);
    });
}

// Transfer Form
const transferForm = document.getElementById('transfer-form');
const transferAmountInput = document.getElementById('transfer-amount');
const estimatedFeeSpan = document.getElementById('estimated-fee');

if (transferAmountInput && estimatedFeeSpan) {
    transferAmountInput.addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value) || 0;
        const fee = calculateFee(amount);
        estimatedFeeSpan.textContent = fee.toFixed(6);
    });
}

if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipient = document.getElementById('recipient-address').value;
        const amount = document.getElementById('transfer-amount').value;
        
        if (!recipient || !amount || amount <= 0) {
            alert('Please enter valid recipient and amount');
            return;
        }
        
        try {
            await transferJettons(recipient, amount);
            alert(`Successfully transferred ${amount} MEHDI to ${shortenAddress(recipient)}`);
            transferForm.reset();
            await loadUserData();
        } catch (error) {
            console.error('Transfer failed:', error);
            alert('Transfer failed: ' + error.message);
        }
    });
}

// Mint Form (Admin)
const mintForm = document.getElementById('mint-form');
if (mintForm) {
    mintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipient = document.getElementById('mint-recipient').value;
        const amount = document.getElementById('mint-amount').value;
        
        if (!recipient || !amount || amount <= 0) {
            alert('Please enter valid recipient and amount');
            return;
        }
        
        try {
            await mintJettons(recipient, amount);
            alert(`Successfully minted ${amount} MEHDI to ${shortenAddress(recipient)}`);
            mintForm.reset();
            await loadContractData();
            await loadUserData();
        } catch (error) {
            console.error('Mint failed:', error);
            alert('Mint failed: ' + error.message);
        }
    });
}

// Fee Form (Admin)
const feeForm = document.getElementById('fee-form');
if (feeForm) {
    feeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newFee = document.getElementById('new-fee').value;
        if (newFee < 0 || newFee > 10) {
            alert('Fee must be between 0 and 10%');
            return;
        }
        
        try {
            await setFee(newFee);
            alert(`Successfully updated fee to ${newFee}%`);
            feeForm.reset();
            await loadContractData();
            addAdminLog(`Updated fee to ${newFee}%`);
        } catch (error) {
            console.error('Fee update failed:', error);
            alert('Fee update failed: ' + error.message);
        }
    });
}

// Toggle Transfers (Admin)
const toggleTransfersBtn = document.getElementById('toggle-transfers');
if (toggleTransfersBtn) {
    toggleTransfersBtn.addEventListener('click', async () => {
        try {
            await toggleTransfers();
            const newStatus = await getTransferStatus();
            updateContractUI({ transferEnabled: newStatus });
            addAdminLog(`Transfers ${newStatus ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Toggle transfers failed:', error);
            alert('Toggle transfers failed: ' + error.message);
        }
    });
}

// Collector Form (Admin)
const collectorForm = document.getElementById('collector-form');
if (collectorForm) {
    collectorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newCollector = document.getElementById('new-collector').value;
        if (!newCollector) {
            alert('Please enter valid collector address');
            return;
        }
        
        try {
            await setFeeCollector(newCollector);
            alert(`Successfully updated fee collector to ${shortenAddress(newCollector)}`);
            collectorForm.reset();
            await loadContractData();
            addAdminLog(`Updated fee collector to ${shortenAddress(newCollector)}`);
        } catch (error) {
            console.error('Collector update failed:', error);
            alert('Collector update failed: ' + error.message);
        }
    });
}

// Permissions Form (Admin)
const permissionsForm = document.getElementById('permissions-form');
if (permissionsForm) {
    permissionsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userAddress = document.getElementById('user-address').value;
        const canTransfer = document.getElementById('can-transfer').checked;
        const isWhitelisted = document.getElementById('is-whitelisted').checked;
        const customFee = document.getElementById('custom-fee').value || 0;
        
        if (!userAddress) {
            alert('Please enter valid user address');
            return;
        }
        
        try {
            await setUserPermissions(userAddress, canTransfer, isWhitelisted, customFee);
            alert(`Successfully updated permissions for ${shortenAddress(userAddress)}`);
            permissionsForm.reset();
            addAdminLog(`Updated permissions for ${shortenAddress(userAddress)}`);
        } catch (error) {
            console.error('Permissions update failed:', error);
            alert('Permissions update failed: ' + error.message);
        }
    });
}

// Contract Interaction Functions
async function transferJettons(recipient, amount) {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const amountNano = TonWeb.utils.toNano(amount.toString());
        
        const result = await contract.methods.Transfer({
            msg: {
                to: recipient,
                amount: amountNano,
                responseAddress: userAddress
            }
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('Transfer successful:', result);
        return result;
    } catch (error) {
        console.error('Transfer failed:', error);
        throw error;
    }
}

async function mintJettons(recipient, amount) {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const amountNano = TonWeb.utils.toNano(amount.toString());
        
        const result = await contract.methods.Mint({
            msg: {
                to: recipient,
                amount: amountNano
            }
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('Mint successful:', result);
        return result;
    } catch (error) {
        console.error('Mint failed:', error);
        throw error;
    }
}

async function setFee(newFee) {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const result = await contract.methods.SetFee({
            msg: {
                feePercentage: parseInt(newFee)
            }
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('Fee update successful:', result);
        return result;
    } catch (error) {
        console.error('Fee update failed:', error);
        throw error;
    }
}

async function toggleTransfers() {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const result = await contract.methods.ToggleTransfers({
            msg: {}
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('Transfer toggle successful:', result);
        return result;
    } catch (error) {
        console.error('Transfer toggle failed:', error);
        throw error;
    }
}

async function getTransferStatus() {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
        const result = await contract.methods.get_transfer_enabled({});
        return result.enabled;
    } catch (error) {
        console.error('Failed to get transfer status:', error);
        throw error;
    }
}

async function setFeeCollector(newCollector) {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const result = await contract.methods.SetFeeCollector({
            msg: {
                collector: newCollector
            }
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('Fee collector update successful:', result);
        return result;
    } catch (error) {
        console.error('Fee collector update failed:', error);
        throw error;
    }
}

async function setUserPermissions(userAddress, canTransfer, isWhitelisted, customFee) {
    if (!contract || !userAddress) throw new Error('Contract not initialized');
    
    try {
        const result = await contract.methods.SetUserPermissions({
            msg: {
                user: userAddress,
                canTransfer: canTransfer,
                isWhitelisted: isWhitelisted,
                customFee: parseInt(customFee)
            }
        }).send({
            from: userAddress,
            amount: TonWeb.utils.toNano('0.05') // Gas fee
        });
        
        console.log('User permissions update successful:', result);
        return result;
    } catch (error) {
        console.error('User permissions update failed:', error);
        throw error;
    }
}

// Admin Log Functions
function addAdminLog(message) {
    const adminLog = document.getElementById('admin-log');
    if (adminLog) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'text-sm text-gray-300';
        logEntry.textContent = `[${timestamp}] ${message}`;
        adminLog.insertBefore(logEntry, adminLog.firstChild);
    }
}

// Transaction Monitor
function addTransaction(tx) {
    const transactionList = document.getElementById('transaction-list');
    const transactionMonitor = document.getElementById('transaction-monitor');
    
    if (transactionList) {
        const txEntry = document.createElement('div');
        txEntry.className = 'bg-gray-700 p-3 rounded text-sm';
        txEntry.innerHTML = `
            <div class="flex justify-between">
                <span>${shortenAddress(tx.from)} → ${shortenAddress(tx.to)}</span>
                <span class="text-purple-400">${tx.amount} MEHDI</span>
            </div>
            <div class="text-xs text-gray-400">${new Date().toLocaleTimeString()}</div>
        `;
        transactionList.insertBefore(txEntry, transactionList.firstChild);
    }
    
    if (transactionMonitor) {
        const txEntry = document.createElement('div');
        txEntry.className = 'bg-gray-700 p-3 rounded text-sm';
        txEntry.innerHTML = `
            <div class="flex justify-between">
                <span>${shortenAddress(tx.from)} → ${shortenAddress(tx.to)}</span>
                <span class="text-red-400">${tx.amount} MEHDI</span>
            </div>
            <div class="text-xs text-gray-400">${new Date().toLocaleTimeString()}</div>
        `;
        transactionMonitor.insertBefore(txEntry, transactionMonitor.firstChild);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Mehdi Jetton UI initialized');
    
    // Initialize TON Connect UI
    if (typeof TonConnectUI !== 'undefined') {
        window.tonConnectUI = new TonConnectUI({
            manifestUrl: 'http://localhost:3000/tonconnect-manifest.json',
            buttonRootId: 'connect-wallet'
        });
    }
    
    // Set deployed contract address
    contractAddress = 'EQAZpB3OQZgc3PnUKh4aTdGoi5sWUvzQF7tM3ckfn66cmoeZ';
    
    // Load initial data
    if (userAddress) {
        loadContractData();
        loadUserData();
    }
});