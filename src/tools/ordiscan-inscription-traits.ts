import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

interface InscriptionTrait {
  name: string;
  value: string;
  rarity: number;
}

interface OrdiscanInput {
  id: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: InscriptionTrait[];
}

class OrdiscanInscriptionTraitsTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscription_traits";
  description = "Get traits for a specific inscription";

  schema = {
    id: {
      type: z.string(),
      description: "The inscription ID (e.g. b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735i0)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { id, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/inscription/${id}/traits`, {
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
          total_traits: data.data.length,
          traits: data.data.map(trait => ({
            name: trait.name,
            value: trait.value,
            rarity: trait.rarity,
            rarity_formatted: `${trait.rarity}%`,
            rarity_description: this.getRarityDescription(trait.rarity)
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

  private getRarityDescription(rarity: number): string {
    if (rarity < 1) return 'Extremely Rare';
    if (rarity < 5) return 'Very Rare';
    if (rarity < 10) return 'Rare';
    if (rarity < 20) return 'Uncommon';
    return 'Common';
  }
}

export default OrdiscanInscriptionTraitsTool; 