export function getJwtToken() {
  if (process.browser) {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map((cookie) => cookie.trim().split('='))
    );
    if ('accessToken' in cookies) {
      return cookies['accessToken'];
    }
  }
  return '';
}
