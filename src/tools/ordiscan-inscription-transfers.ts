import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
interface TransferInfo {
  from_address: string | null;
  to_address: string;
  timestamp: string;
  tx_id: string;
}

interface OrdiscanInput {
  id: string;
  page?: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: TransferInfo[];
}

class OrdiscanInscriptionTransfersTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscription_transfers";
  description = "Get transfer history for an inscription";

  schema = {
    id: {
      type: z.string(),
      description: "The inscription ID to get transfers for",
    },
    page: {
      type: flexibleNumber(),
      description: "Page number for pagination (20 transfers per page)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { id, page, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL(`https://api.ordiscan.com/v1/inscription/${id}/transfers`);
      if (page !== undefined) {
        url.searchParams.append('page', page.toString());
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
          total_transfers: data.data.length,
          transfers: data.data.map(transfer => ({
            from: transfer.from_address || 'Genesis',
            to: transfer.to_address,
            timestamp: new Date(transfer.timestamp).toLocaleString(),
            tx_id: transfer.tx_id,
            // Add short versions for easier reading
            short_tx_id: transfer.tx_id.substring(0, 8) + '...' + transfer.tx_id.substring(transfer.tx_id.length - 8)
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

export default OrdiscanInscriptionTransfersTool; 