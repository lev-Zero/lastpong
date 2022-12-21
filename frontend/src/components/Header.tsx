import Link from "next/link";
import ChatPage from "pages/chat";
import {
  Flex,
  Box,
  Text,
  Avatar,
  Image,
  textDecoration,
} from "@chakra-ui/react";
import useLoginStore from "@/store/useLoginStore";

export default function Header() {
  const myUsername = "yopark";

  const styles = {
    MainHeader: {
      width: "100%",
      height: "8vh",
      minHeight: "60px",
      backgroundColor: "#4267b2",
    } as React.CSSProperties,

    HeaderLeft: {
      width: "77%",
      float: "left",
      flexDirection: "row",
    } as React.CSSProperties,

    HeaderRight: {
      width: "23%",
      height: "100%",
      float: "left",
      flexDirection: "row",
    } as React.CSSProperties,

    HeaderTitleBox: {
      width: "20%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,

    HeaderTitle: {
      fontSize: "40px",
      fontFamily: "Knewave",
      color: "white",
      textAlign: "center",
      margin: "0",
      textDecoration: "none",
      textDecorationColor: "#4267b2",
    } as React.CSSProperties,

    HeaderMiniBox: { width: "160px", height: "100%" } as React.CSSProperties,
    HeaderMiniText: {
      fontSize: "25px",
      fontFamily: "Knewave",
      color: "white",
      textAlign: "center",
      margin: "0",
      padding: "30px 0",
    } as React.CSSProperties,

    HeaderOtpBox: {
      width: "10px",
      backgroundColor: "lime",
      height: "10px",
      borderRadius: "100",
      marginTop: "30px",
      marginLeft: "15px",
    } as React.CSSProperties,
  };

  const { name, avatarImg } = useLoginStore();

  return (
    <header>
      <Flex style={styles.MainHeader}>
        <Flex style={styles.HeaderLeft}>
          <Flex style={styles.HeaderTitleBox}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Text style={styles.HeaderTitle}>LASTPANG</Text>
            </Link>
          </Flex>
          <Box style={styles.HeaderMiniBox}>
            <Link href="/chat" style={{ textDecoration: "none" }}>
              <h1 style={styles.HeaderMiniText}>CHAT</h1>
            </Link>
          </Box>
          <Box style={styles.HeaderMiniBox}>
            <Link href="/watch" style={{ textDecoration: "none" }}>
              <h1 style={styles.HeaderMiniText}>WATCH</h1>
            </Link>
          </Box>
        </Flex>
        <Flex style={styles.HeaderRight}>
          <Avatar src={avatarImg} size={"lg"} />
          <Flex width={"40%"}>
            <Link
              href={`/user/${myUsername}`}
              style={{ textDecoration: "none" }}
            >
              <h1 style={styles.HeaderMiniText}>{name}</h1>
            </Link>
          </Flex>
          <Flex width={"30%"} justifyContent={"center"}>
            <Text style={styles.HeaderMiniText}>OTP</Text>
            <Box style={styles.HeaderOtpBox} />
          </Flex>
          <Image
            src={"/Logout.png"}
            boxSize={"25px"}
            marginLeft={"20px"}
            marginTop={"35px"}
          />
        </Flex>
      </Flex>
    </header>
  );
}
