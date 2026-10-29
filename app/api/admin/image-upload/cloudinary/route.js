import { requireAdminForRoute } from '@/lib/admin-guard';
import { CloudinaryDriver } from '@/lib/storage/cloudinary-driver';

// Signed, direct-to-Cloudinary IMAGE uploads for blog posts (cover + body
// images). The API secret never leaves the server: the browser only gets a
// short-lived signature and then uploads the file straight to Cloudinary.

function getDriver() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
    return new CloudinaryDriver({
        id: 'cloudinary',
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        apiSecret: CLOUDINARY_API_SECRET,
        folder: CLOUDINARY_FOLDER,
    });
}

/** Tells the editor whether Cloudinary is configured (so it can disable the option). */
export async function GET() {
    const { response } = await requireAdminForRoute();
    if (response) return response;
    return Response.json({ configured: Boolean(getDriver()) });
}

/** Returns what the browser needs to upload one image to Cloudinary. */
export async function POST() {
    const { response } = await requireAdminForRoute();
    if (response) return response;

    const driver = getDriver();
    if (!driver) {
        return Response.json(
            { error: 'Cloudinary تنظیم نشده است (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET را در env بگذارید).' },
            { status: 400 },
        );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${driver.folder}/blog`;
    const signature = driver.sign({ folder, timestamp });

    return Response.json({
        uploadUrl: `${driver.apiBase}/image/upload`,
        fields: {
            api_key: driver.apiKey,
            timestamp: String(timestamp),
            folder,
            signature,
        },
    });
}
