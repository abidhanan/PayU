import { getCurrentUser } from "@/lib/session";
import { availableTokens } from "@/lib/tokens";
import { Navbar } from "./navbar";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <Navbar
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role as "ADMIN" | "SPONSOR" | "SEEKER",
              avatarColor: user.avatarColor,
              image: user.image,
              tokens: availableTokens(user),
            }
          : null
      }
    />
  );
}
