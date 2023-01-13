import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, useEffect } from 'react';
import theme from './theme';
import '/styles/global.css';
import { ChakraProvider } from '@chakra-ui/react';

import { useRouter } from 'next/router';
import { getJwtToken } from '@/utils/getJwtToken';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  // const { socket: gameSocket, makeSocket } = gameStore();

  // FIXME: App은 로그인 안 했을 때의 페이지도 포함인데, 여기 넣는게 맞나?
  // useEffect(() => {
  //   sleep(300).then(() => {
  //     if (gameSocket === undefined || gameSocket.connected === false) {
  //       console.log('Socket Making!');
  //       makeSocket();
  //     }
  //   });
  // }, [gameSocket]);

  // TODO: beforeunload일 때 처리 어떻게 하지..?
  const router = useRouter();
  const token = getJwtToken();
  // 토큰이없을때 맨 앞 페이지로 연결
  // useEffect(() => {
  //   if (token === '') router.replace('/');
  // }, []);
  useEffect(() => {
    router.beforePopState((e) => {
      var pos = window.location.href.indexOf('/game/');
      if (pos !== -1) router.replace('/');
      else router.replace(window.location.href);
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} key={router.asPath} />)}
    </ChakraProvider>
  );
}
