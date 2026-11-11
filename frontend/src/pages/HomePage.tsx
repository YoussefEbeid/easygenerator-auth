import Button from "../components/Button";
import { useAuth } from "../features/auth/auth-context";
export default function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="home">
      <header className="home-header">
        <span className="brand brand-dark">Fieldnotes</span>
        <div className="home-user">
          <span className="muted">{user?.email}</span>
          <Button variant="ghost" onClick={() => void signOut()}>
            Log out
          </Button>
        </div>
      </header>

      <main className="home-main">
        <p className="eyebrow">Hello, {user?.name}</p>
        <h1>Welcome to the application.</h1>
      </main>
    </div>
  );
}
