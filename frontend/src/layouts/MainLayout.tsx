import { ReactNode } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Flex } from "@chakra-ui/react";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Flex flexDir={"column"} bg={"gold"}>
        <Header />
        <Flex width={"100%"} height={"92vh"} bg={"pink"}>
          <Flex width={"77%"} height={"100%"} bg={"teal"}>
            <main>{children}</main>
          </Flex>
          <Flex width={"23%"} height={"100%"} bg={"red"}>
            <Sidebar />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
