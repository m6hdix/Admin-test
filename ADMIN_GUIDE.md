# راهنمای مدیریت جتون مهدی

این راهنما نحوه مدیریت جتون مهدی و کنترل معاملات کاربران را توضیح می‌دهد.

## ✅ قابلیت‌های مدیریتی جتون

### 1. **مینت توکن (ساخت توکن جدید)**
- فقط ادمین می‌تواند توکن جدید بسازد
- توکن‌های ساخته شده به کیف پول ادمین ارسال می‌شوند
- مقدار پیش‌فرض: 1,000,000 توکن در زمان دیپلوی

### 2. **کنترل کلی انتقال توکن**
- امکان خاموش کردن تمام انتقال‌ها بین کاربران
- با خاموش کردن، هیچ کاربری نمی‌تواند توکن را انتقال دهد

### 3. **کنترل فردی کاربران**
- امکان تعیین مجوز انتقال برای هر کاربر به صورت جداگانه
- امکان قرار دادن کاربران در لیست سفید (بدون کارمزد)
- امکان تعیین کارمزد خاص برای هر کاربر

## 🎯 نحوه استفاده از کنترل‌ها

### خاموش کردن تمام انتقال‌ها:
```typescript
await mehdiJetton.send(
    provider.sender(),
    { value: toNano('0.05') },
    {
        $$type: 'ToggleTransfers',
        enabled: false  // false = غیرفعال کردن انتقال‌ها
    }
);
```

### روشن کردن انتقال‌ها:
```typescript
await mehdiJetton.send(
    provider.sender(),
    { value: toNano('0.05') },
    {
        $$type: 'ToggleTransfers',
        enabled: true  // true = فعال کردن انتقال‌ها
    }
);
```

### مدیریت کاربر خاص:
```typescript
// غیرفعال کردن انتقال برای کاربر خاص
await mehdiJetton.send(
    provider.sender(),
    { value: toNano('0.05') },
    {
        $$type: 'SetUserPermissions',
        user: "آدرس_کیف_پول_کاربر",
        canTransfer: false,  // غیرفعال کردن انتقال برای این کاربر
        isWhitelisted: false,
        customFee: 0
    }
);

// قرار دادن کاربر در لیست سفید (بدون کارمزد)
await mehdiJetton.send(
    provider.sender(),
    { value: toNano('0.05') },
    {
        $$type: 'SetUserPermissions',
        user: "آدرس_کیف_پول_کاربر",
        canTransfer: true,
        isWhitelisted: true,  // بدون کارمزد
        customFee: 0
    }
);
```

## 🔍 بررسی وضعیت

### بررسی وضعیت انتقال‌ها:
```typescript
const jettonData = await mehdiJetton.getGetJettonData();
console.log('وضعیت انتقال‌ها:', jettonData.transferEnabled);
```

### بررسی مجوز کاربر:
```typescript
const userPermissions = await mehdiJetton.getGetUserPermissions("آدرس_کاربر");
console.log('مجوز انتقال:', userPermissions.canTransfer);
console.log('لیست سفید:', userPermissions.isWhitelisted);
```

## ⚡ سریع‌ترین راه برای جلوگیری از معاملات

برای سریع‌ترین جلوگیری از تمام معاملات بین کاربران:

1. **روش سریع**: خاموش کردن تمام انتقال‌ها با `ToggleTransfers(false)`
2. **روش دقیق**: غیرفعال کردن انتقال برای کاربران خاص با `SetUserPermissions`

## 📋 نکات مهم

- فقط ادمین اصلی می‌تواند این تنظیمات را تغییر دهد
- تمام تراکنش‌ها نیاز به مقدار TON برای کارمزد شبکه دارند
- تغییرات فوراً اعمال می‌شوند
- کاربران می‌توانند توکن‌های خود را نگه دارند ولی نمی‌توانند انتقال دهند