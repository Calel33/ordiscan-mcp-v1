import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

interface RunestoneMessage {
  rune: string;
  type: 'ETCH' | 'MINT' | 'TRANSFER';
}

interface RunicInput {
  address: string;
  output: string;
  rune: string;
  rune_amount: string;
}

interface RunicOutput {
  address: string;
  vout: number;
  rune: string;
  rune_amount: string;
}

interface RuneTransactionData {
  txid: string;
  runestone_messages: RunestoneMessage[];
  inputs: RunicInput[];
  outputs: RunicOutput[];
  timestamp: string;
}

interface OrdiscanInput {
  txid: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: RuneTransactionData;
}

class OrdiscanTxRunesTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_tx_runes";
  description = "Get a list of all minted and transferred runes in the transaction";

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
      const response = await fetch(`https://api.ordiscan.com/v1/tx/${txid}/runes`, {
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
          transaction: data.data.txid,
          timestamp: data.data.timestamp,
          actions: data.data.runestone_messages.map(msg => ({
            rune: msg.rune,
            action: msg.type
          })),
          transfers: data.data.inputs.map((input, index) => {
            const output = data.data.outputs[index];
            return {
              rune: input.rune,
              amount: input.rune_amount,
              from: input.address,
              to: output?.address || 'Unknown',
              output_index: output?.vout
            };
          })
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

export default OrdiscanTxRunesTool; 