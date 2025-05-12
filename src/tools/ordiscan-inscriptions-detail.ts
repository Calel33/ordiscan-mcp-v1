import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
interface InscriptionInfo {
  id: string;
  number: number;
  address: string;
  output: string;
  content_type: string;
  timestamp: string;
  genesis_address: string;
  genesis_block_height: number;
  genesis_block_hash: string;
  genesis_tx_id: string;
  genesis_fee: number;
  genesis_timestamp: string;
  sat_ordinal: number;
  sat_rarity: string;
  sat_coinbase_height: number;
  collection: string | null;
}

interface OrdiscanInput {
  number?: string | number;
  id?: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: InscriptionInfo;
}

class OrdiscanInscriptionsDetailTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscriptions_detail";
  description = "Get detailed information about an inscription by number or ID";

  schema = {
    number: {
      type: flexibleNumber(),
      description: "The inscription number to get details for",
    },
    id: {
      type: z.string().optional(),
      description: "The inscription ID to get details for (alternative to number)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { number, id, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    if (!number && !id) {
      return {
        error: "Either number or id must be provided"
      };
    }

    try {
      const url = new URL(`https://api.ordiscan.com/v1/inscription/${id || number}`);

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
      const inscription = data.data;
      
      return {
        success: true,
        data: inscription,
        formatted: {
          id: inscription.id,
          number: inscription.number,
          type: inscription.content_type,
          timestamp: new Date(inscription.timestamp).toLocaleString(),
          owner: {
            address: inscription.address,
            output: inscription.output
          },
          genesis: {
            address: inscription.genesis_address,
            block: inscription.genesis_block_height,
            block_hash: inscription.genesis_block_hash,
            tx_id: inscription.genesis_tx_id,
            fee: inscription.genesis_fee,
            timestamp: new Date(inscription.genesis_timestamp).toLocaleString()
          },
          sat: {
            ordinal: inscription.sat_ordinal,
            rarity: inscription.sat_rarity,
            coinbase_height: inscription.sat_coinbase_height
          },
          collection: inscription.collection || 'N/A',
          // Add short versions for easier reading
          short_id: inscription.id.substring(0, 8) + '...' + inscription.id.substring(inscription.id.length - 8),
          short_genesis_tx: inscription.genesis_tx_id.substring(0, 8) + '...' + inscription.genesis_tx_id.substring(inscription.genesis_tx_id.length - 8)
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

export default OrdiscanInscriptionsDetailTool; 