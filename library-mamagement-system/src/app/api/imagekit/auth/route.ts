import { imagekit } from "@/src/lib/imagekit";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(imagekit.getAuthenticationParameters());
}