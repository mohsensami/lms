// Describes which fields each settings form shows. The shape of the data
// itself (and its defaults) lives in lib/site-defaults.js.
//
// field types: text | textarea | image | switch | list
//   `dir: 'ltr'` is for values that are typed left-to-right (URLs, e-mail...).

const link = (name, label) => ({ name, label, type: 'text', dir: 'ltr', placeholder: 'https://...' });

export const SITE_FORMS = {
    general: {
        title: 'مشخصات سایت',
        description: 'نام، توضیحات و آیکن سایت؛ در عنوان تب مرورگر، نتایج گوگل و اشتراک‌گذاری استفاده می‌شود.',
        fields: [
            { name: 'name', label: 'نام سایت', type: 'text' },
            {
                name: 'tagline',
                label: 'شعار / عنوان تکمیلی',
                type: 'text',
                hint: 'عنوان صفحه‌ی اصلی می‌شود «نام سایت - شعار». اگر خالی باشد فقط نام سایت نمایش داده می‌شود.',
            },
            { name: 'description', label: 'توضیحات سایت (برای گوگل)', type: 'textarea' },
            { name: 'keywords', label: 'کلمات کلیدی', type: 'text', hint: 'با ویرگول جدا کنید. اختیاری است.' },
            { name: 'logoUrl', label: 'لوگو', type: 'image', hint: 'اگر خالی بماند لوگوی پیش‌فرض نمایش داده می‌شود.' },
            {
                name: 'faviconUrl',
                label: 'فاوآیکون (آیکن تب مرورگر)',
                type: 'image',
                hint: 'تصویر مربعی (مثلاً ۱۲۸×۱۲۸ یا ۵۱۲×۵۱۲ پیکسل، PNG یا ICO).',
            },
            {
                name: 'ogImageUrl',
                label: 'تصویر اشتراک‌گذاری',
                type: 'image',
                hint: 'تصویری که هنگام اشتراک لینک سایت در تلگرام، بله و ... نمایش داده می‌شود (۱۲۰۰×۶۳۰ پیکسل).',
            },
        ],
    },

    home: {
        title: 'صفحه‌ی اصلی',
        description: 'متن‌ها، دکمه، آمار و تصویر بالای صفحه‌ی اصلی و عنوان بخش‌ها.',
        fields: [
            { name: 'badge', label: 'برچسب بالای عنوان', type: 'text' },
            { name: 'title', label: 'عنوان', type: 'text' },
            { name: 'highlight', label: 'ادامه‌ی عنوان (با رنگ اصلی)', type: 'text' },
            { name: 'subtitle', label: 'توضیح زیر عنوان', type: 'textarea' },
            { name: 'buttonText', label: 'متن دکمه', type: 'text' },
            link('buttonHref', 'لینک دکمه'),
            { name: 'showStats', label: 'نمایش آمار', type: 'switch' },
            {
                name: 'stats',
                label: 'آمار',
                type: 'list',
                max: 4,
                addLabel: 'افزودن آمار',
                itemFields: [
                    { name: 'value', label: 'عدد', type: 'text' },
                    { name: 'label', label: 'عنوان', type: 'text' },
                ],
            },
            { name: 'previewImageUrl', label: 'تصویر سمت چپ', type: 'image' },
            { name: 'previewCaption', label: 'متن زیر تصویر', type: 'text' },
            { name: 'floatLabel', label: 'کارت شناور — برچسب', type: 'text' },
            { name: 'floatTitle', label: 'کارت شناور — عنوان', type: 'text' },
            { name: 'coursesTitle', label: 'عنوان بخش دوره‌ها', type: 'text' },
            { name: 'showPosts', label: 'نمایش بخش «آخرین مقالات»', type: 'switch' },
            { name: 'postsTitle', label: 'عنوان بخش مقالات', type: 'text' },
        ],
    },

    guarantee: {
        title: 'ضمانت بازگشت وجه',
        description: 'بخشی که پایین صفحه‌ی هر دوره نمایش داده می‌شود.',
        fields: [
            { name: 'enabled', label: 'نمایش این بخش', type: 'switch' },
            { name: 'headline', label: 'سرتیتر کوچک', type: 'text' },
            { name: 'title', label: 'عنوان', type: 'text' },
            { name: 'text', label: 'توضیح', type: 'textarea' },
        ],
    },

    header: {
        title: 'منوی بالای سایت',
        description: 'لینک‌هایی که در هدر (و منوی موبایل) نمایش داده می‌شوند.',
        fields: [
            {
                name: 'links',
                label: 'لینک‌های منو',
                type: 'list',
                max: 8,
                addLabel: 'افزودن لینک',
                itemFields: [
                    { name: 'title', label: 'عنوان', type: 'text' },
                    { name: 'href', label: 'آدرس', type: 'text', dir: 'ltr', placeholder: '/courses' },
                ],
            },
        ],
    },

    footer: {
        title: 'فوتر',
        description: 'متن‌ها و لینک‌های پایین سایت.',
        fields: [
            { name: 'about', label: 'متن معرفی', type: 'textarea' },
            {
                name: 'links',
                label: 'لینک‌های دسترسی سریع',
                type: 'list',
                max: 10,
                addLabel: 'افزودن لینک',
                itemFields: [
                    { name: 'title', label: 'عنوان', type: 'text' },
                    { name: 'href', label: 'آدرس', type: 'text', dir: 'ltr', placeholder: '/blog' },
                ],
            },
            { name: 'copyright', label: 'متن کپی‌رایت (بعد از سال)', type: 'text' },
            { name: 'showCredit', label: 'نمایش خط «طراحی سایت»', type: 'switch' },
            { name: 'creditLabel', label: 'طراحی سایت — متن اول', type: 'text' },
            link('creditLabelUrl', 'طراحی سایت — لینک متن اول'),
            { name: 'creditName', label: 'طراحی سایت — نام', type: 'text' },
            link('creditNameUrl', 'طراحی سایت — لینک نام'),
        ],
    },

    social: {
        title: 'شبکه‌های اجتماعی',
        description: 'فقط شبکه‌هایی که لینکشان را وارد کنید در فوتر نمایش داده می‌شوند.',
        fields: [
            link('instagram', 'اینستاگرام'),
            link('telegram', 'تلگرام'),
            link('youtube', 'یوتیوب'),
            link('aparat', 'آپارات'),
            link('bale', 'بله'),
            link('eitaa', 'ایتا'),
            link('whatsapp', 'واتساپ'),
            link('linkedin', 'لینکدین'),
        ],
    },

    contact: {
        title: 'صفحه‌ی تماس با ما',
        description: 'اطلاعات تماس و متن‌های صفحه‌ی «تماس با ما». موردهایی که خالی بگذارید نمایش داده نمی‌شوند.',
        fields: [
            { name: 'badge', label: 'برچسب بالای عنوان', type: 'text' },
            { name: 'title', label: 'عنوان', type: 'text' },
            { name: 'intro', label: 'توضیح', type: 'textarea' },
            { name: 'phone', label: 'شماره تماس', type: 'text', dir: 'ltr' },
            { name: 'email', label: 'ایمیل', type: 'text', dir: 'ltr' },
            { name: 'address', label: 'آدرس', type: 'text' },
            link('mapUrl', 'لینک آدرس روی نقشه (اختیاری)'),
            { name: 'hoursTitle', label: 'عنوان ساعات پاسخگویی', type: 'text' },
            {
                name: 'hours',
                label: 'ساعات پاسخگویی',
                type: 'list',
                max: 8,
                addLabel: 'افزودن ردیف',
                itemFields: [
                    { name: 'label', label: 'روزها', type: 'text' },
                    { name: 'value', label: 'ساعت', type: 'text' },
                ],
            },
            { name: 'chatTitle', label: 'کارت «چت آنلاین» — عنوان', type: 'text' },
            { name: 'chatText', label: 'کارت «چت آنلاین» — متن', type: 'textarea' },
            { name: 'chatButton', label: 'کارت «چت آنلاین» — متن دکمه', type: 'text' },
            link('chatUrl', 'کارت «چت آنلاین» — لینک (خالی = اینستاگرام)'),
        ],
    },

    about: {
        title: 'صفحه‌ی درباره ما',
        description: 'همه‌ی متن‌ها، آمار و اصول صفحه‌ی «درباره ما».',
        fields: [
            { name: 'badge', label: 'برچسب بالای عنوان', type: 'text' },
            { name: 'title', label: 'عنوان', type: 'text' },
            { name: 'intro', label: 'توضیح', type: 'textarea' },
            {
                name: 'stats',
                label: 'آمار',
                type: 'list',
                max: 4,
                addLabel: 'افزودن آمار',
                itemFields: [
                    { name: 'value', label: 'عدد', type: 'text' },
                    { name: 'label', label: 'عنوان', type: 'text' },
                ],
            },
            { name: 'storyTitle', label: 'عنوان بخش داستان ما', type: 'text' },
            { name: 'storyP1', label: 'داستان — پاراگراف اول', type: 'textarea' },
            { name: 'storyP2', label: 'داستان — پاراگراف دوم', type: 'textarea' },
            { name: 'storyImageUrl', label: 'تصویر بخش داستان', type: 'image' },
            { name: 'valuesTitle', label: 'عنوان بخش اصول', type: 'text' },
            { name: 'valuesSubtitle', label: 'زیرعنوان بخش اصول', type: 'text' },
            {
                name: 'values',
                label: 'اصول و ارزش‌ها',
                type: 'list',
                max: 6,
                addLabel: 'افزودن مورد',
                itemFields: [
                    { name: 'title', label: 'عنوان', type: 'text' },
                    { name: 'desc', label: 'توضیح', type: 'textarea' },
                ],
            },
            { name: 'ctaTitle', label: 'بخش انتهایی — عنوان', type: 'text' },
            { name: 'ctaText', label: 'بخش انتهایی — متن', type: 'textarea' },
            { name: 'ctaButton', label: 'بخش انتهایی — متن دکمه', type: 'text' },
        ],
    },
};
