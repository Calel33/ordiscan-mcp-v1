import { MCPTool } from "mcp-framework";
import { z } from "zod";

type Satribute = 
  | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'
  | 'BLACK_UNCOMMON' | 'BLACK_RARE' | 'BLACK_EPIC' | 'BLACK_LEGENDARY' | 'BLACK_MYTHIC'
  | 'BLOCK_9' | 'BLOCK_78' | 'NAKAMOTO' | 'FIRST_TX' | 'VINTAGE'
  | 'PIZZA' | 'HITMAN' | 'PALINDROME' | 'ALPHA' | 'OMEGA';

interface RareSatRange {
  satributes: Satribute[];
  ranges: [number, number][];
}

interface OrdiscanInput {
  utxo: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: RareSatRange[];
}

class OrdiscanUTXORareSatsTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_utxo_rare_sats";
  description = "Get all the rare sats for a specific UTXO";

  schema = {
    utxo: {
      type: z.string(),
      description: "A valid Bitcoin UTXO (e.g. 3d57f76284e17370f1ce45e75f68b5960906c4117951607f20ddd19f85c15706:0)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { utxo, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/utxo/${utxo}/rare-sats`, {
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
          total_rare_sat_groups: data.data.length,
          total_ranges: data.data.reduce((acc, group) => acc + group.ranges.length, 0),
          total_sats: data.data.reduce((acc, group) => 
            acc + group.ranges.reduce((sum, [start, end]) => sum + (end - start), 0), 0
          ),
          rare_sat_groups: data.data.map(group => ({
            satributes: group.satributes,
            categories: this.categorizeSatributes(group.satributes),
            ranges: group.ranges.map(([start, end]) => ({
              start: start.toLocaleString(),
              end: (end - 1).toLocaleString(), // end is exclusive in API
              count: (end - start).toLocaleString()
            }))
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

  private categorizeSatributes(satributes: Satribute[]): {
    rarity: string[];
    special_blocks: string[];
    historical: string[];
    other: string[];
  } {
    const categories = {
      rarity: [] as string[],
      special_blocks: [] as string[],
      historical: [] as string[],
      other: [] as string[]
    };

    satributes.forEach(satribute => {
      if (satribute.includes('UNCOMMON') || satribute.includes('RARE') || 
          satribute.includes('EPIC') || satribute.includes('LEGENDARY') || 
          satribute.includes('MYTHIC')) {
        categories.rarity.push(satribute);
      } else if (satribute === 'BLOCK_9' || satribute === 'BLOCK_78') {
        categories.special_blocks.push(satribute);
      } else if (satribute === 'NAKAMOTO' || satribute === 'FIRST_TX' || 
                 satribute === 'VINTAGE' || satribute === 'PIZZA') {
        categories.historical.push(satribute);
      } else {
        categories.other.push(satribute);
      }
    });

    return categories;
  }
}

export default OrdiscanUTXORareSatsTool; 