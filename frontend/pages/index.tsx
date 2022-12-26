import MainLayout from "@/layouts/MainLayout";
import Head from "next/head";
import { ReactElement, useEffect, useState } from "react";
import {
    Center,
    Flex,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    VStack,
    Button,
} from "@chakra-ui/react";
import { CustomButton } from "@/components/CustomButton";
import { SERVER_URL } from "@/variables";
import { userStore } from "@/store/storeMe";
export default function LandingPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [timeSpent, setTimeSpent] = useState<number>(1);

    useEffect(() => {
        const cookies = Object.fromEntries(
            document.cookie.split(";").map((cookie) => cookie.trim().split("="))
        );

        const jwtToken: string = `Bearer ${cookies["accessToken"]}`;
        const headers = {
            Authorization: jwtToken,
            "Content-Type": "application/json",
        };
        fetch(SERVER_URL + "/user/me", { headers }).then((res) => {
            if (!res.ok) {
                console.log(res);
            }
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(
            () => setTimeSpent((cur) => cur + 1),
            1000
        );
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeSpent(1);
        }
    }, [isOpen]);

    const { userData, setUserData } = userStore();

    const tmpUser = {
        name: "cmoon",
        imgUrl: "kkkk",
        status: 2,
        rating: 333,
        winCnt: 1222,
        loseCnt: 999,
        useOtp: false,
    };
    return (
        <>
            <Head>
                <title>LastPong</title>
                <meta
                    name="description"
                    content="ft_transcendence project in 42 Seoul"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Button
                onClick={() => {
                    console.log(userData);
                    setUserData(tmpUser);
                    console.log(userData);
                }}
            >
                User Data
            </Button>
            <Flex
                height={"100%"}
                flexDir={"column"}
                alignItems="center"
                justifyContent={"center"}
            >
                <Image
                    src="/HowToPlay.png"
                    height="90%"
                    alt="How To Play LastPong"
                />
                <CustomButton
                    size="lg"
                    onClick={onOpen}
                    btnStyle={{
                        position: "absolute",
                        top: "82%",
                        left: "42%",
                        transform: "translate(-50%, -50%)",
                        height: "10%",
                        width: "10%",
                        fontSize: "40px",
                    }}
                >
                    MATCH
                </CustomButton>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="main" color="white">
                    <Center>
                        <VStack>
                            <ModalHeader>
                                LOOKING FOR AN OPPONENT...
                            </ModalHeader>
                            <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
                            <ModalFooter>
                                <CustomButton size="md" onClick={onClose}>
                                    CANCEL
                                </CustomButton>
                            </ModalFooter>
                        </VStack>
                    </Center>
                </ModalContent>
            </Modal>
        </>
    );
}

LandingPage.getLayout = function (page: ReactElement) {
    return <MainLayout>{page}</MainLayout>;
};
