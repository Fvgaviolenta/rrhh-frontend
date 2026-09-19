import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  redirect(session ? "/sesion" : "/ingresar");
}
