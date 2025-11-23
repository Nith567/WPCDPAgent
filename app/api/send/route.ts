import { NextResponse } from "next/server";
import * as ethers from "ethers";
import { OpenAI } from "openai";
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import * as fs from "fs";
import * as path from "path";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { saveContent } from "@/lib/contentStorage";
import { clearConfigCache } from "prettier";

interface UploadRequest {
  content: string;
  wallet_address: string;
  amount?: string;
}


const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

const INITIAL_FUND_AMOUNT = 10;

const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai';

export async function queryAI(prompt: string): Promise<string | null> {
  try {
    console.log("🔥 queryAI starting bro...");

    // -----------------------------
    // WALLET + BROKER
    // -----------------------------
    const privateKey = process.env.ZG_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing ZG_PRIVATE_KEY bro");

    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    console.log("🔑 Wallet:", wallet.address);

    // -----------------------------
    // LEDGER - AUTO TOP UP
    // -----------------------------
    const MIN_REQUIRED = 12 // 15 ZG
    console.log("📘 Checking ledger...");

    let ledger = await broker.ledger.getLedger();
    let balance = BigInt(ledger[1] ?? 0n);

    console.log("💰 Current ledger balance:", balance.toString());

try {
      await broker.ledger.depositFund(10);
}

catch (err){
  console.log ('err   r', err);
}
    // Refresh ledger
    ledger = await broker.ledger.getLedger();
    balance = BigInt(ledger[1] ?? 0n);
    console.log("💵 Ledger after top-up:", balance.toString());

    // -----------------------------
    // PROVIDER
    // -----------------------------
    const selectedProvider = OFFICIAL_PROVIDERS["deepseek-r1-70b"];
    console.log("🤖 Using provider:", selectedProvider);

    // ACK PROVIDER
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
      console.log("📩 Provider acknowledged");
    } catch (err: any) {
      if (err?.message?.includes("already acknowledged")) {
        console.log("✔️ Provider already acknowledged");
      } else {
        throw err;
      }
    }

    // -----------------------------
    // METADATA + HEADERS
    // -----------------------------
    const { endpoint, model } =
      await broker.inference.getServiceMetadata(selectedProvider);

    console.log("🌐 Endpoint:", endpoint, "🧠 Model:", model);

    const headers =
      await broker.inference.getRequestHeaders(selectedProvider, prompt);

    const requestHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") requestHeaders[k] = v;
    }

    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "",
    });

    // -----------------------------
    // AI COMPLETION
    // -----------------------------
    console.log("🚀 Sending prompt:", prompt);

    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "user", content: prompt }],
        model,
      },
      { headers: requestHeaders }
    );

    const aiResponse = completion.choices[0].message.content ?? "";
    const chatId = completion.id;

    console.log("🧾 AI Response:", aiResponse);

    // -----------------------------
    // PROCESS RESPONSE
    // -----------------------------
    try {
      await broker.inference.processResponse(
        selectedProvider,
        aiResponse,
        chatId
      );
    } catch (err) {
      console.log("⚠️ processResponse error ignored:", err);
    }

    console.log("✅ queryAI finished clean bro");
    return aiResponse;

  } catch (error) {
    console.error("💥 queryAI crashed bro:", error);
    return null;
  }
}




export async function generateContentSummary(
  blogContent: string
): Promise<string | null> {
  try {
    const prompt = `
Provide a concise **3-4 sentence summary** of the following blog content.
Focus only on the main ideas and key insights:

${blogContent}
    `;

    return await queryAI(prompt);
  } catch (error) {
    console.error("Summary generation error:", error);
    return null;
  }
}

async function uploadContentTo0G(content: string): Promise<{ rootHash: string; transactionHash: string } | null> {
  try {
    const privateKey = process.env.ZG_PRIVATE_KEY ;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    
    // Create indexer instance
    const indexer = new Indexer(INDEXER_RPC);
    
    // Create a temporary file to store content
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `content-${Date.now()}.txt`);
    fs.writeFileSync(tempFilePath, content, 'utf8');
    
    try {
      // Create ZgFile from content
      const zgFile = await ZgFile.fromFilePath(tempFilePath);
      const [tree, treeErr] = await zgFile.merkleTree();
      
      if (treeErr !== null) {
        throw new Error(`Error generating Merkle tree: ${treeErr}`);
      }

      // Upload file with new API syntax
      const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

      if (uploadErr !== null) {
        throw new Error(`Upload error: ${uploadErr}`);
      }

      await zgFile.close();
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      return {
        rootHash: tree?.rootHash() ?? '',
        transactionHash: String(tx) || ''
      };
    } catch (error) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  } catch (error) {
    console.error('0G upload error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { content: blogContent, wallet_address, amount } = await req.json() as UploadRequest;
    
    console.log("Received content:", blogContent);
    console.log("Received wallet_address:", wallet_address);
    console.log("Received amount:", amount);

    if (!blogContent) {
      return NextResponse.json({ message: "Content is required." }, { status: 400 });
    }

    if (!wallet_address) {
      return NextResponse.json({ message: "Wallet address is required." }, { status: 400 });
    }

    console.log("Uploading content to 0G Storage...");
    const storageResult = await uploadContentTo0G(blogContent);
    
    if (!storageResult) {
      return NextResponse.json({ message: "Failed to upload content to 0G Storage." }, { status: 500 });
    }
    
    console.log("0G Storage response:", storageResult);

    console.log("Generating summary with AI...");
    const aiSummary = await generateContentSummary(blogContent);
    console.log("AI Summary:", aiSummary);

    console.log("Blog Content uploaded successfully");

    // Save metadata to storage for AI agent search
    const saved = saveContent({
      rootHash: storageResult.rootHash,
      txHash: storageResult.transactionHash,
      summary: aiSummary || "No summary available",
      wallet_address: wallet_address,
      amount: amount || "0",
      timestamp: new Date().toISOString()
    });

    if (saved) {
      console.log("Content metadata saved successfully for AI agent");
    } else {
      console.warn("Failed to save content metadata (may already exist)");
    }

 console.log('response as :  rootHash=', storageResult.rootHash, ' txHash=', storageResult.transactionHash, ' roothash ', storageResult.rootHash,'  aisumary is ', aiSummary, ' wallet_address is ', wallet_address, ' amount is ', amount);
    return NextResponse.json({
      message: "Content monetized successfully!",
      txHash: storageResult.transactionHash,
      rootHash: storageResult.rootHash,
      aiSummary: aiSummary || "Summary generation failed",
      wallet_address: wallet_address,
      amount: amount || 0,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}


