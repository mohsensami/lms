'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html lang="fa" dir="rtl">
            <body>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        textAlign: 'center',
                        padding: '64px 16px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>خطای بحرانی در برنامه رخ داده است</h2>
                    <p style={{ maxWidth: '400px', color: '#6b7280', fontSize: '14px' }}>
                        متأسفانه در بارگذاری کلی برنامه مشکلی پیش آمد.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            backgroundColor: '#000',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        تلاش دوباره
                    </button>
                </div>
            </body>
        </html>
    );
}
