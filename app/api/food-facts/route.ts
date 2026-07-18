import { NextRequest, NextResponse } from "next/server";
import { getProductByBarcode, searchProducts } from "@/lib/apis/openFoodFacts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get("barcode");
  const query = searchParams.get("q");

  try {
    if (barcode) {
      const product = await getProductByBarcode(barcode);
      return NextResponse.json({ product });
    }

    if (query) {
      const products = await searchProducts(query);
      return NextResponse.json({ products });
    }

    return NextResponse.json(
      { error: "Provide a 'barcode' or 'q' query param." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[/api/food-facts]", error);
    return NextResponse.json(
      { error: "Product lookup failed. Open Food Facts may be temporarily unavailable." },
      { status: 502 }
    );
  }
}
