import { toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { MehdiJetton } from '../build/MehdiJetton/MehdiJetton_MehdiJetton';

export async function run(provider: NetworkProvider) {
    const adminAddress = provider.sender().address!!;
    const mehdiJetton = provider.open(await MehdiJetton.fromInit(adminAddress));
    
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

    // Mint 1 million jettons to admin
    await mehdiJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Mint',
            to: adminAddress,
            amount: toNano('1000000'), // 1M jettons
            responseAddress: adminAddress
        }
    );

    // Get jetton information
     const jettonData = await mehdiJetton.getGetJettonData();

    console.log('🚀 جتون مهدی با موفقیت دیپلوی شد!');
      console.log('=====================================');
      console.log(`📋 اطلاعات جتون:`);
      console.log(`نام: Mehdi Jetton`);
      console.log(`نماد: MEHDI`);
      console.log(`توضیحات: جتون مهدی - توکن رسمی پروژه مهدی با قابلیت انتقال و مدیریت کارمزد`);
      console.log(`تعداد اعشار: 9`);
      console.log(`عرضه کل: ${(Number(jettonData.totalSupply) / 1e9).toLocaleString()} جتون`);
      console.log(`آدرس قرارداد: ${mehdiJetton.address.toString()}`);
      console.log(`آدرس ادمین: ${adminAddress.toString()}`);
      console.log('=====================================');
      console.log('✅ 1,000,000 جتون به آدرس ادمین ارسال شد');
      console.log('💡 حالا میتوانید جتون را به کیف پول TON خود اضافه کنید');
}