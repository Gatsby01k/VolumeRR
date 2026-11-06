import { NextRequest, NextResponse } from "next/server";
import { openStore, receiptForToken } from "@/lib/server/store";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const token = request.cookies.get("vr_receipt")?.value;
  if (!token)
    return NextResponse.json(
      { kind: "missing" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  const db = openStore();
  try {
    const receipt = receiptForToken(db, token);
    return NextResponse.json(receipt || { kind: "missing" }, {
      status: receipt ? 200 : 404,
      headers: { "Cache-Control": "no-store" },
    });
  } finally {
    db.close();
  }
}
