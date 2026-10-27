import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand p-6 text-shadow">
      <h1 className="text-2xl font-bold text-sea-deep">
        שלום{name ? `, ${name}` : ""}
      </h1>
      <p className="font-mono text-sm text-mist" dir="ltr">
        {user?.email}
      </p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          התנתקות
        </Button>
      </form>
    </main>
  );
}
