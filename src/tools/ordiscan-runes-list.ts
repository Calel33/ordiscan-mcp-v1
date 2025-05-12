import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils";

interface RuneInfo {
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
  amount_per_mint: string;
  timestamp_unix: number | null;
  premined_amount: string;
  mint_start_block: number;
  mint_end_block: number;
  current_supply: string;
  current_mint_count: number;
}

interface OrdiscanInput {
  sort?: string;
  after?: string | number;
  before?: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: RuneInfo[];
}

class OrdiscanRunesListTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_runes_list";
  description = "Get a paginated list of all runes";

  schema = {
    sort: {
      type: flexibleEnum(['newest', 'oldest']),
      description: "Sort order: 'newest' or 'oldest' (default)",
    },
    after: {
      type: flexibleNumber(),
      description: "Get runes after this number",
    },
    before: {
      type: flexibleNumber(),
      description: "Get runes before this number",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { sort, after, before, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL('https://api.ordiscan.com/v1/runes');
      if (sort) {
        url.searchParams.append('sort', sort);
      }
      if (after !== undefined) {
        url.searchParams.append('after', after.toString());
      }
      if (before !== undefined) {
        url.searchParams.append('before', before.toString());
      }

      const response = await fetch(url.toString(), {
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
          total_runes: data.data.length,
          runes: data.data.map(rune => ({
            id: rune.id,
            name: rune.formatted_name,
            number: rune.number,
            symbol: rune.symbol,
            decimals: rune.decimals,
            inscription: rune.inscription_id || 'N/A',
            etching: {
              txid: rune.etching_txid || 'N/A',
              timestamp: rune.timestamp_unix ? new Date(rune.timestamp_unix * 1000).toLocaleString() : 'N/A'
            },
            supply: {
              premined: rune.premined_amount,
              per_mint: rune.amount_per_mint || 'N/A',
              mint_cap: rune.mint_count_cap || 'N/A'
            },
            minting: {
              start_block: rune.mint_start_block || 'N/A',
              end_block: rune.mint_end_block || 'N/A',
              status: this.getMintingStatus(rune.mint_start_block, rune.mint_end_block)
            }
          }))
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  private getMintingStatus(startBlock: number | null, endBlock: number | null): string {
    if (!startBlock && !endBlock) return 'No minting';
    
    // Get current block height (this is a placeholder - in production you'd want to fetch this)
    const currentBlock = 840000;

    if (startBlock && currentBlock < startBlock) return 'Not started';
    if (endBlock && currentBlock > endBlock) return 'Ended';
    return 'Active';
  }
}

export default OrdiscanRunesListTool; 