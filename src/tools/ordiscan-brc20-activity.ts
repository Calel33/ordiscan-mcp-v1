import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
// Define interfaces for the tool's input and response types
interface OrdiscanBrc20ActivityInput {
  address: string;
  page?: string | number;
  sort?: string;
  apiKey?: string;
}

interface Brc20Activity {
  ticker: string;
  type: 'TRANSFER' | 'MINT' | 'DEPLOY';
  from_address: string | null;
  to_address: string;
  amount: number;
  inscription_id: string;
  timestamp: string;
}

interface OrdiscanBrc20ActivityResponse {
  data: Brc20Activity[];
}

class OrdiscanBrc20ActivityTool extends MCPTool<OrdiscanBrc20ActivityInput> {
  name = "ordiscan_address_brc20_activity";
  description = "Get all BRC-20 token transaction activity for a Bitcoin address";

  schema = {
    address: {
      type: z.string(),
      description: "A valid Bitcoin address",
    },
    page: {
      type: flexibleNumber(),
      description: "Page number for pagination (20 transfers per page)",
    },
    sort: {
      type: flexibleEnum(['newest', 'oldest']),
      description: "Sort order: 'newest' or 'oldest' (default)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanBrc20ActivityInput) {
    const { address, page, sort, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL(`https://api.ordiscan.com/v1/address/${address}/activity/brc20`);
      if (page !== undefined) {
        url.searchParams.append('page', page.toString());
      }
      if (sort) {
        url.searchParams.append('sort', sort);
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

      const data: OrdiscanBrc20ActivityResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_events: data.data.length,
          events: data.data.map(event => ({
            ticker: event.ticker,
            type: event.type,
            from: event.from_address || 'N/A',
            to: event.to_address,
            amount: event.amount,
            amount_formatted: event.amount.toLocaleString(),
            inscription_id: event.inscription_id,
            short_inscription: event.inscription_id.substring(0, 8) + '...' + event.inscription_id.substring(event.inscription_id.length - 8),
            timestamp: new Date(event.timestamp).toLocaleString()
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

export default OrdiscanBrc20ActivityTool; 