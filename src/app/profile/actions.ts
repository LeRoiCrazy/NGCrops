"use server";

import { signOut } from "@/auth";
import { deleteUserSessions } from "@/infrastructure/sessions";
import { auth } from "@/auth";

export async function globalSignOut() {
  const session = await auth();
  
  if (!session?.user?.userId) {
    throw new Error("Utilisateur non authentifié");
  }

  try {
    // Supprimer toutes les sessions de l'utilisateur
    await deleteUserSessions(session.user.userId);
    
    // Rediriger vers la page de connexion
    await signOut({ redirectTo: "/auth/signin" });
  } catch (error) {
    console.error("Erreur lors de la déconnexion globale:", error);
    throw new Error("Impossible de se déconnecter globalement");
  }
}
