// Safe for both server and client code.
//
// Two admin switches (Settings -> «وضعیت سایت»), stored in the SiteSetting
// table under the key "site-status":
//   maintenance  : حالت تعمیر — shows a fixed alert bar at the top of every page.
//   closed       : غیرفعال‌کردن سایت — only logged-in users can open the site;
//                  guests only reach the login and register pages.

export const SITE_STATUS_KEY = 'site-status';

export const DEFAULT_MAINTENANCE_MESSAGE = 'سایت در حال به‌روزرسانی می‌باشد';
export const MAX_MAINTENANCE_MESSAGE_LENGTH = 300;

export const DEFAULT_SITE_STATUS = {
    maintenance: { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE },
    closed: false,
};

/** Turns whatever is stored (or sent by the browser) into a valid status object. */
export function sanitizeSiteStatus(raw) {
    const message = typeof raw?.maintenance?.message === 'string' ? raw.maintenance.message.trim() : '';
    return {
        maintenance: {
            enabled: raw?.maintenance?.enabled === true,
            message: (message || DEFAULT_MAINTENANCE_MESSAGE).slice(0, MAX_MAINTENANCE_MESSAGE_LENGTH),
        },
        closed: raw?.closed === true,
    };
}
