import Link from 'next/link';
import ChatPage from 'pages/chat';
import { Flex, Box, Text, Image, Spacer, Circle, HStack } from '@chakra-ui/react';
// import { useState, useRef } from 'react';
import useLoginStore from '@/store/useLoginStore';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import CustomAvatar from './CustomAvatar';

export default function Header() {
  const user: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  return (
    <Flex
      h="10%"
      px={10}
      justifyContent="space-between"
      alignItems="center"
      color="white"
      bg="main"
    >
      <Box mx={10}>
        <Link href="/">
          <Text fontSize="3xl">LASTPONG</Text>
        </Link>
      </Box>
      <Box mx={5}>
        <Link href="/chat">CHAT</Link>
      </Box>
      <Box mx={5}>
        <Link href="/watch">WATCH</Link>
      </Box>
      <Spacer />
      <Box mx={5}>
        <Link href={`/user/${user.name}`}>
          <CustomAvatar url={user.imgUrl} size="md" />
        </Link>
      </Box>
      <Box mx={5}>
        <Link href={`/user/${user.name}`}>{user.name.toUpperCase()}</Link>
      </Box>
      <Box mx={5}>
        <HStack>
          <Text fontSize="sm">OTP</Text>
          <Circle size="10px" bg={user.useOtp ? 'online' : 'offline'}></Circle>
        </HStack>
      </Box>
      <Box mx={5}>
        <Link href="/auth/logout">
          <Image src="/Logout.png" />
        </Link>
      </Box>
    </Flex>
  );

  // const myUsername = 'yopark';

  // const styles = {
  //   MainHeader: {
  //     width: '100%',
  //     height: '10%',
  //     backgroundColor: '#4267b2',
  //   } as React.CSSProperties,

  //   HeaderLeft: {
  //     width: '77%',
  //     float: 'left',
  //     flexDirection: 'row',
  //   } as React.CSSProperties,

  //   HeaderRight: {
  //     width: '23%',
  //     height: '100%',
  //     float: 'left',
  //     flexDirection: 'row',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //   } as React.CSSProperties,

  //   HeaderTitleBox: {
  //     width: '20%',
  //     height: '100%',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //   } as React.CSSProperties,

  //   HeaderTitle: {
  //     fontSize: '40px',
  //     color: 'white',
  //     textAlign: 'center',
  //     margin: '0',
  //     textDecoration: 'none',
  //     textDecorationColor: '#4267b2',
  //   } as React.CSSProperties,

  //   HeaderMiniBox: { width: '160px', height: '100%' } as React.CSSProperties,
  //   HeaderMiniText: {
  //     fontSize: '25px',
  //     color: 'white',
  //     textAlign: 'center',
  //     margin: '0',
  //     padding: '30px 0',
  //   } as React.CSSProperties,

  //   HeaderOtpBox: {
  //     width: '10px',
  //     backgroundColor: 'Black',
  //     height: '10px',
  //     borderRadius: '100',
  //     marginTop: '30px',
  //     marginLeft: '15px',
  //   } as React.CSSProperties,
  // };

  // const { otpCheck, name, avatarImg, setOtpCheck } = useLoginStore();
  // const otpBoxRef = useRef<HTMLDivElement>(null);

  // if (otpBoxRef.current !== null) {
  //   if (otpCheck) {
  //     otpBoxRef.current.style.backgroundColor = 'red';
  //   } else otpBoxRef.current.style.backgroundColor = 'lime';
  // } // function setOtpValue() {}

  // const otpOnclick = () => {
  //   if (otpCheck) {
  //     setOtpCheck(0);
  //   } else {
  //     setOtpCheck(1);
  //   }
  // };

  // return (
  //   <Flex style={styles.MainHeader}>
  //     <Flex style={styles.HeaderLeft}>
  //       <Flex style={styles.HeaderTitleBox}>
  //         <Link href="/">
  //           <Text style={styles.HeaderTitle}>LASTPONG</Text>
  //         </Link>
  //       </Flex>
  //       <Box style={styles.HeaderMiniBox}>
  //         <Link href="/chat">
  //           <h1 style={styles.HeaderMiniText}>CHAT</h1>
  //         </Link>
  //       </Box>
  //       <Box style={styles.HeaderMiniBox}>
  //         <Link href="/watch">
  //           <h1 style={styles.HeaderMiniText}>WATCH</h1>
  //         </Link>
  //       </Box>
  //     </Flex>
  //     <Flex style={styles.HeaderRight}>
  //       <Flex
  //         height="85px"
  //         width={'85px'}
  //         borderRadius={'100px'}
  //         bg={'white'}
  //         alignItems={'center'}
  //         justifyContent={'center'}
  //         marginRight={'30px'}>
  //         <Avatar
  //           src={avatarImg}
  //           maxHeight={'100%'}
  //           maxWidth={'100%'}
  //           borderRadius={'100px'}
  //           bg={'white'}
  //         />
  //       </Flex>
  //       <Flex width={'40%'}>
  //         <Link href={`/user/${myUsername}`}>
  //           <h1 style={styles.HeaderMiniText}>{name}</h1>
  //         </Link>
  //       </Flex>
  //       <Flex width={'25%'} justifyContent={'center'}>
  //         <Text style={styles.HeaderMiniText}>OTP</Text>
  //         <Box style={styles.HeaderOtpBox} ref={otpBoxRef} />
  //         <Button onClick={otpOnclick}>OTP</Button>
  //       </Flex>
  //       <Image src={'/Logout.png'} boxSize={'25px'} marginTop={'10px'} />
  //     </Flex>
  //   </Flex>
  // );
}
