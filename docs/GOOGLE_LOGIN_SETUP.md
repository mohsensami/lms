# راه‌اندازی ورود و ثبت‌نام با گوگل — دامنه‌ی ezylearn.ir

## ۱) دامنه روی هاست
1. دامنه را در هاست/Vercel اضافه کنید (Vercel: Project → Settings → Domains → `ezylearn.ir`).
2. رکوردهای DNS را در پنل دامنه (nic.ir یا ثبت‌کننده‌ی دامنه) همان‌طور که هاست می‌گوید بسازید (Vercel: رکورد `A` برای `@` با مقدار `76.76.21.21` و رکورد `CNAME` برای `www` به `cname.vercel-dns.com`).
3. صبر کنید تا SSL (قفل https) فعال شود. گوگل فقط آدرس **https** را برای دامنه‌ی واقعی می‌پذیرد.

## ۲) ساخت پروژه در Google Cloud
1. https://console.cloud.google.com ← با جیمیل خودتان وارد شوید ← بالای صفحه «Select a project» ← **New Project** ← نام: `ezylearn` ← Create.

## ۳) صفحه‌ی رضایت (OAuth consent screen / Google Auth Platform)
1. منوی ☰ ← **APIs & Services** ← **OAuth consent screen** (یا Google Auth Platform ← Branding).
2. **User type: External** ← Create.
3. App name: `ایزی‌لرن` (یا EzyLearn)، User support email: ایمیل خودتان.
4. **Authorized domains**: `ezylearn.ir` را اضافه کنید.
5. Developer contact email را بزنید ← Save and continue.
6. Scopes: فقط `.../auth/userinfo.email` و `.../auth/userinfo.profile` و `openid` (پیش‌فرض‌ها) کافی است؛ چیز دیگری اضافه نکنید.
7. **Publish app** (وضعیت باید `In production` شود). اگر در حالت `Testing` بماند فقط «Test users» می‌توانند وارد شوند.

## ۴) ساخت Client ID
1. **APIs & Services ← Credentials ← Create credentials ← OAuth client ID**.
2. Application type: **Web application**، Name: `ezylearn-web`.
3. **Authorized JavaScript origins**:
   - `https://ezylearn.ir`
   - `https://www.ezylearn.ir` (اگر www هم استفاده می‌شود)
   - `http://localhost:3000` (برای تست محلی)
4. **Authorized redirect URIs** (باید دقیقاً همین‌ها باشد، بدون `/` آخر):
   - `https://ezylearn.ir/api/auth/callback/google`
   - `https://www.ezylearn.ir/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
5. Create ← **Client ID** و **Client secret** را کپی کنید.

## ۵) متغیرهای محیطی (روی هاست و فایل `.env`)
```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
AUTH_SECRET=<خروجی: openssl rand -base64 32>
AUTH_URL=https://ezylearn.ir
NEXTAUTH_URL=https://ezylearn.ir
NEXT_PUBLIC_SITE_URL=https://ezylearn.ir
# فقط اگر روی Vercel نیستید:
# AUTH_TRUST_HOST=true
```
بعد از ذخیره‌ی متغیرها، پروژه را **دوباره Deploy** کنید.

## ۶) تست
1. صفحه‌ی `https://ezylearn.ir/login` ← «ورود با گوگل» ← حساب گوگل را انتخاب کنید.
2. بار اول، یک کاربر «دانشجو» با نام و **عکس جیمیل** ساخته می‌شود و عکس در هدر سایت و در حساب کاربری نمایش داده می‌شود.
3. اگر کاربری قبلاً با ایمیل/رمز ثبت‌نام کرده و عکس ندارد، با اولین ورود با گوگل عکسش از گوگل پر می‌شود (عکسی که خودش آپلود کرده هیچ‌وقت عوض نمی‌شود).

## خطاهای رایج
- `redirect_uri_mismatch`: آدرس در مرحله‌ی ۴ با آدرسی که سایت استفاده می‌کند (www / بدون www / http / https) یکی نیست.
- `access_denied` / «This app isn't verified»: برنامه هنوز Testing است (مرحله‌ی ۳-۷) یا ایمیل در Test users نیست.
- بعد از ورود دوباره به صفحه‌ی login برمی‌گردد: `AUTH_SECRET` یا `AUTH_URL` تنظیم نشده یا بعد از تنظیم، Deploy مجدد انجام نشده.
