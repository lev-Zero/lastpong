import DefaultHeader from './header'
import DefaultFooter from './footer'
import { io } from "socket.io-client";

export default function DefaultLayout({ children }) {
	console.log("hi")	
	const socket = io.connect("ws://localhost:3000/chat", {	
		cors: { origin: '*' },
		extraHeaders: {
			"authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJmYWtlX1UxIiwiYXV0aDQyU3RhdHVzIjp0cnVlLCJvdHBTdGF0dXMiOnRydWUsImlhdCI6MTY3MDg0MjI4NywiZXhwIjoxNjcwOTI4Njg3fQ.tz5ih73ebDBDlrafck78qLgU8kaNYAGcVAqJSfYDaPk"
		}

	});
	socket.on("connection",(data)=> console.log(data))
	socket.emit("chatRoomAll");
	socket.on("chatRoomAll", (data) => console.log(data))

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