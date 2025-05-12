import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanTxInfoInput {
  txid: string;
  apiKey?: string;
}

interface TxInfo {
  txid: string;
  fee: number;
  size: number;
  weight: number;
  confirmed: boolean;
  block_hash: string | null;
  indexed: boolean;
  has_inscriptions: boolean;
  has_inscription_transfers: boolean;
  has_runes: boolean;
}

interface OrdiscanTxInfoResponse {
  data: TxInfo;
}

class OrdiscanTxInfoTool extends MCPTool<OrdiscanTxInfoInput> {
  name = "ordiscan_tx_info";
  description = "Get information about a Bitcoin transaction";

  schema = {
    txid: {
      type: z.string(),
      description: "The transaction ID (txid)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanTxInfoInput) {
    const { txid, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/tx/${txid}`, {
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

      const data: OrdiscanTxInfoResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          txid: data.data.txid,
          fee_sats: data.data.fee.toLocaleString(),
          size_bytes: data.data.size.toLocaleString(),
          weight_units: data.data.weight.toLocaleString(),
          status: data.data.confirmed ? 'confirmed' : 'pending',
          block_hash: data.data.block_hash || 'N/A',
          indexing_status: data.data.indexed ? 'indexed' : 'indexing',
          content: {
            has_inscriptions: data.data.has_inscriptions,
            has_inscription_transfers: data.data.has_inscription_transfers,
            has_runes: data.data.has_runes
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
}

export default OrdiscanTxInfoTool; 