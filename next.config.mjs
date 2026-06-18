/** @type {import('next').NextConfig} */
const nextConfig = {
    // حذف distDir یا تغییر به .next
    // distDir: "build", // این خط را کامنت کنید یا حذف کنید

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
        ],
    },
};

export default nextConfig;
