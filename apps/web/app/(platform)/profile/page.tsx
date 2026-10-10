import { api } from "@/lib/api";
import { ProfileManager } from "@/components/auth/profile-manager";

export default async function ProfilePage() {
  const session = await api.session();
  const sessions = await api.authSessions();
  return <ProfileManager session={session} sessions={sessions} />;
}
