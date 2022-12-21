import Link from 'next/link';

export default function Header() {
  const myUsername = 'yopark';

  return (
    <header>
      <ul>
        <li>
          <Link href="/">LASTPONG</Link>
        </li>
        <li>
          <Link href="/chat">CHAT</Link>
        </li>
        <li>
          <Link href="/watch">WATCH</Link>
        </li>
        <li>
          <Link href={`/user/${myUsername}`}>Profile</Link>
        </li>
      </ul>
    </header>
  );
}
