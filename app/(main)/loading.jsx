import PageLoader from '@/components/page-loader';

// Inside the (main) layout the header and footer stay on screen while the
// page content loads, so this uses the in-layout (non-fullscreen) variant.
export default function MainLoading() {
    return <PageLoader fullScreen={false} />;
}
