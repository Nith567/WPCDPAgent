# WPAgent - WordPress Content Monetization Platform

**Empowering WordPress creators with AI-powered content monetization through blockchain technology**

## 🌟 The Problem

Over 40% of the web is powered by WordPress. Yet, content creators face a growing threat: AI systems and bots scrape blogs illegally, using this content to train models or answer queries, without consent, compensation, or even attribution.

Content creators invest time and energy into producing valuable articles. But once published, they have little to no control over how that content is consumed or monetized. This has created a massive imbalance where platforms benefit, but the original authors do not.

## 💡 Our Solution

WPAgent revolutionizes how WordPress creators monetize their content. Instead of publishing directly to the open web where content can be scraped freely, creators can:

1. **Monetize Before Publishing** - Keep valuable content protected while still earning revenue
2. **AI-Powered Discovery** - Let users discover content through natural language queries
3. **Direct Creator Payments** - Receive USDC payments directly to their wallet
4. **No Intermediaries** - Connect creators and consumers directly

## 🏗️ Architecture

### For WordPress Creators

**WordPress Plugin** ([Repository](https://github.com/Nith567/WPPlugin))
- Install via ZIP upload in WordPress admin dashboard
- Works with local WordPress instances (tested with XAMPP)
- Add "Monetize" button to any post instead of "Publish"
- Content gets stored on 0G Network for decentralized storage
- AI analysis generates 3-4 sentence summaries using 0G Inference SDK

### For Content Consumers

**WPAgent Platform** (This Repository)
- Login with email via Coinbase CDP embedded wallets
- Automatic wallet creation and management
- Natural language content discovery powered by AI agent
- Seamless USDC payments using embedded wallets
- Access to premium WordPress content after payment

## 🚀 Key Features

### 🔐 **Protected Content Monetization**
- Creators can monetize without public publishing
- Content stored securely on 0G Network
- Direct creator-to-consumer payments

### 🤖 **AI-Powered Content Discovery**
- Ask questions like "Show me content about blockchain development"
- AI agent searches through creator-submitted content
- Displays summaries, prices, and creator information

### 💰 **Seamless Crypto Payments**
- Embedded Coinbase wallets for easy onboarding
- USDC payments on Base Sepolia network
- No complex wallet setup required
- Built-in onramp for traditional payment methods

### 📊 **Creator Analytics**
- Track content performance and earnings
- View audience engagement metrics
- Optimize pricing strategies

## 🛠️ Tech Stack

### Blockchain & Payments
- **Coinbase CDP** - Embedded wallets and authentication
- **Coinbase Agentkit Framework** - AI agent infrastructure
- **Base Sepolia** - USDC payments and transactions
- **Viem** - Ethereum interactions

### Storage & AI
- **0G Network** - Decentralized content storage
- **0G Inference SDK** - AI-powered content analysis
- **Content summarization** - Automated blog analysis

### Frontend & Backend
- **Next.js 14** - Full-stack React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern UI styling

## 🎯 Hackathon Sponsors

This project is built using technologies from our amazing sponsors:

- **🌐 0G Network** - Decentralized storage and AI inference
- **🔵 Coinbase** -CDP Embedded wallets, OnRamps, and Agentkit Framework

## 📋 Prerequisites

- Node.js v20+ (install via [nvm](https://github.com/nvm-sh/nvm))
- pnpm v10 (install via [pnpm.io/installation](https://pnpm.io/installation))
- WordPress site with our plugin installed

## 🚀 Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd wpagent
pnpm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Add your configuration variables
```

3. **Start Development Server**
```bash
pnpm dev
```

4. **Install WordPress Plugin**
- Download from: https://github.com/Nith567/WPPlugin
- Upload ZIP to WordPress admin
- Activate plugin
- Start monetizing your content!

## 🎮 How It Works

### For Creators:
1. **Install Plugin** - Add WPAgent plugin to WordPress
2. **Create Content** - Write your blog post as usual
3. **Monetize** - Click "Monetize" instead of "Publish"
4. **Set Price** - Choose your USDC price
5. **Earn** - Receive payments directly to your wallet

### For Consumers:
1. **Sign In** - Login with email (auto-creates wallet)
2. **Ask AI** - "Show me content about Web3 development"
3. **Browse Results** - See summaries, prices, creators
4. **Pay & Read** - One-click USDC payment to access content
5. **Enjoy** - Read premium content directly


## 🔥 Demo Flow

### Creator Journey
1. **Local WordPress Setup** (XAMPP)
2. **Install WPAgent Plugin** via ZIP upload
3. **Write Content** in WordPress editor
4. **Click "Monetize"** - content goes to 0G Network
5. **AI Analysis** creates summary via 0G Inference SDK
6. **Content Listed** in WPAgent marketplace

### User Journey
1. **Visit WPAgent** platform
2. **Email Login** - Coinbase CDP creates embedded wallet
3. **Ask AI Agent**: "Show me blockchain tutorials"
4. **Browse Results** - AI shows relevant content with prices
5. **One-Click Payment** - USDC sent to creator automatically
6. **Access Content** - Read premium WordPress content

## 🏆 Innovation Highlights

- **First-of-its-kind** WordPress monetization without public publishing
- **AI-Native Discovery** - Natural language content search
- **Frictionless Payments** - No wallet setup complexity
- **Creator Empowerment** - Direct monetization control
- **Decentralized Storage** - Content protected on 0G Network

## 🌍 Impact

**For Creators:**
- 💰 Monetize content without losing control
- 🔒 Protect IP from unauthorized scraping  
- 📈 Direct audience connection
- 💪 Fair compensation for valuable content

**For Consumers:**
- 🎯 Discover high-quality, curated content
- 💳 Easy crypto payments with embedded wallets
- 🤝 Support creators directly
- 🔍 AI-powered content discovery

## 🛡️ Security & Privacy

- **Decentralized Storage** - Content on 0G Network
- **Embedded Wallets** - Coinbase CDP security standards
- **Creator Control** - Full ownership of content and pricing

*Empowering WordPress creators to monetize their content in the decentralized web*
