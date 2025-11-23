"use client";

import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { getCurrentUser, toViemAccount } from "@coinbase/cdp-core";
import { createWalletClient, http, publicActions, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { useMemo, useState, useCallback } from "react";
import { useAccount, useSendTransaction, useReadContract } from "wagmi";
import { Button } from "@coinbase/cdp-react/components/ui/Button";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";
import { formatUnits } from "viem";
import { FundModal, type FundModalProps } from "@coinbase/cdp-react";
import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api";

// USDC Contract ABI for Base Sepolia
const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showActions?: boolean; // For showing Continue/Cancel buttons
  contentData?: {
    rootHash: string;
    txHash: string;
    summary: string;
    wallet_address: string;
    amount: string;
    transferMode?: boolean; // Flag for direct transfer mode
  };
}

// USDC Transfer Component
interface TransferComponentProps {
  amount: string;
  toAddress: string;
  rootHash: string;
  contentSummary: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

function USDCTransferComponent({ amount, toAddress, rootHash, contentSummary, onSuccess, onError }: TransferComponentProps) {
  const { address } = useAccount();
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Check USDC balance
  const { data: usdcBalance, isLoading: balanceLoading } = useReadContract({
    address: USDC_CONTRACT_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: baseSepolia.id,
  });

  // Send USDC transfer transaction
  const { sendTransaction, data: txData, error: txError, reset } = useSendTransaction({
    mutation: {
      onSuccess: async (hash) => {
        console.log("USDC transfer successful:", hash);
        
        // Wait a bit for transaction to be mined, then fetch content
        setTimeout(async () => {
          try {
            const contentUrl = `${window.location.origin}/api/content/${rootHash}?txHash=${hash}`;
            const response = await fetch(contentUrl);
            
            if (response.ok) {
              const data = await response.json();
              onSuccess(hash);
            } else {
              onError("Content access failed after payment");
            }
          } catch (err) {
            onError("Failed to access content after payment");
          }
        }, 3000);
      },
      onError: (error) => {
        console.error("USDC transfer failed:", error);
        onError(error.message);
      }
    }
  });

  const hasBalance = useMemo(() => {
    if (!usdcBalance || typeof usdcBalance !== 'bigint') return false;
    const requiredAmount = parseUnits(amount, 6); // USDC has 6 decimals
    return usdcBalance >= requiredAmount;
  }, [usdcBalance, amount]);

  const handleTransfer = () => {
    if (!address || !hasBalance) return;
    
    setIsTransferring(true);
    
    const transferAmount = parseUnits(amount, 6); // USDC has 6 decimals
    
    sendTransaction({
      to: USDC_CONTRACT_ADDRESS as `0x${string}`,
      data: `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${transferAmount.toString(16).padStart(64, '0')}`, // transfer(address,uint256)
      gas: 100000n,
    });
  };

  if (balanceLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <LoadingSkeleton className="h-4 w-32 mb-2" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
    );
  }

  if (txData) {
    return (
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">✅ Transfer Sent!</h3>
        <p className="text-sm text-green-700 mb-3">
          Transaction: <a 
            href={`https://sepolia.basescan.org/tx/${txData}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txData.slice(0, 6)}...{txData.slice(-4)}
          </a>
        </p>
        <p className="text-sm text-green-600">
          ⏳ Waiting for confirmation to unlock content...
        </p>
      </div>
    );
  }

  if (txError) {
    return (
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <h3 className="font-semibold text-red-800 mb-2">❌ Transfer Failed</h3>
        <p className="text-sm text-red-700 mb-3">{txError.message}</p>
        <Button variant="secondary" onClick={reset} className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-2">💳 USDC Transfer</h3>
      
      <div className="space-y-3 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">{amount} USDC</span>
        </div>
        <div className="flex justify-between">
          <span>To Creator:</span>
          <span className="font-mono text-xs">{toAddress.slice(0, 6)}...{toAddress.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Your Balance:</span>
          <span className="font-medium">
            {usdcBalance && typeof usdcBalance === 'bigint' ? formatUnits(usdcBalance, 6) : '0'} USDC
          </span>
        </div>
      </div>

      {hasBalance && address ? (
        <Button 
          onClick={handleTransfer}
          disabled={isTransferring}
          className="w-full"
        >
          {isTransferring ? "Sending..." : `Send ${amount} USDC`}
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">
            {!hasBalance ? "Insufficient USDC balance" : "Wallet not connected"}
          </p>
          <p className="text-xs text-gray-500">
            Get testnet USDC from{" "}
            <a 
              href="https://portal.cdp.coinbase.com/products/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Base Sepolia Faucet
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function USDCDashboard() {
  const { evmAddress } = useEvmAddress();
  const { signOut } = useSignOut();
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingContent, setDownloadingContent] = useState(false);
  const [isOnrampModalOpen, setIsOnrampModalOpen] = useState(false);

  // Onramp API callbacks
  const fetchBuyQuote: FundModalProps["fetchBuyQuote"] = useCallback(async params => {
    return createBuyQuote(params);
  }, []);

  const fetchBuyOptions: FundModalProps["fetchBuyOptions"] = useCallback(async params => {
    return getBuyOptions(params);
  }, []);

  const handleOnrampSuccess = useCallback(() => {
    console.log("🔥 Onramp purchase successful!");
    setIsOnrampModalOpen(false);
  }, []);

  const copyToClipboard = () => {
    if (evmAddress) {
      navigator.clipboard.writeText(evmAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    setQuery("");
    
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: query }),
      });
      
      const data = await res.json();
      const responseText = data.response || data.error || "No response received";
      
      // Check if response contains content details - look for the pattern the agent uses
      const hasContent = responseText.includes("Found it!") || 
                        responseText.includes("Here's what I discovered") ||
                        responseText.includes("**Summary:**") ||
                        responseText.includes("**Root Hash:**") ||
                        responseText.includes("**Price:**");
      
      console.log('Response text:', responseText);
      console.log('Has content:', hasContent);
      console.log('Tool results:', data.toolResults);
      
      // Extract content data if available
      let contentData;
      if (hasContent) {
        // Try to extract from agent's structured response
        const summaryMatch = responseText.match(/\*\*Summary:\*\*\s*([^\n\*]+)/);
        const priceMatch = responseText.match(/\*\*Price:\*\*\s*([\d.]+)/);
        const rootHashMatch = responseText.match(/\*\*Root Hash:\*\*\s*([0-9a-fA-Fx]+)/);
        const creatorMatch = responseText.match(/\*\*Creator Address:\*\*\s*([0-9a-fA-Fx]+)/);
        
        console.log('Extracted matches:', {
          summary: summaryMatch?.[1],
          price: priceMatch?.[1], 
          rootHash: rootHashMatch?.[1],
          creator: creatorMatch?.[1]
        });
        
        // Also check if there's tool response data with rootHash
        let rootHash = rootHashMatch?.[1] || "";
        let wallet_address = creatorMatch?.[1] || "";
        
        // Look for tool response in the data
        if (data.toolResults && Array.isArray(data.toolResults)) {
          for (const toolResult of data.toolResults) {
            if (toolResult.result && typeof toolResult.result === 'object') {
              const result = toolResult.result;
              if (result.rootHash) {
                rootHash = result.rootHash;
                wallet_address = result.wallet_address || "";
                break;
              }
              // Check if it's an array of content items
              if (Array.isArray(result) && result.length > 0 && result[0].rootHash) {
                rootHash = result[0].rootHash;
                wallet_address = result[0].wallet_address || "";
                break;
              }
            }
          }
        }
        
        if ((summaryMatch || responseText.includes("Found it!")) && priceMatch && rootHash) {
          contentData = {
            rootHash: rootHash,
            txHash: "",
            wallet_address: wallet_address,
            amount: priceMatch[1],
            summary: summaryMatch?.[1]?.trim() || "Content available for purchase"
          };
        }
      }
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        showActions: hasContent,
        contentData
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to connect to AI agent"}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContent = async (rootHash: string, messageIndex: number) => {
    setDownloadingContent(true);
    
    // Add user confirmation message
    const confirmMessage: ChatMessage = {
      role: "user",
      content: "Yes, please show me the content!",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
    
    try {
      // Get content data from the message
      const message = messages[messageIndex];
      if (!message.contentData) {
        throw new Error("Content data not found");
      }
      
      // Show transfer processing message
      const transferMessage: ChatMessage = {
        role: "assistant",
        content: `💳 Processing USDC transfer...\n\n� Sending ${message.contentData.amount} USDC to creator\n📍 Creator: ${message.contentData.wallet_address}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, transferMessage]);
      
      // Get current user and set up wallet client
      const user = await getCurrentUser();
      if (!user || !user.evmAccounts || user.evmAccounts.length === 0) {
        throw new Error("No wallet connected. Please ensure your wallet is set up.");
      }
      
      const viemAccount = await toViemAccount(user.evmAccounts[0]);
      const walletClient = createWalletClient({
        account: viemAccount,
        chain: baseSepolia,
        transport: http('https://sepolia.base.org'),
      }).extend(publicActions);
      
      // Check USDC balance first
      const userAddress = viemAccount.address;
      console.log('User address:', userAddress);
      
      // Check ETH balance for gas
      const ethBalance = await walletClient.getBalance({ 
        address: userAddress 
      });
      console.log('ETH balance:', ethBalance, 'wei');
      console.log('ETH balance:', Number(ethBalance) / 1e18, 'ETH');
      
      // Check if user has enough ETH for gas
      if (ethBalance < BigInt(21000 * 1500000000)) { // Basic gas estimate
        throw new Error(`Insufficient ETH for gas fees. You have ${Number(ethBalance) / 1e18} ETH but need at least 0.0001 ETH for transaction fees.`);
      }
      //@ts-ignore
      const usdcBalance = await walletClient.readContract({
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      });
      
      console.log('User USDC balance (raw):', usdcBalance);
      console.log('User USDC balance (formatted):', Number(usdcBalance) / 1e6, 'USDC');
      
      // Prepare USDC transfer
      const transferAmount = parseUnits(message.contentData.amount, 6); // USDC has 6 decimals
      const toAddress = message.contentData.wallet_address;
         //@ts-ignore
      if (usdcBalance < transferAmount) {
        throw new Error(`Insufficient USDC balance. You have ${Number(usdcBalance) / 1e6} USDC but need ${message.contentData.amount} USDC.`);
      }
      
      // Execute USDC transfer
      console.log(`Sending ${message.contentData.amount} USDC to ${toAddress}`);
      console.log(`Transfer amount in wei: ${transferAmount}`);
         //@ts-ignore
      const transferTx = await walletClient.writeContract({
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, transferAmount],
      });
      
      console.log("USDC transfer transaction:", transferTx);
      
      // Show transfer success message
      const successMessage: ChatMessage = {
        role: "assistant",
        content: `✅ USDC Transfer Successful!\n\n� Sent ${message.contentData.amount} USDC\n� To: ${toAddress}\n🔗 TX: ${transferTx}\n\n⏳ Now downloading content...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
      // Wait a moment for transaction to process, then fetch content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch content from API
      const contentUrl = `${window.location.origin}/api/content/${rootHash}`;
      const contentResponse = await fetch(contentUrl);
      
      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch content: ${contentResponse.status}`);
      }
      
      const contentData = await contentResponse.json();
      
      // Show content
      const contentMessage: ChatMessage = {
        role: "assistant",
        content: `� **Your Content:**\n\n${contentData.content}\n\n---\n📊 **Metadata:**\n- Summary: ${contentData.metadata.summary}\n- Creator: ${contentData.metadata.creator}\n- Price: ${contentData.metadata.price} USDC\n- Payment TX: ${transferTx}\n\n✨ Thank you for your payment! Enjoy your content.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, contentMessage]);
      
    } catch (error) {
      console.error("Transfer/content error:", error);
      
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("rejected")) {
          errorMessage = "Transfer was rejected by user";
        } else if (error.message.includes("Insufficient funds") || error.message.includes("Insufficient USDC balance")) {
          errorMessage = error.message;
        } else if (error.message.includes("gas required exceeds allowance")) {
          errorMessage = "Insufficient USDC balance or gas estimation failed. Please check your USDC balance and try again.";
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else {
          errorMessage = `Transfer failed: ${error.message}`;
        }
      }
      
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `❌ Error: ${errorMessage}\n\nPlease ensure you have enough USDC balance and try again. You need ${messages[messageIndex]?.contentData?.amount || '0.3'} USDC for this content.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setDownloadingContent(false);
    }
  };

  const handleCancelDownload = (messageIndex: number) => {
    // Add user cancel message
    const cancelMessage: ChatMessage = {
      role: "user",
      content: "No, maybe later.",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, cancelMessage]);
    
    // Add AI acknowledgment
    const ackMessage: ChatMessage = {
      role: "assistant",
      content: "No problem! Feel free to search for other content or ask me anything else. 😊",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, ackMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="backdrop-blur-md bg-white/80 border border-gray-200/60 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">WP<span className="text-blue-600">USDC</span></span>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Powered by <span className="text-blue-600 font-medium">Coinbase</span> & <span className="text-gray-700 font-medium">USDC</span>
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Add Funds Button */}
              <button
                onClick={() => setIsOnrampModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm font-medium"
                title="Buy USDC with credit card"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Fund Crypto
              </button>

              {/* Wallet Address */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm"
                title={copied ? "Address copied!" : "Click to copy address"}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-mono text-sm font-medium text-gray-800">
                  {`${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
                </span>
                {copied ? (
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2 2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
              </button>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all font-medium text-sm shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              WP Content <span className="text-blue-600">Discovery</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ask our WPAI agent to search and retrieve monetized content from 0G Storage, CDP actions.
            </p>
          </div>

          {/* AI Agent Search Interface */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">WPAgent</h2>
                    <p className="text-blue-100 text-sm">Ask me </p>
                  </div>
                </div>
              </div>

              {/* Search Input */}
              <div className="p-8">
                <div className="relative mb-6">
                  <div className="flex items-center gap-3 p-5 bg-gray-50 border-2 border-gray-300 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me: 'Show me content about blockchain' or 'Get content stats'"
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Content
                    </span>
                  )}
                </button>

                {/* Chat Messages Area */}
                {messages.length > 0 && (
                  <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${
                          msg.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user" 
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                            : "bg-gradient-to-br from-blue-500 to-cyan-600"
                        }`}>
                          {msg.role === "user" ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                          <div className={`inline-block max-w-[85%] p-4 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                              : "bg-white border-2 border-blue-200 text-gray-800"
                          }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.content}
                            </div>
                            
                            {/* Action Buttons for content access */}
                            {msg.showActions && msg.contentData && (
                              <div className="mt-4 pt-4 border-t-2 border-blue-100 flex gap-3">
                                <button
                                  onClick={() => handleDownloadContent(msg.contentData!.rootHash, idx)}
                                  disabled={downloadingContent}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  {downloadingContent ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Loading...
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center">
                                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Yes, Show Content
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCancelDownload(idx)}
                                  disabled={downloadingContent}
                                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Maybe Later
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                          <div className={`text-xs text-gray-500 mt-1 ${msg.role === "user" ? "mr-2" : "ml-2"}`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {loading && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="inline-block bg-white border-2 border-blue-200 p-4 rounded-2xl">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Example Queries - Show only when no messages */}
                {messages.length === 0 && !loading && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">💡 Example Queries:</h3>
                    <div className="space-y-2">
                      {[
                        "Show me all content",
                        "Find content about blockchain",
                        "Get content statistics",
                        "Search for crypto content"
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(example)}
                          className="block w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm text-gray-700"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ONRAMP Modal */}
      {isOnrampModalOpen && evmAddress && (
        <FundModal
          open={isOnrampModalOpen}
          setIsOpen={setIsOnrampModalOpen}
          country="US"
          subdivision="CA"
          cryptoCurrency="usdc"
          fiatCurrency="usd"
          network="base"
          presetAmountInputs={[2, 5, 10]}
          fetchBuyQuote={fetchBuyQuote}
          fetchBuyOptions={fetchBuyOptions}
          onSuccess={handleOnrampSuccess}
        />
      )}
    </div>
  );
}
