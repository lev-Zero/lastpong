import { Button, Flex, Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";

export default function MainPage() {
    const [modalIsOpen, setModalIsOpen] = useState<boolean>();

    useEffect(() => {
        setModalIsOpen(false);
    }, []);

    const showModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <>
            <Flex width={"150%"}>
                <Button
                    style={{
                        position: "absolute",
                        left: "30%",
                        top: "80%",
                        width: "13%",
                        height: "10%",
                        fontSize: "500%",
                        color: "white",
                        backgroundColor: "#4267b2",
                        borderColor: "black",
                        border: "5px",
                        borderStyle: "solid",
                        borderWidth: "3px",
                        borderRadius: "60px",
                    }}
                    _active={{
                        transform: "scale(0.95)",
                    }}
                    onClick={showModal}
                >
                    MATCH
                </Button>
                <Image src="/HowToPlay.png" alt="Image error" width={"150%"} />
            </Flex>
            {modalIsOpen ? <Modal closed={closeModal} /> : null}
        </>
    );
}

/*
    <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Lorem count={2} />
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
                </Button>
                <Button variant='ghost'>Secondary Action</Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
*/
