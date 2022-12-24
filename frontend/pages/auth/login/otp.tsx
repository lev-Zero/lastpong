import OtpWindow from "@/components/OtpWindow";
import BasicLayout from "@/layouts/BasicLayout";
import { ReactElement } from "react";

interface OtpPageProps {
  src: string;
}

export default function OtpPage({ src }: OtpPageProps) {
  return <OtpWindow src={src} />;
}

OtpPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
