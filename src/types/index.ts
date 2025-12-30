// types.ts
export interface RegisteredDomain {
  tokenId: string;
  name: string;
  owner: string;
  blockNumber: number;
  expiry: number; 
}

export interface MarketDomain extends RegisteredDomain {
  price: string; 
}
