import { NextRequest, NextResponse } from "next/server";
import { findRecipesByIngredients, getRecipeDetail } from "@/lib/apis/spoonacular";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const ingredients = searchParams.get("ingredients");

  try {
    if (id) {
      const recipe = await getRecipeDetail(Number(id));
      return NextResponse.json({ recipe });
    }

    if (!ingredients) {
      return NextResponse.json(
        { error: "Provide an 'ingredients' (comma-separated) or 'id' query param." },
        { status: 400 }
      );
    }

    const list = ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (list.length === 0) {
      return NextResponse.json({ error: "No valid ingredients provided." }, { status: 400 });
    }

    const recipes = await findRecipesByIngredients(list);
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("[/api/recipes]", error);
    return NextResponse.json(
      { error: "Recipe lookup failed. The Spoonacular API may be unavailable or its free quota exhausted." },
      { status: 502 }
    );
  }
}
