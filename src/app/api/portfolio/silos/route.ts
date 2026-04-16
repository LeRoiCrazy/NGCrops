import { auth } from "@/auth";
import { createSilo } from "@/infrastructure/silos";
import { ObjectId } from "mongodb";
import { z } from "zod";

const CreateSiloSchema = z.object({
  cropName: z.string().min(1),
  quantité: z.number().positive(),
  prixAchat: z.number().positive(),
  dateAchat: z.string().or(z.date()),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const data = CreateSiloSchema.parse(body);

    const silo = await createSilo(
      new ObjectId(session.user.userId),
      data.cropName,
      data.quantité,
      data.prixAchat,
      new Date(data.dateAchat)
    );

    return new Response(JSON.stringify(silo), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating silo:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
