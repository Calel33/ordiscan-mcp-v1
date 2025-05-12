import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";

interface InscriptionTransfer {
  from_address: string;
  to_address: string;
  inscription_id: string;
  spent_as_fee: boolean;
  txid: string;
  confirmed: boolean;
  timestamp: string | null;
}

interface OrdiscanInput {
  txid: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: InscriptionTransfer[];
}

class OrdiscanTxInscriptionTransfersTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_tx_inscription_transfers";
  description = "Get a list of all inscriptions transferred in the transaction";

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

  async execute(input: OrdiscanInput) {
    const { txid, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/tx/${txid}/inscription-transfers`, {
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
        formatted: data.data.map(transfer => ({
          inscription_id: transfer.inscription_id,
          from: transfer.from_address,
          to: transfer.to_address,
          status: transfer.confirmed ? 'Confirmed' : 'Pending',
          timestamp: transfer.timestamp || 'Pending confirmation',
          spent_as_fee: transfer.spent_as_fee ? 'Yes' : 'No'
        }))
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }
}

export default OrdiscanTxInscriptionTransfersTool; 