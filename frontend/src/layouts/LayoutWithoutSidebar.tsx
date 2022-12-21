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
        <Flex width={"100%"} height={"92vh"} bg={"pink"}>
          <main>{children}</main>
        </Flex>
      </Flex>
    </>
  );
}
