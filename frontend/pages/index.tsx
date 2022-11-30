import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import {useRouter} from 'next/router'

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>트센</title>
      </Head>

      <h1>메인 페이지</h1>
      <button onClick={()=>router.push('/login')}>로그인 하기</button>
    </>
  )
}
