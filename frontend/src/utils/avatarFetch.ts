import { SERVER_URL } from './variables';

export async function avatarFetch(method: string, path: string) {
  method = method.toUpperCase();
  if (path[0] !== '/') {
    path = `/${path}`;
  }
  const headers: { [key: string]: string } = {
    'Content-Type': 'image/*',
  };
  const cookies = Object.fromEntries(
    document.cookie.split(';').map((cookie) => cookie.trim().split('='))
  );
  if ('accessToken' in cookies) {
    const bearerToken: string = cookies['accessToken'];
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  const response = await fetch(SERVER_URL + path, {
    method: method,
    headers: headers,
  });
  const reader = response.body?.getReader();
  const stream = await new ReadableStream({
    start(controller) {
      function pump() {
        return reader?.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pump();
          return;
        });
      }
      return pump();
    },
  });
  const newResponse = await new Response(stream);
  const blob = await newResponse.blob();
  const url = await URL.createObjectURL(blob);
  return url;
}
