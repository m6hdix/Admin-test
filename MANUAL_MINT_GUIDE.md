# راهنمای مینت دستی جتون مهدی

اگر در زمان دیپلوی مقدار 1,000,000 جتون به کیف پول ادمین ارسال نشد، می‌توانید به صورت دستی این کار را انجام دهید.

## 🔧 مینت دستی بعد از دیپلوی

### مرحله 1: دریافت آدرس قرارداد
ابتدا آدرس قرارداد جتون را از خروجی دیپلوی کپی کنید یا از طریق تون اسکن پیدا کنید.

### مرحله 2: مینت دستی با اسکریپت

```typescript
// فایل: manual-mint.ts
import { toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { MehdiJetton } from './build/MehdiJetton/MehdiJetton_MehdiJetton';

export async function run(provider: NetworkProvider) {
    const adminAddress = provider.sender().address!!;
    const contractAddress = "آدرس_قرارداد_را_اینجا_بگذارید";
    
    const mehdiJetton = provider.open(
        MehdiJetton.fromAddress(contractAddress)
    );
    
    console.log('در حال مینت 1,000,000 جتون برای ادمین...');
    
    await mehdiJetton.send(
        provider.sender(),
        {
            value: toNano('0.3'),
        },
        {
            $$type: 'Mint',
            to: adminAddress,
            amount: toNano('1000000'),
            responseAddress: adminAddress
        }
    );
    
    console.log('تراکنش مینت ارسال شد!');
    
    // بررسی موجودی بعد از 10 ثانیه
    setTimeout(async () => {
        const balance = await mehdiJetton.getGetBalance(adminAddress);
        console.log(`موجودی جدید ادمین: ${(Number(balance) / 1e9).toLocaleString()} جتون`);
    }, 10000);
}
```

### مرحله 3: اجرای دستی
```bash
npx blueprint run manual-mint
```

## 📱 استفاده از کیف پول تلگرام

اگر از کیف پول تلگرام استفاده می‌کنید:

1. به قسمت "Send Transaction" بروید
2. آدرس قرارداد جتون را وارد کنید
3. مقدار 0.3 TON ارسال کنید
4. در بخش payload کد زیر را وارد کنید:

```
te6cckEBAQEAUQAAnaNbgCeADzw+E9GdskASzgViOvQuxkXXZKxiDsKqZiX3+OEPKPhuBxr9SY0AAQAeeHwnoztkgCWcCsR16F2Mi67JWMQdhVTMS+/xwh5R8ODNmX9L
```

## ⚠️ نکات مهم

1. **مقدار TON کافی**: مطمئن شوید کیف پول ادمین حداقل 0.3 TON دارد
2. **تایید تراکنش**: در کیف پول خود تراکنش را تایید کنید
3. **صبر برای تایید**: بعد از ارسال تراکنش، 10-30 ثانیه صبر کنید
4. **بررسی در تون اسکن**: وضعیت تراکنش را در https://testnet.tonscan.org بررسی کنید

## 🔍 بررسی وضعیت تراکنش

برای بررسی وضعیت تراکنش مینت:

1. به آدرس قرارداد در تون اسکن بروید
2. تب "Transactions" را بررسی کنید
3. تراکنش‌های موفق را پیدا کنید
4. اگر تراکنشی وجود ندارد، ممکن است کیف پول تراکنش را تایید نکرده باشد

## 💡 راه‌حل‌های متداول

### اگر تراکنش ناموفق بود:
1. **کیف پول را بررسی کنید**: مطمئن شوید تراکنش در کیف پول تایید شده
2. **مقدار TON را افزایش دهید**: از 0.3 TON استفاده کنید
3. **دوباره تلاش کنید**: ممکن است به دلیل شبکه نیاز به تلاش مجدد باشد
4. **از اسکریپت دستی استفاده کنید**: روش بالا را برای مینت دستی استفاده کنید

### اگر موجودی همچنان 0 است:
1. آدرس قرارداد را دوباره بررسی کنید
2. آدرس کیف پول ادمین را تایید کنید
3. صبر بیشتری داشته باشید (گاهی تا 1 دقیقه طول می‌کشد)