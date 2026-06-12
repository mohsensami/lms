import { Button } from "@/components/ui/button";

export const DownloadCertificate = ({ courseId, totalProgress }) => {
  return (
    <Button disabled={totalProgress < 100} className="w-full mt-6">
      Download Certificate
    </Button>
  );
};
