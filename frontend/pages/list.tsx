import {useRouter} from 'next/router'


export default function List() {
	const router = useRouter();

	return (
	  <div>
		<h1>할 것 고르기</h1>
		<button onClick={()=>router.push('/game')}>게임</button>
		<button onClick={()=>router.push('/chat')}>채팅</button>
	  </div>
	)
  }