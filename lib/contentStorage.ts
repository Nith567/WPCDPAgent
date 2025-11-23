import fs from "fs";
import path from "path";

/**
 * Content metadata structure stored in JSON
 */
export interface ContentMetadata {
  rootHash: string;
  txHash: string;
  summary: string;
  wallet_address: string;
  amount: string;
  timestamp: string;
}

const STORAGE_FILE = path.join(process.cwd(), "temp", "content-metadata.json");

/**
 * Initialize storage file if it doesn't exist
 */
function initializeStorage(): void {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Get all stored content metadata
 */
export function getAllContent(): ContentMetadata[] {
  try {
    initializeStorage();
    const data = fs.readFileSync(STORAGE_FILE, "utf8");
    return JSON.parse(data) as ContentMetadata[];
  } catch (error) {
    console.error("Error reading content storage:", error);
    return [];
  }
}

/**
 * Save new content metadata
 *
 * @param metadata
 */
export function saveContent(metadata: ContentMetadata): boolean {
  try {
    initializeStorage();
    const allContent = getAllContent();

    // Check if rootHash already exists
    const exists = allContent.some(c => c.rootHash === metadata.rootHash);
    if (exists) {
      console.log("Content with this rootHash already exists");
      return false;
    }

    allContent.push(metadata);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(allContent, null, 2));
    console.log("Content metadata saved successfully:", metadata.rootHash);
    return true;
  } catch (error) {
    console.error("Error saving content metadata:", error);
    return false;
  }
}

/**
 * Search content by query (searches in summaries)
 *
 * @param query
 */
export function searchContent(query: string): ContentMetadata[] {
  try {
    const allContent = getAllContent();
    const queryLower = query.toLowerCase();

    // Simple keyword search in summaries
    return allContent.filter(content => content.summary.toLowerCase().includes(queryLower));
  } catch (error) {
    console.error("Error searching content:", error);
    return [];
  }
}

/**
 * Get content by rootHash
 *
 * @param rootHash
 */
export function getContentByRootHash(rootHash: string): ContentMetadata | null {
  try {
    const allContent = getAllContent();
    return allContent.find(c => c.rootHash === rootHash) || null;
  } catch (error) {
    console.error("Error getting content by rootHash:", error);
    return null;
  }
}

/**
 * Get content statistics
 */
export function getContentStats(): {
  totalContent: number;
  totalEarnings: number;
  uniqueWallets: number;
} {
  try {
    const allContent = getAllContent();
    const uniqueWallets = new Set(allContent.map(c => c.wallet_address));
    const totalEarnings = allContent.reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);

    return {
      totalContent: allContent.length,
      totalEarnings,
      uniqueWallets: uniqueWallets.size,
    };
  } catch (error) {
    console.error("Error getting content stats:", error);
    return { totalContent: 0, totalEarnings: 0, uniqueWallets: 0 };
  }
}
