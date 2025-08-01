import "@stdlib/deploy";
import "@stdlib/ownable";

struct JettonData {
    totalSupply: Int as coins;
    adminAddress: Address;
    transferEnabled: Bool;
    feePercentage: Int as uint8; // 0-100
    feeCollector: Address;
}

struct UserPermissions {
    canTransfer: Bool;
    isWhitelisted: Bool;
    customFee: Int as uint8; // 0 means use global fee
}

message(0x0f8a7ea5) TransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    payload: Slice as remaining;
}

message(0x178d4519) InternalTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    responseAddress: Address;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0x7362d09c) Excesses {
    queryId: Int as uint64;
}

message ChangeAdmin {
    newAdmin: Address;
}

message ToggleTransfers {
    enabled: Bool;
}

message SetFee {
    feePercentage: Int as uint8;
}

message SetFeeCollector {
    newCollector: Address;
}

message SetUserPermissions {
    user: Address;
    canTransfer: Bool;
    isWhitelisted: Bool;
    customFee: Int as uint8;
}

message Mint {
    to: Address;
    amount: Int as coins;
    responseAddress: Address;
}

message(0x12345678) Transfer {
    to: Address;
    amount: Int as coins;
    responseAddress: Address;
}

contract MehdiJetton with Deployable {
    
    totalSupply: Int as coins = 0;
    adminAddress: Address;
    transferEnabled: Bool = true;
    feePercentage: Int as uint8 = 2; // 2% default fee
    feeCollector: Address;
    
    // User permissions mapping
    userPermissions: map<Address, UserPermissions>;
    
    // User balances
    balances: map<Address, Int as coins>;
    

    
    init(owner: Address) {
        self.adminAddress = owner;
        self.feeCollector = owner;
    }
    
    // Calculate fee based on amount and user permissions
    fun calculateFee(amount: Int, user: Address): Int {
        let userOpt = self.userPermissions.get(user);
        let feeRate = self.feePercentage;
        
        if (userOpt != null) {
            let userPerm = userOpt!!;
            if (userPerm.isWhitelisted) {
                return 0; // No fee for whitelisted users
            }
            if (userPerm.customFee > 0) {
                feeRate = userPerm.customFee;
            }
        }
        
        return (amount * feeRate) / 100;
    }
    
    // Get user balance
    get fun getBalance(user: Address): Int {
        let balance = self.balances.get(user);
        if (balance != null) {
            return balance!!;
        }
        return 0;
    }
    
    // Get jetton info
    get fun getJettonData(): JettonData {
        return JettonData{
            totalSupply: self.totalSupply,
            adminAddress: self.adminAddress,
            transferEnabled: self.transferEnabled,
            feePercentage: self.feePercentage,
            feeCollector: self.feeCollector
        };
    }
    
    // Get user permissions
    get fun getUserPermissions(user: Address): UserPermissions {
        let opt = self.userPermissions.get(user);
        if (opt != null) {
            return opt!!;
        }
        return UserPermissions{
            canTransfer: true,
            isWhitelisted: false,
            customFee: 0
        };
    }
    
    // Admin functions
    receive(msg: ChangeAdmin) {
        require(sender() == self.adminAddress, "Only admin can change admin");
        let oldAdmin = self.adminAddress;
        self.adminAddress = msg.newAdmin;

    }
    
    receive(msg: ToggleTransfers) {
        require(sender() == self.adminAddress, "Only admin can toggle transfers");
        self.transferEnabled = msg.enabled;

    }
    
    receive(msg: SetFee) {
        require(sender() == self.adminAddress, "Only admin can set fee");
        require(msg.feePercentage <= 10, "Fee too high (max 10%)");
        self.feePercentage = msg.feePercentage;

    }
    
    receive(msg: SetFeeCollector) {
        require(sender() == self.adminAddress, "Only admin can set fee collector");
        self.feeCollector = msg.newCollector;
    }
    
    receive(msg: SetUserPermissions) {
        require(sender() == self.adminAddress, "Only admin can set user permissions");
        self.userPermissions.set(msg.user, UserPermissions{
            canTransfer: msg.canTransfer,
            isWhitelisted: msg.isWhitelisted,
            customFee: msg.customFee
        });

    }
    
    // Mint new jettons (admin only)
    receive(msg: Mint) {
        require(sender() == self.adminAddress, "Only admin can mint jettons");
        
        self.totalSupply = self.totalSupply + msg.amount;
        let currentBalanceOpt = self.balances.get(msg.to);
        let currentBalance = 0;
        if (currentBalanceOpt != null) {
            currentBalance = currentBalanceOpt!!;
        }
        self.balances.set(msg.to, currentBalance + msg.amount);
        

        
        // Send notification to recipient
        send(SendParameters{
            to: msg.to,
            value: 0,
            mode: SendRemainingValue,
            body: TransferNotification{
                queryId: 0,
                amount: msg.amount,
                sender: myAddress(),
                payload: emptySlice()
            }.toCell()
        });
    }
    
    // Internal transfer function
    fun internalTransfer(from: Address, to: Address, amount: Int) {
        require(self.transferEnabled, "Transfers are disabled");
        
        let userPerm = self.userPermissions.get(from);
        if (userPerm != null && !userPerm!!.canTransfer) {
            throw(403);
        }
        
        let fromBalanceOpt = self.balances.get(from);
        let fromBalance = 0;
        if (fromBalanceOpt != null) {
            fromBalance = fromBalanceOpt!!;
        }
        require(fromBalance >= amount, "Insufficient balance");
        
        let fee = self.calculateFee(amount, from);
        let netAmount = amount - fee;
        
        // Update balances
        self.balances.set(from, fromBalance - amount);
        
        let toBalanceOpt = self.balances.get(to);
        let toBalance = 0;
        if (toBalanceOpt != null) {
            toBalance = toBalanceOpt!!;
        }
        self.balances.set(to, toBalance + netAmount);
        
        // Send fee to collector
        if (fee > 0) {
            let collectorBalanceOpt = self.balances.get(self.feeCollector);
            let collectorBalance = 0;
            if (collectorBalanceOpt != null) {
                collectorBalance = collectorBalanceOpt!!;
            }
            self.balances.set(self.feeCollector, collectorBalance + fee);
        }

    }
    
    // Receive internal transfer messages
    receive(msg: InternalTransfer) {
        self.internalTransfer(msg.from, myAddress(), msg.amount);
    }
    
    // Transfer jettons between users
    receive(msg: Transfer) {
        self.internalTransfer(sender(), msg.to, msg.amount);
        
        // Send notification to recipient
        send(SendParameters{
            to: msg.to,
            value: 0,
            mode: SendRemainingValue,
            body: TransferNotification{
                queryId: 0,
                amount: msg.amount,
                sender: sender(),
                payload: emptySlice()
            }.toCell()
        });
    }
    
    // Default receiver for external messages
    receive() {
        // Handle external messages if needed
    }
    
    // Bounce handler
    receive(msg: Excesses) {
        // Handle excesses
    }
}