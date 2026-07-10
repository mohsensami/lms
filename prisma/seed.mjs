// prisma/seed.mjs
//
// Seed data in Persian, suitable for a Farsi-language LMS demo.
// One course only, but fleshed out completely: many modules, lessons in
// each module, a quiz set with several questions, an instructor, a few
// students, enrollments, testimonials/reviews, and progress reports.
//
// Run with:
//   npx prisma db seed
// (or it also runs automatically after `npx prisma migrate reset`)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(title) {
    return title
        .replace(/ /g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '');
}

async function clearExistingData() {
    // Delete children before parents to satisfy foreign key constraints.
    await prisma.watch.deleteMany();
    await prisma.report.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.quizset.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    console.log('در حال پاک‌سازی داده‌های قبلی...');
    await clearExistingData();

    console.log('در حال ساخت دسته‌بندی...');
    const category = await prisma.category.create({
        data: {
            title: 'برنامه‌نویسی وب',
            description: 'آموزش‌های تخصصی توسعه وب، از مبانی تا مفاهیم پیشرفته فرانت‌اند و بک‌اند.',
            thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
        },
    });

    console.log('در حال ساخت کاربران...');
    const hashedPassword = await bcrypt.hash('Password123!', 5);

    const instructor = await prisma.user.create({
        data: {
            firstName: 'علی',
            lastName: 'محمدی',
            email: 'ali.mohammadi@example.com',
            password: hashedPassword,
            role: 'instructor',
            phone: '09121234567',
            bio: 'مدرس و توسعه‌دهنده وب با بیش از ۱۰ سال سابقه‌ی کار در پروژه‌های بزرگ تجاری. علاقه‌مند به آموزش جاوااسکریپت و فریم‌ورک‌های مدرن فرانت‌اند.',
            designation: 'مدرس ارشد توسعه وب',
            profilePicture: 'https://i.pravatar.cc/300?img=12',
            socialMedia: {
                twitter: 'https://twitter.com/ali_dev',
                linkedin: 'https://linkedin.com/in/ali-mohammadi',
                github: 'https://github.com/ali-mohammadi',
            },
        },
    });

    const students = await Promise.all([
        prisma.user.create({
            data: {
                firstName: 'سارا',
                lastName: 'احمدی',
                email: 'sara.ahmadi@example.com',
                password: hashedPassword,
                role: 'student',
                phone: '09123456789',
                bio: 'علاقه‌مند به طراحی رابط کاربری و توسعه فرانت‌اند.',
                profilePicture: 'https://i.pravatar.cc/300?img=45',
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'محمد',
                lastName: 'رضایی',
                email: 'mohammad.rezaei@example.com',
                password: hashedPassword,
                role: 'student',
                phone: '09351234567',
                bio: 'دانشجوی مهندسی کامپیوتر و علاقه‌مند به برنامه‌نویسی وب.',
                profilePicture: 'https://i.pravatar.cc/300?img=33',
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'نگار',
                lastName: 'کریمی',
                email: 'negar.karimi@example.com',
                password: hashedPassword,
                role: 'student',
                phone: '09191234567',
                bio: 'در حال یادگیری برنامه‌نویسی برای تغییر مسیر شغلی.',
                profilePicture: 'https://i.pravatar.cc/300?img=48',
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'امیر',
                lastName: 'حسینی',
                email: 'amir.hosseini@example.com',
                password: hashedPassword,
                role: 'student',
                phone: '09301234567',
                bio: 'برنامه‌نویس بک‌اند که می‌خواهد فرانت‌اند را هم یاد بگیرد.',
                profilePicture: 'https://i.pravatar.cc/300?img=53',
            },
        }),
    ]);

    const [sara, mohammad, negar, amir] = students;

    console.log('در حال ساخت دوره...');
    const course = await prisma.course.create({
        data: {
            title: 'آموزش کامل توسعه وب با جاوااسکریپت مدرن',
            subtitle: 'از صفر تا ساخت اپلیکیشن‌های واقعی با HTML، CSS، جاوااسکریپت و React',
            description:
                'این دوره یک مسیر یادگیری کامل برای تبدیل شدن به یک توسعه‌دهنده وب حرفه‌ای است. ' +
                'در طول این دوره، مفاهیم پایه‌ای HTML و CSS را یاد می‌گیرید، سپس وارد دنیای جاوااسکریپت مدرن می‌شوید ' +
                'و در نهایت با کتابخانه React اولین اپلیکیشن واقعی خود را می‌سازید. ' +
                'تمام مباحث با مثال‌های عملی و پروژه‌محور تدریس شده‌اند تا بتوانید آموخته‌های خود را بلافاصله به کار بگیرید.',
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            price: 1250000,
            active: true,
            learning: [
                'ساخت صفحات وب استاندارد و ریسپانسیو با HTML5 و CSS3',
                'تسلط کامل بر مفاهیم پایه و پیشرفته جاوااسکریپت (ES6+)',
                'کار با DOM، مدیریت رویدادها و برنامه‌نویسی ناهمگام (Async/Await)',
                'آشنایی با Git و مدیریت نسخه پروژه‌ها',
                'ساخت اولین اپلیکیشن با کتابخانه React',
                'اصول بهینه‌سازی و استقرار (Deploy) پروژه‌های وب',
            ],
            categoryId: category.id,
            instructorId: instructor.id,
        },
    });

    console.log('در حال ساخت ماژول‌ها و درس‌ها...');

    const modulesData = [
        {
            title: 'مقدمه و آشنایی با وب',
            description: 'آشنایی با نحوه کار وب، مرورگرها و ابزارهای مورد نیاز برای شروع برنامه‌نویسی.',
            lessons: [
                { title: 'وب چگونه کار می‌کند؟', duration: 480, access: 'public' },
                { title: 'نصب و راه‌اندازی ابزارهای توسعه (VS Code)', duration: 620, access: 'public' },
                { title: 'آشنایی با ساختار یک پروژه وب', duration: 540, access: 'private' },
                { title: 'آشنایی با Git و GitHub', duration: 900, access: 'private' },
            ],
        },
        {
            title: 'مبانی HTML5',
            description: 'یادگیری تگ‌های اصلی HTML و ساخت اسکلت صفحات وب.',
            lessons: [
                { title: 'ساختار کلی یک سند HTML', duration: 600, access: 'public' },
                { title: 'تگ‌های متنی و لیست‌ها', duration: 540, access: 'private' },
                { title: 'فرم‌ها و ورودی‌های کاربر', duration: 780, access: 'private' },
                { title: 'تگ‌های معنایی (Semantic HTML)', duration: 500, access: 'private' },
                { title: 'پروژه عملی: ساخت صفحه معرفی شخصی', duration: 1020, access: 'private' },
            ],
        },
        {
            title: 'مبانی CSS3 و طراحی ریسپانسیو',
            description: 'استایل‌دهی به صفحات وب و طراحی واکنش‌گرا برای موبایل و دسکتاپ.',
            lessons: [
                { title: 'سلکتورها و مدل جعبه‌ای (Box Model)', duration: 660, access: 'private' },
                { title: 'Flexbox در عمل', duration: 900, access: 'private' },
                { title: 'CSS Grid در عمل', duration: 900, access: 'private' },
                { title: 'رسپانسیو با Media Query', duration: 720, access: 'private' },
                { title: 'انیمیشن و ترنزیشن‌ها در CSS', duration: 660, access: 'private' },
            ],
        },
        {
            title: 'جاوااسکریپت پایه',
            description: 'شروع برنامه‌نویسی با جاوااسکریپت: متغیرها، توابع، حلقه‌ها و شرط‌ها.',
            lessons: [
                { title: 'متغیرها و انواع داده', duration: 660, access: 'private' },
                { title: 'عملگرها و شرط‌ها', duration: 600, access: 'private' },
                { title: 'حلقه‌ها (for و while)', duration: 660, access: 'private' },
                { title: 'توابع و پارامترها', duration: 720, access: 'private' },
                { title: 'آرایه‌ها و متدهای پرکاربرد', duration: 840, access: 'private' },
                { title: 'آبجکت‌ها در جاوااسکریپت', duration: 780, access: 'private' },
            ],
        },
        {
            title: 'جاوااسکریپت پیشرفته و ES6+',
            description: 'مفاهیم مدرن جاوااسکریپت شامل Arrow Function، Destructuring، Promise و بیشتر.',
            lessons: [
                { title: 'Arrow Function و this', duration: 600, access: 'private' },
                { title: 'Destructuring و Spread Operator', duration: 660, access: 'private' },
                { title: 'برنامه‌نویسی ناهمگام: Callback تا Promise', duration: 900, access: 'private' },
                { title: 'Async/Await در عمل', duration: 780, access: 'private' },
                { title: 'کار با Fetch API و درخواست‌های HTTP', duration: 840, access: 'private' },
            ],
        },
        {
            title: 'کار با DOM و رویدادها',
            description: 'دستکاری صفحه وب به‌صورت پویا با استفاده از DOM API.',
            lessons: [
                { title: 'انتخاب و تغییر عناصر HTML با جاوااسکریپت', duration: 660, access: 'private' },
                { title: 'مدیریت رویدادها (Event Listener)', duration: 720, access: 'private' },
                { title: 'ساخت و حذف پویای عناصر', duration: 660, access: 'private' },
                { title: 'پروژه عملی: ساخت یک لیست کارها (To-Do List)', duration: 1200, access: 'private' },
            ],
        },
        {
            title: 'آشنایی با React',
            description: 'شروع کار با کتابخانه React برای ساخت رابط‌های کاربری واکنش‌گرا.',
            lessons: [
                { title: 'React چیست و چرا از آن استفاده کنیم؟', duration: 540, access: 'private' },
                { title: 'کامپوننت‌ها و JSX', duration: 720, access: 'private' },
                { title: 'مدیریت State با useState', duration: 780, access: 'private' },
                { title: 'کار با Props', duration: 660, access: 'private' },
                { title: 'useEffect و چرخه حیات کامپوننت', duration: 840, access: 'private' },
                { title: 'پروژه عملی: ساخت اپلیکیشن لیست وظایف با React', duration: 1500, access: 'private' },
            ],
        },
        {
            title: 'پروژه نهایی و استقرار (Deployment)',
            description: 'جمع‌بندی مطالب دوره و آموزش انتشار پروژه روی اینترنت.',
            lessons: [
                { title: 'برنامه‌ریزی و طراحی پروژه نهایی', duration: 600, access: 'private' },
                { title: 'پیاده‌سازی پروژه نهایی - بخش اول', duration: 1500, access: 'private' },
                { title: 'پیاده‌سازی پروژه نهایی - بخش دوم', duration: 1500, access: 'private' },
                { title: 'استقرار پروژه با Vercel', duration: 660, access: 'private' },
                { title: 'جمع‌بندی و مسیر یادگیری بعدی', duration: 480, access: 'private' },
            ],
        },
    ];

    let firstLesson = null;

    for (let m = 0; m < modulesData.length; m++) {
        const moduleInfo = modulesData[m];
        const createdModule = await prisma.module.create({
            data: {
                title: moduleInfo.title,
                description: moduleInfo.description,
                slug: slugify(moduleInfo.title),
                active: true,
                order: m + 1,
                courseId: course.id,
            },
        });

        for (let l = 0; l < moduleInfo.lessons.length; l++) {
            const lessonInfo = moduleInfo.lessons[l];
            const createdLesson = await prisma.lesson.create({
                data: {
                    title: lessonInfo.title,
                    description: `در این درس با موضوع «${lessonInfo.title}» به‌صورت کامل و همراه با مثال آشنا می‌شوید.`,
                    duration: lessonInfo.duration,
                    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    active: true,
                    slug: slugify(lessonInfo.title),
                    access: lessonInfo.access,
                    order: l + 1,
                    moduleId: createdModule.id,
                },
            });

            if (!firstLesson) {
                firstLesson = createdLesson;
            }
        }
    }

    console.log('در حال ساخت آزمون پایانی دوره...');
    const quizSet = await prisma.quizset.create({
        data: {
            title: 'آزمون پایانی دوره توسعه وب',
            description: 'این آزمون میزان یادگیری شما از مباحث مطرح‌شده در دوره را می‌سنجد.',
            slug: 'final-web-development-quiz',
            active: true,
        },
    });

    const quizzesData = [
        {
            title: 'کدام تگ برای ساخت لیست مرتب در HTML استفاده می‌شود؟',
            options: [
                { text: '<ul>', is_correct: false },
                { text: '<ol>', is_correct: true },
                { text: '<list>', is_correct: false },
                { text: '<li>', is_correct: false },
            ],
        },
        {
            title: 'کدام ویژگی CSS برای چیدمان فلکسی (Flexbox) استفاده می‌شود؟',
            options: [
                { text: 'display: flex;', is_correct: true },
                { text: 'position: flex;', is_correct: false },
                { text: 'float: flex;', is_correct: false },
                { text: 'layout: flex;', is_correct: false },
            ],
        },
        {
            title: 'کدام کلمه کلیدی برای تعریف متغیر غیرقابل تغییر در جاوااسکریپت استفاده می‌شود؟',
            options: [
                { text: 'var', is_correct: false },
                { text: 'let', is_correct: false },
                { text: 'const', is_correct: true },
                { text: 'static', is_correct: false },
            ],
        },
        {
            title: 'خروجی typeof [] در جاوااسکریپت چیست؟',
            options: [
                { text: 'array', is_correct: false },
                { text: 'object', is_correct: true },
                { text: 'undefined', is_correct: false },
                { text: 'list', is_correct: false },
            ],
        },
        {
            title: 'کدام متد برای ارسال درخواست HTTP در جاوااسکریپت مدرن استفاده می‌شود؟',
            options: [
                { text: 'request()', is_correct: false },
                { text: 'fetch()', is_correct: true },
                { text: 'ajaxCall()', is_correct: false },
                { text: 'http.get()', is_correct: false },
            ],
        },
        {
            title: 'در React، برای مدیریت state درون یک کامپوننت تابعی از چه چیزی استفاده می‌کنیم؟',
            options: [
                { text: 'useEffect', is_correct: false },
                { text: 'useState', is_correct: true },
                { text: 'useRef', is_correct: false },
                { text: 'useContext', is_correct: false },
            ],
        },
        {
            title: 'کدام گزینه یک Pseudo-class در CSS است؟',
            options: [
                { text: '::before', is_correct: false },
                { text: ':hover', is_correct: true },
                { text: '@media', is_correct: false },
                { text: '#id', is_correct: false },
            ],
        },
        {
            title: 'کدام روش صحیح برای await کردن یک Promise است؟',
            options: [
                { text: 'استفاده از await درون یک تابع async', is_correct: true },
                { text: 'استفاده از await در سطح فایل بدون async', is_correct: false },
                { text: 'استفاده از then به‌جای await همیشه اجباری است', is_correct: false },
                { text: 'await فقط در جاوااسکریپت سمت سرور کار می‌کند', is_correct: false },
            ],
        },
    ];

    for (const quizInfo of quizzesData) {
        await prisma.quiz.create({
            data: {
                title: quizInfo.title,
                slug: slugify(quizInfo.title).slice(0, 60),
                options: quizInfo.options,
                mark: 5,
                quizsetId: quizSet.id,
            },
        });
    }

    await prisma.course.update({
        where: { id: course.id },
        data: { quizSetId: quizSet.id },
    });

    console.log('در حال ثبت‌نام دانشجویان در دوره...');
    const enrollments = await Promise.all([
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: sara.id,
                method: 'online',
                status: 'in-progress',
                enrollment_date: new Date('2026-04-10'),
            },
        }),
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: mohammad.id,
                method: 'online',
                status: 'completed',
                enrollment_date: new Date('2026-02-01'),
                completion_date: new Date('2026-05-20'),
            },
        }),
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: negar.id,
                method: 'online',
                status: 'not-started',
                enrollment_date: new Date('2026-06-15'),
            },
        }),
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: amir.id,
                method: 'online',
                status: 'in-progress',
                enrollment_date: new Date('2026-05-05'),
            },
        }),
    ]);

    console.log('در حال ثبت نظرات دانشجویان...');
    await Promise.all([
        prisma.testimonial.create({
            data: {
                content:
                    'یکی از بهترین دوره‌های فارسی برنامه‌نویسی وب که دیدم. توضیحات آقای محمدی خیلی روان و قابل فهم بود و پروژه‌های عملی دوره کمک زیادی به یادگیری من کرد.',
                rating: 5,
                courseId: course.id,
                userId: sara.id,
            },
        }),
        prisma.testimonial.create({
            data: {
                content:
                    'دوره کامل و جامعی بود، به خصوص بخش جاوااسکریپت پیشرفته که خیلی خوب توضیح داده شده بود. پیشنهاد می‌کنم اگر می‌خواهید React یاد بگیرید حتما این دوره را ببینید.',
                rating: 5,
                courseId: course.id,
                userId: mohammad.id,
            },
        }),
        prisma.testimonial.create({
            data: {
                content:
                    'محتوای دوره خوب بود ولی جای چند تا پروژه عملی بیشتر توی بخش CSS خالی بود. در کل راضی‌ام و پیشنهادش می‌کنم.',
                rating: 4,
                courseId: course.id,
                userId: amir.id,
            },
        }),
    ]);

    console.log('در حال ثبت گزارش پیشرفت دانشجویان...');

    // Mohammad has completed the course: mark every lesson & module as done.
    const allModules = await prisma.module.findMany({
        where: { courseId: course.id },
        orderBy: { order: 'asc' },
        include: { lessonIds: { orderBy: { order: 'asc' } } },
    });
    const allLessonIds = allModules.flatMap((m) => m.lessonIds.map((l) => l.id));
    const allModuleIds = allModules.map((m) => m.id);

    await prisma.report.create({
        data: {
            courseId: course.id,
            studentId: mohammad.id,
            totalCompletedLessons: allLessonIds,
            totalCompletedModeules: allModuleIds,
            completion_date: new Date('2026-05-20'),
        },
    });

    // Sara and Amir are partway through (first two modules completed).
    const partialModules = allModules.slice(0, 2);
    const partialLessonIds = partialModules.flatMap((m) => m.lessonIds.map((l) => l.id));
    const partialModuleIds = partialModules.map((m) => m.id);

    await prisma.report.create({
        data: {
            courseId: course.id,
            studentId: sara.id,
            totalCompletedLessons: partialLessonIds,
            totalCompletedModeules: partialModuleIds,
        },
    });

    await prisma.report.create({
        data: {
            courseId: course.id,
            studentId: amir.id,
            totalCompletedLessons: partialLessonIds.slice(0, 3),
            totalCompletedModeules: [],
        },
    });

    console.log('✅ Seed با موفقیت انجام شد.');
    console.log(`- ${modulesData.length} ماژول`);
    console.log(`- ${modulesData.reduce((acc, m) => acc + m.lessons.length, 0)} درس`);
    console.log(`- ${quizzesData.length} سوال آزمون`);
    console.log(`- ${enrollments.length} ثبت‌نام`);
    console.log('اطلاعات ورود مدرس: ali.mohammadi@example.com / Password123!');
    console.log('اطلاعات ورود دانشجو: sara.ahmadi@example.com / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
