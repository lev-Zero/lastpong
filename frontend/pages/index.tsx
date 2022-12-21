import MainLayout from "@/layouts/MainLayout";
import Head from "next/head";
import { ReactElement, useState } from "react";
import { Image } from "@chakra-ui/react";
import Modal from "@/components/modal/Modal";
import { CustomButton } from "@/components/CustomButton";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleModalOpen = () => {
    setIsModalOpen((cur) => !cur);
  };

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta
          name="description"
          content="ft_transcendence project in 42 Seoul"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Image src="/HowToPlay.png" height="90%" alt="How To Play LastPong" />
      <CustomButton size="lg" onClick={toggleModalOpen}>
        MATCH
      </CustomButton>
      {isModalOpen ? <Modal closed={toggleModalOpen} /> : null}
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
