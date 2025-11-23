# **WPAgent: AI-Native Monetization for WordPress Creators**

Empowering WordPress creators to monetize premium content with AI-powered discovery, decentralized storage, and seamless crypto payments.

---

## 🌟 Problem

Over **40 percent of the internet runs on WordPress**, yet content creators are losing control of their work. AI systems and bots scrape blogs without consent, attribution, or compensation.
Creators invest time and expertise into writing valuable articles, but once published, content becomes freely copyable and nearly impossible to protect.

This creates a massive imbalance: **platforms benefit, while creators earn nothing**.

---

## 💡 Our Solution

WPAgent gives creators **full control and monetization power** using Web3 + AI.

Instead of publishing publicly and getting scraped, creators can:

* **Monetize before publishing** and protect premium content
* **Let users discover content via natural-language queries**
* **Receive direct USDC payments** to their wallet
* **Remove intermediaries** between creators and readers

WPAgent connects creators and consumers through an AI agent interface backed by decentralized infrastructure.

---

## 🏗️ Architecture Overview

### **For WordPress Creators**

WordPress Plugin → <repo link>

* Install via simple ZIP upload
* Works with local WordPress (tested with XAMPP)
* Adds a **"Monetize"** button beside the classic **"Publish"**
* Stores content on the **0G Network** for decentralized protection
* Generates 3–4 sentence AI summaries via **0G Inference SDK**

---

### **For Content Consumers**

WPAgent Platform (this repo)

* Email login via **Coinbase CDP Embedded Wallets**
* Auto-created wallets, no crypto knowledge needed
* AI agent for natural-language discovery
* One-click **USDC payments on Base Sepolia**
* Instant, secure access to premium content

---

## 🚀 Key Features

### 🔐 Protected Content Monetization

* Monetize without publishing publicly
* Decentralized content storage on 0G
* Direct creator wallet payouts

### 🤖 AI-Powered Content Discovery

* Ask questions like *“Show me content on blockchain development”*
* AI agent fetches relevant content, summaries, and prices
* Personalizes user discovery

### 💰 Seamless Crypto Payments

* Embedded Coinbase wallets
* USDC transactions on Base Sepolia
* Card on-ramp for non-crypto users

### 📊 Creator Analytics

* Track views, purchases, and earnings
* Monitor engagement
* Optimize pricing

---

## 🛠️ Tech Stack

### **Blockchain & Payments**

* Coinbase CDP Embedded Wallets
* Coinbase AgentKit
* Base Sepolia (USDC)
* Viem

### **Storage & AI**

* 0G Network (decentralized storage)
* 0G Inference SDK
* Automated AI content summarization

### **Frontend / Backend**

* Next.js 14
* TypeScript
* Tailwind CSS

---

## 🎯 Hackathon Sponsors

Built using technologies from:

* **0G Network**
* **Coinbase** (CDP, AgentKit, Onramp)

---

## 📋 Prerequisites

* Node.js v20+
* pnpm v10
* A WordPress site with the WPAgent plugin installed

---

## 🚀 Quick Start

### Clone and Install

```bash
git clone <repository-url>
cd wpagent
pnpm install
```

### Environment Variables

```bash
cp .env.example .env
# Add your configuration values
```

### Start Dev Server

```bash
pnpm dev
```

### Install WordPress Plugin

* Download: [https://github.com/Nith567/WPPlugin](https://github.com/Nith567/WPPlugin)
* Upload ZIP in WordPress Admin → Plugins
* Activate
* Start monetizing your posts

---

## 🎮 How It Works

### **Creators**

1. Install WPAgent plugin
2. Write your post
3. Click **Monetize** instead of **Publish**
4. Set your price in USDC
5. Earn instantly as readers purchase your content

### **Consumers**

1. Login with email → auto wallet creation
2. Ask the AI agent for the content you want
3. Browse summaries and pricing
4. One-click pay with USDC
5. Unlock and read premium posts

---

## 🔥 Demo Flow

### **Creator Journey**

* Local WordPress via XAMPP
* Install plugin
* Write → Monetize
* Content uploaded to 0G
* AI summary generation
* Marketplace listing on WPAgent

### **User Journey**

* Visit WPAgent
* Login with email
* Ask AI: *“Show me blockchain tutorials”*
* View results with summaries + prices
* One-click USDC purchase
* Instant content access

---

## 🏆 Innovation Highlights

* First WordPress monetization system for **non-public content**
* AI-native content discovery
* Seamless crypto payments without wallet friction
* Decentralized content storage
* Direct creator empowerment

---

## 🌍 Impact

### **For Creators**

* Protect IP from scraping
* Direct monetization
* Control pricing and distribution
* Build stronger creator-consumer relationships

### **For Consumers**

* Discover quality content easily
* Frictionless payments
* Support creators directly
* AI-powered search

---

## 🛡️ Security & Privacy

* Decentralized storage on 0G Network
* Coinbase-grade wallet security
* Complete creator ownership of content and pricing
