import { LoginForm } from "./_components/login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

// `?closed=1` is added by the middleware when a guest tried to open a page
// while the site is closed to visitors (Settings -> وضعیت سایت).
const LoginPage = async ({ searchParams }) => {
  const { closed } = (await searchParams) ?? {};

  return (
    <div className="w-full flex-col min-h-[calc(100vh-var(--banner-h,0px))] flex items-center justify-center gap-4 py-8">
      <div className="container">
        {closed && (
          <Alert className="mx-auto mb-4 max-w-md">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              سایت در حال حاضر فقط برای کاربران واردشده در دسترس است. لطفاً وارد حساب کاربری خود شوید.
            </AlertDescription>
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
};
export default LoginPage;
