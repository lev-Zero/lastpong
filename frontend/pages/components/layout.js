import DefaultHeader from './header'
import DefaultFooter from './footer'

export default function DefaultLayout({children}) {
	return (
	  <div>
		{/* 해당 layout에서 공통으로 사용되는 Header를 선언해준다. */}
		<DefaultHeader/>
		  {/* Content 영역 */}
		  <main>
			{/* children이 있을경우는 children을 없을 경우에는 Outlet을 나타내준다 */}
			{children}
			{/* {children || <Outlet/>} */}
		  </main>
		{/* 해당 layout에서 공통으로 사용되는 Footer를 선언해준다. */}
		<DefaultFooter/>
	  </div>
	);
  }