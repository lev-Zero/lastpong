import BasicLayout from '@/layouts/BasicLayout';
import { Center } from '@chakra-ui/react';
import { ReactElement } from 'react';

export default function NotFoundPage() {
  return <Center fontSize="4xl">THIS PAGE COULD NOT FOUND 😱 404 </Center>;
}

NotFoundPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
