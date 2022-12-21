import { ReactNode } from "react";
import Header from "@/components/Header";
import { Flex } from "@chakra-ui/react";

type BasicLayoutProps = {
  children: ReactNode;
};

export default function BasicLayout({ children }: BasicLayoutProps) {
  const myUsername = "yopark";
  const styles = {
    BasicStyle: {
      width: "100%",
      height: "100vh",
      backgroundColor: "#4267b2",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
  };
  return (
    <>
      <Flex style={styles.BasicStyle}>
        <main>{children}</main>
      </Flex>
    </>
  );
}
