import OtpWindow from "@/components/OtpWindow";
import BasicLayout from "@/layouts/BasicLayout";
import { ReactElement } from "react";

export default function OtpPage() {
    return <OtpWindow />;
}

OtpPage.getLayout = function (page: ReactElement) {
    return <BasicLayout>{page}</BasicLayout>;
};
