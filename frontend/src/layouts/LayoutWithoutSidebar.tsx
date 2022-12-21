import { ReactNode } from 'react';
import Header from '@/components/Header';

type LayoutWithoutSidebarProps = {
  children: ReactNode;
};

export default function LayoutWithoutSidebar({ children }: LayoutWithoutSidebarProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
