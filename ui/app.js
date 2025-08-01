// TON Web setup
let tonweb;
let contract;
let walletConnection;
let userAddress;
let contractAddress = null; // Will be set after deployment

// Initialize TON Web
try {
    tonweb = new TonWeb();
} catch (e) {
    console.warn('TON Web not available, running in demo mode');
}

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
                
                // Load initial data
                await loadContractData();
                await loadUserData();
            }
        } else {
            // Fallback for demo
            userAddress = 'UQDemoAddress123456789';
            walletAddressSpan.textContent = shortenAddress(userAddress);
            walletInfo.classList.remove('hidden');
            connectWalletBtn.classList.add('hidden');
            if (dashboard) dashboard.classList.remove('hidden');
            
            // Load demo data
            loadDemoData();
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

function disconnectWallet() {
    userAddress = null;
    walletInfo.classList.add('hidden');
    connectWalletBtn.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    
    if (window.tonConnectUI) {
        window.tonConnectUI.disconnect();
    }
}

function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// Contract Data Loading
async function loadContractData() {
    if (!contractAddress) {
        console.warn('Contract address not set');
        return;
    }
    
    try {
        // This would be actual contract calls in production
        const data = await getContractData();
        
        // Update UI
        updateContractUI(data);
    } catch (error) {
        console.error('Failed to load contract data:', error);
    }
}

async function loadUserData() {
    if (!userAddress || !contractAddress) return;
    
    try {
        const balance = await getUserBalance(userAddress);
        document.getElementById('user-balance').textContent = formatAmount(balance);
        
        const permissions = await getUserPermissions(userAddress);
        updatePermissionsUI(permissions);
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Demo Data Functions
function loadDemoData() {
    const demoData = {
        totalSupply: '1000000',
        transferEnabled: true,
        feePercentage: 2,
        feeCollector: 'UQCollector123456789'
    };
    
    updateContractUI(demoData);
    document.getElementById('user-balance').textContent = '1000';
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
            await transferTokens(recipient, amount);
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
            await mintTokens(recipient, amount);
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

// Mock Contract Functions (Replace with actual contract calls)
async function getContractData() {
    // This would be actual contract calls
    return {
        totalSupply: '1000000',
        transferEnabled: true,
        feePercentage: 2,
        feeCollector: 'UQCollector123456789'
    };
}

async function getUserBalance(address) {
    // This would be actual contract calls
    return '1000';
}

async function getUserPermissions(address) {
    // This would be actual contract calls
    return {
        canTransfer: true,
        isWhitelisted: false,
        customFee: 0
    };
}

async function transferTokens(recipient, amount) {
    // This would be actual contract calls
    console.log(`Transferring ${amount} MEHDI to ${recipient}`);
    return { success: true };
}

async function mintTokens(recipient, amount) {
    // This would be actual contract calls
    console.log(`Minting ${amount} MEHDI to ${recipient}`);
    return { success: true };
}

async function setFee(newFee) {
    // This would be actual contract calls
    console.log(`Setting fee to ${newFee}%`);
    return { success: true };
}

async function toggleTransfers() {
    // This would be actual contract calls
    console.log('Toggling transfers');
    return { success: true };
}

async function getTransferStatus() {
    // This would be actual contract calls
    return true;
}

async function setFeeCollector(newCollector) {
    // This would be actual contract calls
    console.log(`Setting fee collector to ${newCollector}`);
    return { success: true };
}

async function setUserPermissions(userAddress, canTransfer, isWhitelisted, customFee) {
    // This would be actual contract calls
    console.log(`Setting permissions for ${userAddress}: transfer=${canTransfer}, whitelisted=${isWhitelisted}, customFee=${customFee}`);
    return { success: true };
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
            manifestUrl: 'https://your-domain.com/tonconnect-manifest.json',
            buttonRootId: 'connect-wallet'
        });
    }
    
    // Load initial data
    if (userAddress) {
        loadContractData();
        loadUserData();
    }
});