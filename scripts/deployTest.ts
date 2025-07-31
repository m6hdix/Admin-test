import { toNano } from '@ton/core';
import { Test } from '../build/Test/Test_Test';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const test = provider.open(await Test.fromInit(BigInt(Math.floor(Math.random() * 10000)), 0n));

    await test.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(test.address);

    console.log('ID', await test.getId());
}
