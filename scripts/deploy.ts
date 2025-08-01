import { toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { MehdiJetton } from '../build/MehdiJetton/MehdiJetton_MehdiJetton';

export async function run(provider: NetworkProvider) {
    const mehdiJetton = provider.open(await MehdiJetton.fromInit(provider.sender().address!!));
    
    await mehdiJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(mehdiJetton.address);

    // Initialize with some tokens for testing
    console.log('Deploying MehdiJetton...');
    console.log('Contract address:', mehdiJetton.address.toString());
    console.log('Admin address:', provider.sender().address?.toString());
    
    // Mint initial tokens to admin
    await mehdiJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Mint',
            to: provider.sender().address!!,
            amount: toNano('1000000'), // 1M tokens
            responseAddress: provider.sender().address!!
        }
    );
    
    console.log('Minted 1M Mehdi Jetton tokens to admin');
}