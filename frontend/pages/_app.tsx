import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import theme from './theme';
import '/styles/global.css';
import { ChakraProvider } from '@chakra-ui/react';

import { useRouter } from 'next/router';

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

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} key={router.asPath} />)}
    </ChakraProvider>
  );
}
