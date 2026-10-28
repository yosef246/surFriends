import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { signOut } from "../actions";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ComingSoon title="הגדרות" />
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          <LogOut aria-hidden />
          התנתקות
        </Button>
      </form>
    </div>
  );
}
