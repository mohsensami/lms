// prisma/seed.mjs
//
// Seed data in Persian, suitable for a Farsi-language LMS demo.
// One course only ("آموزش متلب"), but fleshed out completely: many
// modules, lessons in each module, a final exam with several questions, an
// admin (the course teacher), a few students, enrollments, and testimonials/reviews.
//
// Run with:
//   npx prisma db seed
// (or it also runs automatically after `npx prisma migrate reset`)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Lesson link fields (video_url, attachmentUrl, attachmentName) are optional
// strings. Leave the 'xxxxxxxxxxx' placeholder, an empty string, or delete the
// property entirely and the lesson is saved with NO value (null) — so a lesson
// without a video or file never shows a broken player / download button.
const PLACEHOLDER = 'xxxxxxxxxxx';
function optionalText(value) {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text && text !== PLACEHOLDER ? text : null;
}

function slugify(title) {
    return title.replace(/ /g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');
}

async function clearExistingData() {
    // Delete children before parents to satisfy foreign key constraints.
    await prisma.post.deleteMany();
    await prisma.examAttempt.deleteMany();
    await prisma.examQuestion.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.enrollment.deleteMany();
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
            title: 'ریاضیات و محاسبات مهندسی',
            description:
                'آموزش نرم‌افزارها و ابزارهای محاسباتی مورد نیاز دانشجویان و مهندسین، از جمله متلب، شبیه‌سازی و تحلیل عددی.',
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        },
    });

    console.log('در حال ساخت کاربران...');
    const hashedPassword = await bcrypt.hash('123456sSa', 5);

    const instructor = await prisma.user.create({
        data: {
            firstName: 'مدیر',
            lastName: 'سایت',
            email: 'admin@email.com',
            password: hashedPassword,
            role: 'admin',
            phone: '09033451850',
            bio: 'دکتری مهندسی برق و مدرس دانشگاه با بیش از ۸ سال سابقه‌ی تدریس متلب و شبیه‌سازی سیستم‌های مهندسی. علاقه‌مند به آموزش کاربردی و پروژه‌محور نرم‌افزارهای محاسباتی.',
            designation: 'مدرس متلب و شبیه‌سازی مهندسی',
            profilePicture: 'https://i.pravatar.cc/300?img=15',
            socialMedia: {
                twitter: 'https://twitter.com/mohsensami',
                linkedin: 'https://linkedin.com/in/mohsensami',
                github: 'https://github.com/mohsensami',
            },
        },
    });

    const students = await Promise.all([
        prisma.user.create({
            data: {
                firstName: 'دانشجو',
                lastName: 'سایت',
                email: 'student@email.com',
                password: hashedPassword,
                role: 'student',
                phone: '09359431620',
                bio: 'دانشجوی کارشناسی مهندسی برق، در حال یادگیری متلب برای پروژه‌های درسی.',
                profilePicture: 'https://i.pravatar.cc/300?img=45',
            },
        }),
        prisma.user.create({
            data: {
                firstName: 'مهمان',
                lastName: 'سایت',
                email: 'guest@email.com',
                password: hashedPassword,
                role: 'student',
                phone: '',
                bio: 'دانشجوی مهندسی مکانیک و علاقه‌مند به شبیه‌سازی و تحلیل عددی با متلب.',
                profilePicture: 'https://i.pravatar.cc/300?img=33',
            },
        }),
    ]);

    const [student, guest] = students;

    console.log('در حال ساخت دوره...');
    const course = await prisma.course.create({
        data: {
            title: 'آموزش متلب (MATLAB) از مقدماتی تا پیشرفته',
            subtitle: 'یادگیری کامل نرم‌افزار متلب برای دانشجویان و مهندسین رشته‌های فنی و علوم پایه',
            description:
                'این دوره یک مسیر یادگیری کامل برای تسلط بر نرم‌افزار متلب (MATLAB) است، مناسب برای دانشجویان مهندسی برق، مکانیک، عمران، صنایع و علوم پایه. ' +
                'در طول این دوره، از آشنایی اولیه با محیط نرم‌افزار شروع می‌کنیم، سپس مفاهیم پایه‌ای مثل متغیرها، ماتریس‌ها، حلقه‌ها و شرط‌ها را یاد می‌گیرید، ' +
                'و در نهایت با نوشتن توابع، رسم نمودارهای دو و سه‌بعدی و کار با فایل‌های داده، آماده‌ی استفاده از متلب در پروژه‌ها و تحقیقات دانشگاهی خود خواهید بود. ' +
                'تمام مباحث با مثال‌های عملی و تمرین‌های کاربردی تدریس شده‌اند.',
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
            price: 890000,
            active: true,
            learning: [
                'آشنایی کامل با محیط و ابزارهای نرم‌افزار متلب',
                'کار با متغیرها، ماتریس‌ها و آرایه‌ها به‌صورت حرفه‌ای',
                'نوشتن اسکریپت و توابع (m-file) در متلب',
                'استفاده از حلقه‌ها و دستورات شرطی برای حل مسائل مهندسی',
                'رسم نمودارهای دو بعدی و سه بعدی برای تحلیل داده‌ها',
                'وارد و خارج کردن داده از فایل‌های اکسل و متنی',
                'آشنایی مقدماتی با جعبه‌ابزارهای تخصصی متلب (Simulink، پردازش سیگنال و تصویر)',
            ],
            categoryId: category.id,
            instructorId: instructor.id,
        },
    });

    console.log('در حال ساخت ماژول‌ها و درس‌ها...');

    const modulesData = [
        {
            title: 'آشنایی با متلب و نصب نرم‌افزار',
            description: 'آشنایی اولیه با کاربردهای متلب در صنعت و دانشگاه و راه‌اندازی نرم‌افزار.',
            lessons: [
                {
                    title: 'متلب چیست و در چه صنایعی کاربرد دارد؟',
                    duration: 480,
                    access: 'public',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'دانلود و نصب متلب روی ویندوز و مک',
                    duration: 600,
                    access: 'public',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'آشنایی با نسخه‌های مختلف و جعبه‌ابزارهای متلب',
                    duration: 420,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'آشنایی با MATLAB Online و جایگزین‌های رایگان',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'آشنایی با محیط و رابط کاربری متلب',
            description: 'شناخت بخش‌های مختلف محیط متلب و نحوه‌ی کار با آن‌ها.',
            lessons: [
                {
                    title: 'معرفی Command Window و Workspace',
                    duration: 540,
                    access: 'public',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'کار با Editor و نوشتن اولین اسکریپت',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'مدیریت فایل‌ها با Current Folder',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'استفاده از راهنما و مستندات متلب (Help و Documentation)',
                    duration: 420,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'متغیرها، انواع داده و عملگرها',
            description: 'یادگیری نحوه‌ی تعریف متغیر، انواع داده و عملگرهای محاسباتی و منطقی در متلب.',
            lessons: [
                {
                    title: 'تعریف و مقداردهی متغیرها',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'انواع داده در متلب (عددی، رشته‌ای، منطقی)',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'عملگرهای محاسباتی (جمع، تفریق، ضرب، توان)',
                    duration: 540,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'عملگرهای منطقی و مقایسه‌ای',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'تمرین عملی: محاسبات ریاضی پایه با متلب',
                    duration: 720,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'کار با ماتریس‌ها و آرایه‌ها',
            description: 'مهم‌ترین بخش متلب: ساخت، دستکاری و انجام محاسبات روی ماتریس‌ها و آرایه‌ها.',
            lessons: [
                {
                    title: 'ساخت ماتریس و آرایه در متلب',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'دسترسی به عناصر ماتریس (Indexing)',
                    duration: 720,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'عملیات ماتریسی (ضرب، ترانهاده، معکوس)',
                    duration: 840,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'توابع پرکاربرد روی ماتریس‌ها (size، sum، sort)',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'حل دستگاه معادلات خطی با ماتریس',
                    duration: 900,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'حلقه‌ها و دستورات شرطی',
            description: 'کنترل روند اجرای برنامه با استفاده از حلقه‌ها و شرط‌ها برای حل مسائل تکرارشونده.',
            lessons: [
                {
                    title: 'دستور شرطی if و else',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'دستور switch-case',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'حلقه‌ی for در متلب',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'حلقه‌ی while و کنترل تکرار',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'تمرین عملی: محاسبه‌ی سری‌های عددی با حلقه',
                    duration: 780,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'نوشتن توابع در متلب',
            description: 'یادگیری ساخت توابع کاربر برای سازمان‌دهی و بازاستفاده از کد.',
            lessons: [
                {
                    title: 'تفاوت Script و Function در متلب',
                    duration: 540,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'نوشتن اولین تابع (function) با ورودی و خروجی',
                    duration: 720,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'توابع با چند خروجی و آرگومان‌های اختیاری',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'توابع ناشناس (Anonymous Functions) و Handle',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'پروژه عملی: نوشتن یک ماشین‌حساب ساده با تابع',
                    duration: 900,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'رسم نمودار و تجسم داده‌ها',
            description: 'رسم نمودارهای دو بعدی و سه بعدی برای نمایش و تحلیل داده‌ها.',
            lessons: [
                {
                    title: 'رسم نمودار دو بعدی با دستور plot',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'شخصی‌سازی نمودار (رنگ، عنوان، برچسب محورها)',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'رسم چند نمودار هم‌زمان و Subplot',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'نمودارهای سه‌بعدی با mesh و surf',
                    duration: 780,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'ذخیره و خروجی گرفتن از نمودارها',
                    duration: 420,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'کار با فایل‌ها و ورود و خروج داده',
            description: 'یادگیری خواندن و نوشتن داده از فایل‌های اکسل و متنی برای پردازش در متلب.',
            lessons: [
                {
                    title: 'وارد کردن داده از فایل اکسل (xlsread و readtable)',
                    duration: 660,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'خروجی گرفتن نتایج به فایل اکسل و CSV',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'کار با فایل‌های متنی (txt) در متلب',
                    duration: 540,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'ذخیره و بارگذاری متغیرها با save و load',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
        {
            title: 'آشنایی مقدماتی با Simulink و پردازش سیگنال/تصویر',
            description: 'جمع‌بندی دوره و نگاهی مقدماتی به جعبه‌ابزارهای تخصصی متلب برای ادامه‌ی مسیر یادگیری.',
            lessons: [
                {
                    title: 'Simulink چیست و چه کاربردی دارد؟',
                    duration: 600,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'ساخت اولین مدل ساده در Simulink',
                    duration: 900,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'آشنایی مقدماتی با پردازش سیگنال در متلب',
                    duration: 720,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'آشنایی مقدماتی با پردازش تصویر در متلب',
                    duration: 720,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
                {
                    title: 'جمع‌بندی دوره و مسیر یادگیری پیشرفته',
                    duration: 480,
                    access: 'private',
                    video_url: 'https://hajifirouz11.asset.aparat.com/aparat-video/1b2b1f2913cd3196a9473438e7cb2dc373180010-1080p.apt/chunk.m3u8?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMxZjFiMGRlZDExZjIyYWNhYjE4MmQ4ZjIwNzMzYmMyIiwiZXhwIjoxNzkzNDg3NzUzLCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.cc2v6caxqClaN-bP1ynl2V3t-MmA5T-YoIr5V1yt1xk', // لینک ویدئو (اختیاری)
                    attachmentUrl: 'https://raw.githubusercontent.com/mohsensami/personal/refs/heads/main/public/fonts/IRANSansWeb.ttf?token=GHSAT0AAAAAAEMZS3AVRZNIQTOH2A2XIHG62XGGHWA', // لینک فایل ضمیمه (اختیاری؛ اگر ندارد، این دو خط ضمیمه را پاک کنید)
                    attachmentName: 'File Atachment', // نام نمایشی ضمیمه، مثلاً 'فایل تمرین.zip' (اختیاری)
                },
            ],
        },
    ];

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
            await prisma.lesson.create({
                data: {
                    title: lessonInfo.title,
                    description: `در این درس با موضوع «${lessonInfo.title}» به‌صورت کامل و همراه با مثال آشنا می‌شوید.`,
                    duration: lessonInfo.duration,
                    // Per-lesson link: replace each 'xxxxxxxxxxx' in modulesData above with the real video URL.
                    video_url: optionalText(lessonInfo.video_url),
                    // Optional downloadable file for the lesson.
                    attachmentUrl: optionalText(lessonInfo.attachmentUrl),
                    attachmentName: optionalText(lessonInfo.attachmentName),
                    active: true,
                    slug: slugify(lessonInfo.title),
                    access: lessonInfo.access,
                    order: l + 1,
                    moduleId: createdModule.id,
                },
            });
        }
    }

    console.log('در حال ساخت آزمون پایانی دوره...');
    const quizzesData = [
        {
            title: 'کدام دستور برای ساخت یک ماتریس ۳ در ۳ پر شده از صفر استفاده می‌شود؟',
            options: [
                { text: 'zeros(3,3)', is_correct: true },
                { text: 'null(3,3)', is_correct: false },
                { text: 'empty(3,3)', is_correct: false },
                { text: 'zero_matrix(3)', is_correct: false },
            ],
        },
        {
            title: 'برای ترانهاده کردن یک ماتریس در متلب از کدام علامت استفاده می‌شود؟',
            options: [
                { text: '*', is_correct: false },
                { text: '^', is_correct: false },
                { text: "'", is_correct: true },
                { text: '~', is_correct: false },
            ],
        },
        {
            title: 'کدام دستور برای رسم نمودار دو بعدی در متلب استفاده می‌شود؟',
            options: [
                { text: 'draw()', is_correct: false },
                { text: 'plot()', is_correct: true },
                { text: 'chart()', is_correct: false },
                { text: 'graph2d()', is_correct: false },
            ],
        },
        {
            title: 'خروجی دستور size([1 2 3; 4 5 6]) چیست؟',
            options: [
                { text: '[3 2]', is_correct: false },
                { text: '[2 3]', is_correct: true },
                { text: '[6 1]', is_correct: false },
                { text: '[2 2]', is_correct: false },
            ],
        },
        {
            title: 'کدام حلقه برای تعداد تکرار مشخص و از پیش تعیین‌شده مناسب‌تر است؟',
            options: [
                { text: 'while', is_correct: false },
                { text: 'for', is_correct: true },
                { text: 'if', is_correct: false },
                { text: 'switch', is_correct: false },
            ],
        },
        {
            title: 'برای تعریف یک تابع در متلب، فایل باید با کدام کلمه‌ی کلیدی شروع شود؟',
            options: [
                { text: 'def', is_correct: false },
                { text: 'func', is_correct: false },
                { text: 'function', is_correct: true },
                { text: 'method', is_correct: false },
            ],
        },
        {
            title: 'کدام دستور برای خواندن داده از یک فایل اکسل در متلب مناسب‌تر است؟',
            options: [
                { text: 'readtable()', is_correct: true },
                { text: 'importExcel()', is_correct: false },
                { text: 'loadxls()', is_correct: false },
                { text: 'openfile()', is_correct: false },
            ],
        },
        {
            title: 'Simulink در متلب بیشتر برای چه کاری استفاده می‌شود؟',
            options: [
                { text: 'ویرایش متن', is_correct: false },
                { text: 'مدل‌سازی و شبیه‌سازی سیستم‌های دینامیکی', is_correct: true },
                { text: 'مدیریت فایل‌ها', is_correct: false },
                { text: 'طراحی رابط کاربری وب', is_correct: false },
            ],
        },
    ];

    await prisma.exam.create({
        data: {
            courseId: course.id,
            title: 'آزمون پایانی دوره متلب',
            description: 'این آزمون میزان یادگیری شما از مباحث مطرح‌شده در دوره متلب را می‌سنجد.',
            durationMinutes: 15,
            requiredCorrect: 6,
            active: true,
            questions: {
                create: quizzesData.map((quizInfo, order) => ({
                    text: quizInfo.title,
                    options: quizInfo.options.map((o) => o.text),
                    correctIndex: quizInfo.options.findIndex((o) => o.is_correct),
                    order,
                })),
            },
        },
    });

    console.log('در حال ثبت‌نام دانشجویان در دوره...');
    const enrollments = await Promise.all([
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: student.id,
                method: 'online',
                status: 'in-progress',
                enrollment_date: new Date('2026-04-10'),
            },
        }),
        prisma.enrollment.create({
            data: {
                courseId: course.id,
                studentId: guest.id,
                method: 'online',
                status: 'completed',
                enrollment_date: new Date('2026-02-01'),
                completion_date: new Date('2026-05-20'),
            },
        }),
    ]);

    console.log('در حال ثبت نظرات دانشجویان...');
    await Promise.all([
        prisma.testimonial.create({
            data: {
                content:
                    'دوره‌ی خیلی خوبی بود، مخصوصاً بخش کار با ماتریس‌ها که پایه‌ی خیلی از پروژه‌های دانشگاهی منه. توضیحات آقای صادقی کاملاً قابل فهم و همراه با مثال بود.',
                rating: 5,
                courseId: course.id,
                userId: student.id,
            },
        }),
        prisma.testimonial.create({
            data: {
                content:
                    'برای پروژه پایان‌نامه‌م به متلب نیاز داشتم و این دوره دقیقاً همون چیزی بود که لازم داشتم. بخش رسم نمودار و Simulink خیلی کاربردی بود.',
                rating: 5,
                courseId: course.id,
                userId: guest.id,
            },
        }),
    ]);

    console.log('در حال ثبت گزارش پیشرفت دانشجویان...');

    console.log('در حال ساخت مقالات وبلاگ...');

    const postsData = [
        {
            title: 'چرا یادگیری متلب برای مهندسین ضروری است؟',
            content:
                'متلب یکی از پرکاربردترین نرم‌افزارهای محاسباتی در دنیای مهندسی و علوم پایه است. ' +
                'در این مقاله بررسی می‌کنیم که چرا دانشجویان و مهندسین رشته‌های برق، مکانیک، عمران و صنایع باید ' +
                'تسلط کافی روی این ابزار داشته باشند و چطور می‌توان مسیر یادگیری آن را کوتاه‌تر کرد. ' +
                'از تحلیل داده گرفته تا شبیه‌سازی سیستم‌های دینامیکی، متلب در اغلب پروژه‌های دانشگاهی و صنعتی حضور دارد.',
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        },
        {
            title: '۵ اشتباه رایج دانشجویان تازه‌کار در متلب',
            content:
                'خیلی از دانشجویانی که تازه شروع به یادگیری متلب می‌کنند، اشتباهات مشابهی مرتکب می‌شوند؛ ' +
                'از نادیده گرفتن تفاوت بین ضرب معمولی و ضرب عنصر به عنصر گرفته تا استفاده‌ی نادرست از اندیس‌گذاری ماتریس‌ها. ' +
                'در این مقاله این اشتباهات را مرور می‌کنیم و راه‌حل هر کدام را توضیح می‌دهیم تا مسیر یادگیری شما هموارتر شود.',
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
        },
        {
            title: 'آشنایی با Simulink و کاربردهای آن در صنعت',
            content:
                'Simulink یکی از قدرتمندترین جعبه‌ابزارهای متلب برای مدل‌سازی و شبیه‌سازی سیستم‌های دینامیکی است. ' +
                'در این مقاله با محیط گرافیکی Simulink آشنا می‌شوید و می‌بینید که چطور در صنایع خودروسازی، هوافضا و کنترل ' +
                'صنعتی برای طراحی و تست سیستم‌ها پیش از پیاده‌سازی واقعی استفاده می‌شود.',
            thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
        },
        {
            title: 'مسیر یادگیری تحلیل داده با متلب برای مبتدیان',
            content:
                'اگر می‌خواهید وارد دنیای تحلیل داده شوید، متلب یکی از گزینه‌های خوب برای شروع است. ' +
                'در این مقاله یک نقشه‌ی راه گام‌به‌گام معرفی می‌کنیم: از وارد کردن داده از فایل‌های اکسل و متنی، ' +
                'تا رسم نمودارهای تحلیلی و استفاده از توابع آماری پرکاربرد متلب.',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        },
    ];

    for (const postInfo of postsData) {
        await prisma.post.create({
            data: {
                title: postInfo.title,
                slug: slugify(postInfo.title).slice(0, 80),
                content: postInfo.content,
                thumbnail: postInfo.thumbnail,
            },
        });
    }

    console.log('✅ Seed با موفقیت انجام شد.');
    console.log(`- ${modulesData.length} ماژول`);
    console.log(`- ${modulesData.reduce((acc, m) => acc + m.lessons.length, 0)} درس`);
    console.log(`- ${quizzesData.length} سوال آزمون`);
    console.log(`- ${enrollments.length} ثبت‌نام`);
    console.log(`- ${postsData.length} مقاله`);
    console.log('اطلاعات ورود مدرس: admin@email.com / Password123!');
    console.log('اطلاعات ورود دانشجو: student@email.com / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
