import { LoginButton } from "./login-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sand p-6 text-shadow">
      <h1 className="text-4xl font-bold text-sea-deep">surFriends</h1>
      <p className="text-mist">קהילת הגולשים של ישראל</p>
      <LoginButton />
    </main>
  );
}
