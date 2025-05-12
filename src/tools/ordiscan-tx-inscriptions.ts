import { MCPTool } from "mcp-framework";
import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanTxInscriptionsInput {
  txid: string;
  apiKey?: string;
}

interface TxInscription {
  inscription_id: string;
  inscription_number: number;
  content_type: string;
  owner_address: string;
  owner_output: string;
  genesis_address: string;
  genesis_output: string;
  timestamp: string;
  sat: number;
  content_url: string;
  parent_inscription_id: string | null;
}

interface OrdiscanTxInscriptionsResponse {
  data: TxInscription[];
}

class OrdiscanTxInscriptionsTool extends MCPTool<OrdiscanTxInscriptionsInput> {
  name = "ordiscan_tx_inscriptions";
  description = "Get all new inscriptions created in a Bitcoin transaction";

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

  async execute(input: OrdiscanTxInscriptionsInput) {
    const { txid, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/tx/${txid}/inscriptions`, {
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

      const data: OrdiscanTxInscriptionsResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_inscriptions: data.data.length,
          inscriptions: data.data.map(inscription => ({
            id: inscription.inscription_id,
            number: inscription.inscription_number,
            type: inscription.content_type,
            timestamp: new Date(inscription.timestamp).toLocaleString(),
            sat: inscription.sat.toLocaleString(),
            content_url: inscription.content_url,
            owner: {
              address: inscription.owner_address,
              output: inscription.owner_output
            },
            genesis: {
              address: inscription.genesis_address,
              output: inscription.genesis_output
            },
            parent: inscription.parent_inscription_id || 'N/A',
            // Add short versions for easier reading
            short_id: inscription.inscription_id.substring(0, 8) + '...' + inscription.inscription_id.substring(inscription.inscription_id.length - 8)
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

export default OrdiscanTxInscriptionsTool; 