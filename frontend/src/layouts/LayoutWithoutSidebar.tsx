import { ReactNode } from "react";
import Header from "@/components/Header";
import { Flex } from "@chakra-ui/react";

type LayoutWithoutSidebarProps = {
  children: ReactNode;
};

export default function LayoutWithoutSidebar({
  children,
}: LayoutWithoutSidebarProps) {
  return (
    <>
      <Flex flexDir={"column"} bg={"gold"}>
        <Header />
        <Flex width={"100%"} height={"92vh"} bg={"#D9D9D9"}>
          <main>{children}</main>
        </Flex>
      </Flex>
    </>
  );
}
