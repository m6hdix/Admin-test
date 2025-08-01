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
    console.log('در حال ارسال 1,000,000 جتون به آدرس ادمین...');
    
    try {
        const mintResult = await mehdiJetton.send(
            provider.sender(),
            {
                value: toNano('0.3'), // افزایش مقدار برای اطمینان از موفقیت تراکنش
            },
            {
                $$type: 'Mint',
                to: adminAddress,
                amount: toNano('1000000'), // 1M jettons
                responseAddress: adminAddress
            }
        );
        console.log('تراکنش مینت ارسال شد');
        
        // Wait longer for transaction to be processed
        console.log('در حال انتظار برای تایید تراکنش مینت...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('خطا در ارسال تراکنش مینت:', error);
    }

    // Check balances after minting
    console.log('در حال بررسی موجودی...');
    
    // Get jetton information
    const jettonData = await mehdiJetton.getGetJettonData();
    const adminBalance = await mehdiJetton.getGetBalance(adminAddress);

    if (Number(adminBalance) === 0) {
        console.warn('⚠️ هشدار: موجودی ادمین همچنان 0 است. تراکنش مینت ممکن است موفق نبوده باشد.');
    }

    console.log('🚀 جتون مهدی با موفقیت دیپلوی شد!');
    console.log('=====================================');
    console.log(`📋 اطلاعات جتون:`);
    console.log(`نام: Mehdi Jetton`);
    console.log(`نماد: MEHDI`);
    console.log(`توضیحات: جتون مهدی - توکن رسمی پروژه مهدی با قابلیت انتقال و مدیریت کارمزد`);
    console.log(`تعداد اعشار: 9`);
    console.log(`عرضه کل: ${(Number(jettonData.totalSupply) / 1e9).toLocaleString()} جتون`);
    console.log(`موجودی ادمین: ${(Number(adminBalance) / 1e9).toLocaleString()} جتون`);
    console.log(`آدرس قرارداد: ${mehdiJetton.address.toString()}`);
    console.log(`آدرس ادمین: ${adminAddress.toString()}`);
    console.log('=====================================');
    
    if (Number(adminBalance) > 0) {
        console.log(`✅ ${(Number(adminBalance) / 1e9).toLocaleString()} جتون به آدرس ادمین ارسال شد`);
    } else {
        console.log('❌ تراکنش مینت انجام نشد. لطفاً دوباره تلاش کنید یا کیف پول را بررسی کنید.');
    }
    console.log('💡 حالا میتوانید جتون را به کیف پول TON خود اضافه کنید');
    console.log('');
    console.log('📱 برای اضافه کردن جتون به کیف پول:');
    console.log(`آدرس قرارداد: ${mehdiJetton.address.toString()}`);
    console.log(`نماد: MEHDI`);
    console.log(`تعداد اعشار: 9`);
}