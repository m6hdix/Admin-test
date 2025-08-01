import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, beginCell } from '@ton/core';
import { MehdiJetton } from '../build/MehdiJetton/MehdiJetton_MehdiJetton';
import '@ton/test-utils';

describe('MehdiJetton', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let user1: SandboxContract<TreasuryContract>;
    let user2: SandboxContract<TreasuryContract>;
    let mehdiJetton: SandboxContract<MehdiJetton>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        user1 = await blockchain.treasury('user1');
        user2 = await blockchain.treasury('user2');

        mehdiJetton = blockchain.openContract(await MehdiJetton.fromInit(deployer.address));

        const deployResult = await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mehdiJetton.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy successfully', async () => {
        const jettonData = await mehdiJetton.getGetJettonData();
        expect(jettonData.totalSupply).toBe(0n);
        expect(jettonData.adminAddress).toEqualAddress(deployer.address);
        expect(jettonData.transferEnabled).toBe(true);
        expect(jettonData.feePercentage).toBe(2n);
        expect(jettonData.feeCollector).toEqualAddress(deployer.address);
    });

    it('should calculate fees correctly', async () => {
        // Test with default 2% fee
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('1000'),
                responseAddress: deployer.address
            }
        );

        // Test fee calculation
        const amount = toNano('100');
        const expectedFee = (amount * 2n) / 100n; // 2% of 100 = 2
        
        // Transfer and check fee calculation
        const transferResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Transfer',
                to: user2.address,
                amount: amount,
                responseAddress: user1.address
            }
        );

        expect(transferResult.transactions).toHaveTransaction({
            success: true,
        });

        const user1Balance = await mehdiJetton.getGetBalance(user1.address);
        const deployerBalance = await mehdiJetton.getGetBalance(deployer.address);
        
        expect(user1Balance).toBe(toNano('900')); // 1000 - 100 (transfer amount)
    });

    it('should allow admin to toggle transfers', async () => {
        // Initially transfers should be enabled
        let jettonData = await mehdiJetton.getGetJettonData();
        expect(jettonData.transferEnabled).toBe(true);

        // Disable transfers
        const toggleResult = await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ToggleTransfers',
                enabled: false,
            }
        );

        expect(toggleResult.transactions).toHaveTransaction({
            success: true,
        });

        jettonData = await mehdiJetton.getGetJettonData();
        expect(jettonData.transferEnabled).toBe(false);

        // Try to transfer when disabled - should fail
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('1000'),
                responseAddress: deployer.address
            }
        );

        const transferResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Transfer',
                to: user2.address,
                amount: toNano('100'),
                responseAddress: user1.address
            }
        );

        expect(transferResult.transactions).toHaveTransaction({
            success: false,
        });
    });

    it('should allow admin to set user permissions', async () => {
        // Set user permissions
        const permissionResult = await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetUserPermissions',
                user: user1.address,
                canTransfer: false,
                isWhitelisted: true,
                customFee: 5n,
            }
        );

        expect(permissionResult.transactions).toHaveTransaction({
            success: true,
        });

        const userPermissions = await mehdiJetton.getGetUserPermissions(user1.address);
        expect(userPermissions.canTransfer).toBe(false);
        expect(userPermissions.isWhitelisted).toBe(true);
        expect(userPermissions.customFee).toBe(5n);
    });

    it('should apply whitelisted user fee exemption', async () => {
        // Mint tokens to user1
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('1000'),
                responseAddress: deployer.address
            }
        );

        // Whitelist user1
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetUserPermissions',
                user: user1.address,
                canTransfer: true,
                isWhitelisted: true,
                customFee: 0n,
            }
        );

        // Transfer should have no fee
        await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Transfer',
                to: user2.address,
                amount: toNano('100'),
                responseAddress: user1.address
            }
        );

        const user1Balance = await mehdiJetton.getGetBalance(user1.address);
        expect(user1Balance).toBe(toNano('900')); // 1000 - 100 = 900 (no fee)
    });

    it('should allow admin to change fee percentage', async () => {
        const newFee = 5n;
        
        const feeResult = await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetFee',
                feePercentage: newFee,
            }
        );

        expect(feeResult.transactions).toHaveTransaction({
            success: true,
        });

        const jettonData = await mehdiJetton.getGetJettonData();
        expect(jettonData.feePercentage).toBe(newFee);
    });

    it('should prevent non-admin from admin functions', async () => {
        // Try to change admin as non-admin
        const adminResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeAdmin',
                newAdmin: user1.address,
            }
        );

        expect(adminResult.transactions).toHaveTransaction({
            success: false,
        });

        // Try to toggle transfers as non-admin
        const toggleResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ToggleTransfers',
                enabled: false,
            }
        );

        expect(toggleResult.transactions).toHaveTransaction({
            success: false,
        });

        // Try to mint as non-admin
        const mintResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('1000'),
                responseAddress: user1.address
            }
        );

        expect(mintResult.transactions).toHaveTransaction({
            success: false,
        });
    });

    it('should handle token transfers correctly', async () => {
        // Mint tokens to user1
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('1000'),
                responseAddress: deployer.address
            }
        );

        // Transfer from user1 to user2
        await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Transfer',
                to: user2.address,
                amount: toNano('100'),
                responseAddress: user1.address
            }
        );

        const user1Balance = await mehdiJetton.getGetBalance(user1.address);
        const user2Balance = await mehdiJetton.getGetBalance(user2.address);
        const deployerBalance = await mehdiJetton.getGetBalance(deployer.address);

        expect(user1Balance).toBe(toNano('900')); // 1000 - 100 (transfer amount)
        expect(user2Balance).toBe(toNano('98')); // 100 - 2 (fee)
        expect(deployerBalance).toBe(toNano('2')); // 2 (fee)
    });

    it('should handle insufficient balance transfers', async () => {
        // Mint small amount to user1
        await mehdiJetton.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                to: user1.address,
                amount: toNano('50'),
                responseAddress: deployer.address
            }
        );

        // Try to transfer more than balance
        const transferResult = await mehdiJetton.send(
            user1.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Transfer',
                to: user2.address,
                amount: toNano('100'),
                responseAddress: user1.address
            }
        );

        expect(transferResult.transactions).toHaveTransaction({
            success: false,
        });
    });
});