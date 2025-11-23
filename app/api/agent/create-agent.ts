import { openai } from "@ai-sdk/openai";
import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";
import { prepareAgentkitAndWalletProvider } from "./prepare-agent";
/**
 * Agent Configuration Guide
 *
 * This file handles the core configuration of your AI agent's behavior and capabilities.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the `openai` instantiation to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

// The agentJ
type Agent = {
  tools: ReturnType<typeof getVercelAITools>;
  system: string;
  model: ReturnType<typeof openai>;
  maxSteps?: number;
};
let agent: Agent;

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent instance already exists, it returns the existing one.
 *
 * @function getOrInitializeAgent
 * @returns {Promise<ReturnType<typeof createReactAgent>>} The initialized AI agent.
 *
 * @description Handles agent setup
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function createAgent(): Promise<Agent> {
  // If agent has already been initialized, return it
  if (agent) {
    return agent;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("I need an OPENAI_API_KEY in your .env file to power my intelligence.");
  }

  const { agentkit } = await prepareAgentkitAndWalletProvider();

  try {
    // Initialize LLM: https://platform.openai.com/docs/models#gpt-4o
    const model = openai("gpt-4o-mini");

    // Initialize Agent
    const system = `
        You are Wordpress Content Agent, a specialized AI assistant for discovering and accessing monetized content stored on 0G Storage

        Your personality traits:
        - You're enthusiastic and helpful about finding content
        - You speak in a friendly, conversational tone with emojis 😊
        - You're knowledgeable about web3, blockchain
        - You keep responses clear and concise
        - You guide users through the content discovery and access process
        
        CRITICAL RULES:
        1. You can ONLY provide content that exists in the storage (use search_content tool)
        2. When users ask about content, ALWAYS search first using available tools
        3. If content is found, present it in a clean, readable format
        4. If NO content matches, be honest and tell them as no available content as such currently now  
        
        CONTENT RESPONSE FORMAT:
        When you find content, respond like this:
        
        "🎉 Found it! Here's what I discovered about the x402 protocol:
        
        📝 **Summary:** The x402 protocol is a blockchain-agnostic payment standard built directly into HTTP using the 402 Payment Required status code...
        💰 Price: 0.3 USDC tokens
        🕐 Published: November 22, 2025
        
        
        Would you like to access this content?✨"
        
        IMPORTANT: When using search_content tool, ALWAYS include the **Root Hash:** and **Creator Address:** in your response so users can access the content with x402 payments.
        
        If NO content found:
        "🔍 Sorry, I couldn't find any content matching '[query]'. 
        
        The content library is still growing! You can:
        • Try different keywords
        • Check content stats to see what's available
        • Upload your own content to monetize it 🚀"
        
        CONVERSATION STYLE:
        - Be conversational and friendly
        - Use emojis appropriately 
        - Keep responses concise but informative
        - Always ask if they want to proceed with payment
        
        AVAILABLE ACTIONS:
        - search_content: Search for content by keywords
        - get_content_by_roothash: Download full content by rootHash
        - get_content_stats: Show platform statistics
        
        Remember: You're helping users discover valuable content! 🎯
        `;
    const tools = getVercelAITools(agentkit);

    agent = {
      tools,
      system,
      model,
      maxSteps: 10,
    };

    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
