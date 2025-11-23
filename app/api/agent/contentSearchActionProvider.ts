import { customActionProvider } from "@coinbase/agentkit";
import { searchContent, getContentByRootHash, getContentStats } from "@/lib/contentStorage";
import { downloadContentFrom0G } from "@/lib/contentDownloader";
import { z } from "zod";

/**
 * Schemas for content search actions
 */
const SearchContentSchema = z.object({
  query: z.string().describe("Search query or topic to find content (e.g., 'bitcoin', 'x402 protocol', 'blockchain payments')")
});

const GetContentByRootHashSchema = z.object({
  rootHash: z.string().describe("The rootHash of the content to download from 0G Storage")
});

const GetContentStatsSchema = z.object({});

/**
 * Custom Action Provider for x402 Content Search & Retrieval
 * Enables AI agent to search monetized content and download from 0G Storage
 */
export function contentSearchActionProvider() {
  return customActionProvider([
    {
      name: "search_content",
      description: "Search for monetized content by topic or keywords. Returns content metadata including rootHash, txHash, summary, and payment details. Use this to find content that users have uploaded and monetized.",
      schema: SearchContentSchema,
      invoke: async (args: z.infer<typeof SearchContentSchema>) => {
        try {
          const results = searchContent(args.query);
          
          if (results.length === 0) {
            return `No content found for query: "${args.query}". Try different keywords or broader search terms.`;
          }
          
          const resultsList = results.map((r, i) => 
            `${i + 1}. Summary: ${r.summary}\n   RootHash: ${r.rootHash}\n   TxHash: ${r.txHash}\n   Creator: ${r.wallet_address}\n   Amount: ${r.amount} tokens\n   Timestamp: ${r.timestamp}`
          ).join('\n\n');
          
          return `Found ${results.length} content item(s) matching "${args.query}":\n\n${resultsList}`;
        } catch (error) {
          return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    },
    {
      name: "get_content_by_roothash",
      description: "Download and retrieve the full content from 0G Storage using a rootHash. Use this after finding content with search_content to get the actual blog post or article content.",
      schema: GetContentByRootHashSchema,
      invoke: async (args: z.infer<typeof GetContentByRootHashSchema>) => {
        try {
          // First get metadata
          const metadata = getContentByRootHash(args.rootHash);
          
          if (!metadata) {
            return `No content found with rootHash: ${args.rootHash}. Make sure you're using the correct rootHash from search results.`;
          }
          
          // Download actual content from 0G
          const content = await downloadContentFrom0G(args.rootHash);
          
          if (!content) {
            return `Failed to download content from 0G Storage for rootHash: ${args.rootHash}. The content may be unavailable or the storage network may be down.`;
          }
          
          return `Content retrieved successfully!\n\nMetadata:\n- RootHash: ${metadata.rootHash}\n- TxHash: ${metadata.txHash}\n- Summary: ${metadata.summary}\n- Creator: ${metadata.wallet_address}\n- Amount: ${metadata.amount} tokens\n- Timestamp: ${metadata.timestamp}\n\nFull Content:\n${content}`;
        } catch (error) {
          return `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    },
    {
      name: "get_content_stats",
      description: "Get statistics about all monetized content including total content count, total earnings, and unique creators. Use this to show overall platform metrics.",
      schema: GetContentStatsSchema,
      invoke: async () => {
        try {
          const stats = getContentStats();
          
          return `Content Statistics:\n- Total Content: ${stats.totalContent} items\n- Total Earnings: ${stats.totalEarnings.toFixed(4)} tokens\n- Unique Creators: ${stats.uniqueWallets} wallets`;
        } catch (error) {
          return `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    }
  ]);
}
