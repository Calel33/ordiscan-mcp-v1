import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
// Define interfaces for the tool's input and response types
interface OrdiscanInput {
  address: string;
  page?: string | number;
  sort?: string;
  apiKey?: string;
}

interface InscriptionActivity {
  inscription_id: string;
  from_address: string | null;
  to_address: string;
  timestamp: string;
  tx_id: string;
}

interface OrdiscanResponse {
  data: InscriptionActivity[];
}

class OrdiscanInscriptionsActivityTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscriptions_activity";
  description = "Get inscription transfer activity for an address";

  schema = {
    address: {
      type: z.string(),
      description: "Bitcoin address to get activity for",
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

  async execute(input: OrdiscanInput) {
    const { address, page, sort, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL(`https://api.ordiscan.com/v1/address/${address}/inscriptions/activity`);
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

      const data: OrdiscanResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        formatted: {
          total_events: data.data.length,
          events: data.data.map(event => ({
            inscription_id: event.inscription_id,
            tx_id: event.tx_id,
            type: event.from_address === address ? 'SEND' : 'RECEIVE',
            counterpart: event.from_address === address ? event.to_address : event.from_address || 'Genesis',
            timestamp: new Date(event.timestamp).toLocaleString(),
            // Add short versions for easier reading
            short_tx_id: event.tx_id.substring(0, 8) + '...' + event.tx_id.substring(event.tx_id.length - 8),
            short_inscription: event.inscription_id.substring(0, 8) + '...' + event.inscription_id.substring(event.inscription_id.length - 8)
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

export default OrdiscanInscriptionsActivityTool; 