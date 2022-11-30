import {useRouter} from 'next/router'


export default function Login() {
	const router = useRouter();

	return (
	  <div>
		<h1>로그인 페이지</h1>
		<button onClick={()=>router.push('/list')}>로그인 성공</button>
		<button onClick={()=>router.push('/')}>로그인 실패</button>
	  </div>
	)
  }