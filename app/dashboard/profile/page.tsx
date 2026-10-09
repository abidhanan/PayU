import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Profil</h1>
        <p className="mt-2 muted">Kelola informasi dan keamanan akunmu.</p>
      </div>
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          bio: user.bio ?? "",
          avatarColor: user.avatarColor,
          image: user.image,
          hasPassword: !!user.passwordHash,
        }}
      />
    </div>
  );
}
