import { NextRequest, NextResponse } from "next/server";
import { downloadContentFrom0G } from "@/lib/contentDownloader";
import { getContentByRootHash } from "@/lib/contentStorage";

export const dynamic = "force-dynamic";

/**
 * Simple content endpoint - no x402, just direct content delivery
 *
 * @param request - The incoming HTTP request
 * @param root0 - The route parameters object
 * @param root0.params - Promise containing the route parameters
 * @returns JSON response with content or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rootHash: string }> },
) {
  const { rootHash } = await params;

  const contentMeta = getContentByRootHash(rootHash);
  if (!contentMeta) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // Download content from 0G Storage
  try {
    console.log("=== DOWNLOADING CONTENT FROM 0G STORAGE ===");
    const content = await downloadContentFrom0G(rootHash);
    console.log("✅ Content downloaded successfully");

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        summary: contentMeta.summary,
        creator: contentMeta.wallet_address,
        price: contentMeta.amount,
        txHash: contentMeta.txHash,
      },
    });
  } catch (error) {
    console.error("❌ Failed to download content:", error);
    return NextResponse.json({ error: `Failed to download content: ${error}` }, { status: 500 });
  }
}
