export interface AgentRequest {
  userMessage: string;
}

export interface AgentResponse {
  response?: string;
  error?: string;
}

export interface ContentMetadata {
  summary: string;
  tags: string[];
  hash: string;
  download: string;
  title: string;
  wallet_address: string;
  timestamp: string;
}

export interface SearchRequest {
  q: string;
}

export interface SearchResponse {
  results: ContentMetadata[];
  total: number;
  error?: string;
}
