export interface Payload {
	id: number;
	username: string;
	auth42Status: boolean;
	otpStatus: boolean;
}


//{ payload: { sub: 67, otp: true, iat: 12342134, exp: 112341243 } }