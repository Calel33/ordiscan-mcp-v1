import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanRunesBalanceInput {
  address: string;
  apiKey?: string;
}

interface RuneBalance {
  name: string;
  balance: string;
}

interface OrdiscanRunesBalanceResponse {
  data: RuneBalance[];
}

class OrdiscanRunesBalanceTool extends MCPTool<OrdiscanRunesBalanceInput> {
  name = "ordiscan_address_runes";
  description = "Get all rune balances for a Bitcoin address";

  schema = {
    address: {
      type: z.string(),
      description: "A valid Bitcoin address",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanRunesBalanceInput) {
    const { address, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/address/${address}/runes`, {
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

      const data: OrdiscanRunesBalanceResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_runes: data.data.length,
          runes: data.data.map(rune => ({
            name: rune.name,
            balance: rune.balance,
            balance_formatted: Number(rune.balance).toLocaleString()
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
}

export default OrdiscanRunesBalanceTool; 