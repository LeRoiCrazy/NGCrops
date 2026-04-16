import { auth } from "@/auth";
import { closeSilo, getSiloById } from "@/infrastructure/silos";
import { z } from "zod";
import { ObjectId } from "mongodb";

const SellSiloSchema = z.object({
  prixVente: z.number().positive(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: siloId } = await params;
    const body = await request.json();
    const data = SellSiloSchema.parse(body);

    // Verify silo belongs to user
    const silo = await getSiloById(siloId);
    if (!silo) {
      return new Response(
        JSON.stringify({ error: "Silo not found", message: "Ce silo n'existe pas" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (silo.userId.toString() !== session.user.userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Tu n'as pas accès à ce silo" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (silo.status !== "OPEN") {
      return new Response(
        JSON.stringify({
          error: "Silo already closed",
          message: "Ce silo a déjà été vendu",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Close the silo and create trade
    const trade = await closeSilo(siloId, data.prixVente);

    return new Response(JSON.stringify(trade), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error selling silo:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          message: "Données invalides",
          details: error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message, message: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error", message: "Erreur serveur" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
