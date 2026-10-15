import { LoginScreen } from "./login-screen";
import { resolveLoginVariant } from "./login-variant";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { login } = await searchParams;
  return <LoginScreen variant={resolveLoginVariant(login)} />;
}
