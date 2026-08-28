import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { HOME_SLIDES_CACHE_TAG } from "@/lib/home-slides";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(HOME_SLIDES_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}