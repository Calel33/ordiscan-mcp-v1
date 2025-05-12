import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
interface OrdiscanInput {
  runeName: string;
  apiKey?: string;
  blockHeight?: number;
}

// Define the response type based on the API documentation
interface RuneData {
  id: string;
  name: string;
  formatted_name: string;
  spacers: number;
  number: number;
  inscription_id: string | null;
  decimals: number;
  mint_count_cap: string;
  symbol: string;
  etching_txid: string | null;
  amount_per_mint: string | null;
  timestamp_unix: string | null;
  premined_amount: string;
  mint_start_block: number | null;
  mint_end_block: number | null;
  current_supply: string;
  current_mint_count: number;
}

interface OrdiscanResponse {
  data: RuneData;
}

class OrdiscanTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_main";
  description = "Main Ordiscan API tool for general rune information and status";

  schema = {
    runeName: {
      type: z.string(),
      description: "The unique name of the rune (without spacers)",
    },
    blockHeight: {
      type: z.number().optional(),
      description: "Current block height for minting status calculation. If not provided, will be fetched from API.",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { runeName, apiKey, blockHeight } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      // First get the current block height if not provided
      let currentBlock = blockHeight;
      if (currentBlock === undefined) {
        const blockResponse = await fetch('https://api.ordiscan.com/v1/stats', {
          headers: {
            'Authorization': `Bearer ${apiKeyToUse}`,
            'Accept': 'application/json'
          }
        });
        
        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          currentBlock = blockData.data.block_height;
        }
      }

      const response = await fetch(`https://api.ordiscan.com/v1/rune/${runeName}`, {
        headers: {
          'Authorization': `Bearer ${apiKeyToUse}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: `API request failed: ${response.status} ${response.statusText}`,
          details: errorText
        };
      }

      const data: OrdiscanResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        formatted: {
          name: data.data.formatted_name,
          supply: {
            current: data.data.current_supply,
            premined: data.data.premined_amount,
            per_mint: data.data.amount_per_mint || 'N/A'
          },
          minting: {
            current_count: data.data.current_mint_count,
            cap: data.data.mint_count_cap,
            start_block: data.data.mint_start_block,
            end_block: data.data.mint_end_block,
            status: this.getMintStatus(data.data, currentBlock)
          },
          details: {
            symbol: data.data.symbol,
            decimals: data.data.decimals,
            inscription_id: data.data.inscription_id,
            etching_txid: data.data.etching_txid
          }
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  private getMintStatus(data: RuneData, currentBlock?: number): string {
    if (!currentBlock) {
      return 'Block height unknown';
    }
    
    if (data.mint_start_block && currentBlock < data.mint_start_block) {
      return `Minting not started yet. Starts at block ${data.mint_start_block}`;
    }
    
    if (data.mint_end_block && currentBlock > data.mint_end_block) {
      return `Minting ended at block ${data.mint_end_block}`;
    }
    
    if (data.mint_count_cap && data.current_mint_count >= parseInt(data.mint_count_cap)) {
      return 'Minting cap reached';
    }
    
    return `Active - ${data.current_mint_count} mints out of ${data.mint_count_cap}`;
  }
}

export default OrdiscanTool; 