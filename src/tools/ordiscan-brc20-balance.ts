import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanBrc20BalanceInput {
  address: string;
  apiKey?: string;
}

interface Brc20Balance {
  tick: string;
  balance: number;
}

interface OrdiscanBrc20BalanceResponse {
  data: Brc20Balance[];
}

class OrdiscanBrc20BalanceTool extends MCPTool<OrdiscanBrc20BalanceInput> {
  name = "ordiscan_address_brc20";
  description = "Get all BRC-20 token balances for a Bitcoin address";

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

  async execute(input: OrdiscanBrc20BalanceInput) {
    const { address, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/address/${address}/brc20`, {
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

      const data: OrdiscanBrc20BalanceResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_tokens: data.data.length,
          tokens: data.data.map(token => ({
            tick: token.tick,
            balance: token.balance,
            balance_formatted: token.balance.toLocaleString()
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

export default OrdiscanBrc20BalanceTool; 