import { Link } from 'react-router';
export function loader() {
  throw new Response('Page not found', { status: 404 });
}
export default function Route() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </main>
  );
}
