// Everything about the site's identity and static content that the admin can
// edit in Settings. The DEFAULTS below are exactly what used to be hard-coded
// in the components, so until the admin changes something the site looks the
// same as before.
//
// Isomorphic on purpose (no secrets, no DB): the settings forms use it for
// their initial shape and the server uses it to validate what gets saved.

export const DEFAULT_SITE_SETTINGS = {
    general: {
        name: 'آکادمی آموزشی',
        tagline: 'آموزش متلب',
        description: 'بهترین آموزشگاه',
        keywords: '',
        logoUrl: '',
        faviconUrl: '',
        ogImageUrl: '',
    },

    header: {
        links: [
            { title: 'صفحه نخست', href: '/' },
            { title: 'درباره ما', href: '/about-us' },
            { title: 'وبلاگ', href: '/blog' },
            { title: 'تماس با ما', href: '/contact-us' },
        ],
    },

    footer: {
        about: 'پلتفرم آموزش آنلاین برای یادگیری مهارت‌های واقعی برنامه‌نویسی و ورود سریع‌تر به بازار کار.',
        copyright: 'تمامی حقوق محفوظ است.',
        links: [
            { title: 'صفحه نخست', href: '/' },
            { title: 'درباره ما', href: '/about-us' },
            { title: 'وبلاگ', href: '/blog' },
            { title: 'تماس با ما', href: '/contact-us' },
        ],
        showCredit: true,
        creditLabel: 'طراحی سایت',
        creditLabelUrl: 'https://greendata.ir/order',
        creditName: 'greendata',
        creditNameUrl: 'https://greendata.ir',
    },

    social: {
        instagram: '',
        telegram: '',
        youtube: '',
        aparat: '',
        bale: '',
        eitaa: '',
        whatsapp: '',
        linkedin: '',
    },

    contact: {
        badge: 'در تماس باشید',
        title: 'چطور می‌تونیم کمکتون کنیم؟',
        intro: 'سوالی دارید، پیشنهادی دارید یا نیاز به پشتیبانی دارید؟ فرم زیر رو پر کنید یا از راه‌های زیر مستقیم با ما در ارتباط باشید. معمولاً کمتر از ۲۴ ساعت پاسخ می‌دیم.',
        phone: '۰۲۱-۱۲۳۴۵۶۷۸',
        email: 'support@example.com',
        address: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
        mapUrl: '',
        hoursTitle: 'ساعات پاسخگویی',
        hours: [
            { label: 'شنبه تا چهارشنبه', value: '۹ الی ۱۸' },
            { label: 'پنجشنبه', value: '۹ الی ۱۳' },
            { label: 'جمعه و تعطیلات', value: 'تعطیل' },
        ],
        chatTitle: 'چت آنلاین',
        chatText: 'برای پاسخ سریع‌تر می‌تونید از طریق پیج اینستاگرام هم پیام بدید.',
        chatButton: 'پیج اینستاگرام ما',
        chatUrl: '',
    },

    home: {
        badge: '🎓 یادگیری حرفه‌ای آنلاین',
        title: 'مهارت‌های جدید یاد بگیر،',
        highlight: 'آینده‌تو بساز',
        subtitle:
            'به بهترین دوره ویدیویی دسترسی داشته باش و از سطح مبتدی تا پیشرفته رشد کن. مناسب برنامه‌نویسی، طراحی، بیزینس و بیشتر.',
        buttonText: 'شروع یادگیری',
        buttonHref: '/courses',
        showStats: true,
        stats: [
            { value: '1200', label: 'دیدگاه' },
            { value: '85', label: 'دانشجو' },
            { value: '4.5', label: 'رضایت' },
        ],
        previewImageUrl: 'https://oompg81ca6.ufs.sh/f/a9eZat1sZEl6sGdvMwCnWRf4OPYloe6JZST3m81z2ihtVrwk',
        previewCaption: 'پیش‌نمایش دوره: آموزش متلب از صفر تا پیشرفته',
        floatLabel: '🔥 محبوب‌ترین دوره',
        floatTitle: 'آموزش متلب',
        coursesTitle: 'دوره‌ها',
        showPosts: true,
        postsTitle: 'آخرین مقالات',
    },

    about: {
        badge: 'درباره ما',
        title: 'یادگیری رو ساده‌تر، عملی‌تر و لذت‌بخش‌تر می‌کنیم',
        intro: 'ما یه تیم کوچیک از برنامه‌نویس‌ها و مدرس‌هایی هستیم که باور داریم هرکسی می‌تونه با آموزش درست و پشتیبانی مناسب، مهارت‌های حرفه‌ای یاد بگیره و مسیر شغلی خودش رو بسازه.',
        stats: [
            { value: '۱۲,۰۰۰+', label: 'دانشجو' },
            { value: '۸۰+', label: 'دوره آموزشی' },
            { value: '۲۵+', label: 'مدرس متخصص' },
            { value: '۹+', label: 'سال تجربه' },
        ],
        storyTitle: 'داستان ما از کجا شروع شد',
        storyP1:
            'همه‌چیز از یه سوال ساده شروع شد: چرا خیلی‌ها بعد از گذروندن چندین دوره آموزشی هنوز نمی‌تونن یه پروژه واقعی رو از صفر بسازن؟ ما تصمیم گرفتیم دوره‌هایی بسازیم که به‌جای حجم زیاد تئوری، روی ساخت پروژه‌های واقعی و کاربردی تمرکز دارن.',
        storyP2:
            'امروز با کمک ده‌ها مدرس متخصص، هزاران دانشجو تونستن مهارت‌های جدید یاد بگیرن، وارد بازار کار بشن یا کسب‌وکار خودشون رو راه بندازن.',
        storyImageUrl: 'https://picsum.photos/600/400',
        valuesTitle: 'چرا ما رو انتخاب کنید؟',
        valuesSubtitle: 'اصولی که هیچ‌وقت ازشون عقب‌نشینی نمی‌کنیم',
        values: [
            {
                title: 'یادگیری عملی و پروژه‌محور',
                desc: 'دوره‌ها با تمرکز روی پروژه‌های واقعی طراحی شدن تا مهارت واقعی بگیرید، نه فقط تئوری.',
            },
            {
                title: 'کیفیت تضمین‌شده',
                desc: 'محتوای هر دوره قبل از انتشار چندین بار بازبینی و به‌روزرسانی می‌شه.',
            },
            {
                title: 'پشتیبانی همیشگی',
                desc: 'تیم پشتیبانی و مدرسین همیشه برای پاسخ به سوالات شما در دسترس هستن.',
            },
            {
                title: 'مسیر شغلی مشخص',
                desc: 'هر دوره بخشی از یک مسیر یادگیری بزرگ‌تره که شما رو به یه هدف شغلی می‌رسونه.',
            },
        ],
        ctaTitle: 'آماده‌ای شروع کنی؟',
        ctaText: 'همین حالا سری به دوره‌های ما بزن و مسیر یادگیریت رو با انتخاب دوره مناسب شروع کن.',
        ctaButton: 'مشاهده دوره‌ها',
    },

    email: {
        welcomeEnabled: true,
        welcomeSubject: 'به {siteName} خوش آمدید 🎓',
        welcomeText: 'ثبت‌نام شما با موفقیت انجام شد. از حالا می‌توانید دوره‌ها را ببینید و یادگیری را شروع کنید.',
        contactEnabled: true,
        contactSubject: 'پیام شما به {siteName} دریافت شد',
        contactText: 'پیام شما را دریافت کردیم و در اسرع وقت (معمولاً کمتر از ۲۴ ساعت) پاسخ می‌دهیم.',
        purchaseEnabled: true,
        purchaseSubject: 'ثبت‌نام شما در دوره «{courseTitle}» انجام شد',
        purchaseText:
            'پرداخت شما با موفقیت انجام شد و دسترسی شما به همه‌ی درس‌های این دوره فعال است. فهرست کامل درس‌ها را پایین همین ایمیل می‌بینید.',
        signature: 'با آرزوی موفقیت، تیم {siteName}',
        adminNotifyEnabled: false,
        adminEmail: '',
    },

    guarantee: {
        enabled: true,
        headline: 'بدون هیچ ریسکی امتحان کنید',
        title: '۳۰ روز ضمانت بازگشت وجه',
        text: 'اگر ظرف ۳۰ روز اول تشخیص دادید این دوره مناسب شما نیست، می‌توانید هر زمان درخواست بازگشت وجه بدهید.',
    },
};

export const SITE_SECTIONS = Object.keys(DEFAULT_SITE_SETTINGS);

// ------------------------------------------------------------------ sanitizing

const URL_KEY = /(url|href)$/i;
const LONG_KEYS = new Set([
    'description',
    'subtitle',
    'about',
    'intro',
    'storyP1',
    'storyP2',
    'text',
    'chatText',
    'desc',
    'keywords',
]);
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i;
const MAX_ITEMS = 30;

function cleanString(key, input, fallback) {
    if (typeof input !== 'string') return fallback;
    const max = URL_KEY.test(key) ? 600 : LONG_KEYS.has(key) || /(Text|Intro)$/.test(key) ? 1500 : 200;
    const value = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
    if (URL_KEY.test(key) && value && !SAFE_URL.test(value)) return '';
    return value;
}

/**
 * Shapes `input` like `template`: unknown keys are dropped, wrong types fall
 * back to the template, strings are trimmed/limited, URLs must use a safe
 * scheme (no `javascript:`), lists are capped. Used both when saving and when
 * reading, so a bad stored value can never reach the page.
 */
export function sanitizeLike(template, input, key = '') {
    if (Array.isArray(template)) {
        if (!Array.isArray(input)) return template;
        const item = template[0];
        const result = input.slice(0, MAX_ITEMS).map((el) =>
            item && typeof item === 'object' ? sanitizeLike(item, el) : cleanString(key, el, ''),
        );
        // Drop rows the admin left completely empty.
        return result.filter((el) =>
            typeof el === 'object' ? Object.values(el).some((v) => typeof v === 'string' && v) : Boolean(el),
        );
    }

    if (template && typeof template === 'object') {
        const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
        return Object.fromEntries(Object.keys(template).map((k) => [k, sanitizeLike(template[k], source[k], k)]));
    }

    if (typeof template === 'boolean') {
        return typeof input === 'boolean' ? input : template;
    }

    return cleanString(key, input, template);
}

export function sanitizeSiteSection(section, input) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_SITE_SETTINGS, section)) return null;
    return sanitizeLike(DEFAULT_SITE_SETTINGS[section], input);
}

/** "۰۲۱-۱۲۳۴" / "021 1234" -> "tel:0211234" */
export function toTelHref(phone) {
    const faDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arDigits = '٠١٢٣٤٥٦٧٨٩';
    const ascii = String(phone || '')
        .replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(arDigits.indexOf(d)))
        .replace(/[^\d+]/g, '');
    return ascii ? `tel:${ascii}` : '';
}
