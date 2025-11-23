import { Indexer } from "@0glabs/0g-ts-sdk";
import * as fs from "fs";
import * as path from "path";

const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai';

/**
 * Download content from 0G Storage by rootHash
 */
export async function downloadContentFrom0G(rootHash: string): Promise<string | null> {
  try {
    const indexer = new Indexer(INDEXER_RPC);
    
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const outputPath = path.join(tempDir, `download-${Date.now()}.txt`);
    
    // Download with Merkle proof verification
    const downloadErr = await indexer.download(rootHash, outputPath, true);
    
    if (downloadErr !== null) {
      throw new Error(`Download error: ${downloadErr}`);
    }
    
    // Read the downloaded content
    const content = fs.readFileSync(outputPath, 'utf8');
    
    // Clean up temp file
    fs.unlinkSync(outputPath);
    
    console.log("Download successful for rootHash:", rootHash);
    return content;
  } catch (error) {
    console.error('0G download error:', error);
    return null;
  }
}
