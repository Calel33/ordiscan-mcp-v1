import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils";

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
  after?: string | number;
  before?: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: InscriptionInfo[];
}

class OrdiscanInscriptionsListTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscriptions_list";
  description = "Get a paginated list of all inscriptions";

  schema = {
    after: {
      type: flexibleNumber(),
      description: "Get inscriptions after this number",
    },
    before: {
      type: flexibleNumber(),
      description: "Get inscriptions before this number",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { after, before, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL('https://api.ordiscan.com/v1/inscriptions');
      if (after !== undefined) {
        url.searchParams.append('after', after.toString());
      }
      if (before !== undefined) {
        url.searchParams.append('before', before.toString());
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
          total_inscriptions: data.data.length,
          inscriptions: data.data.map(inscription => ({
            id: inscription.id,
            number: inscription.number,
            type: inscription.content_type,
            timestamp: new Date(inscription.timestamp).toLocaleString(),
            content_url: inscription.id,
            owner: {
              address: inscription.address,
              output: inscription.output
            },
            // Add short versions for easier reading
            short_id: inscription.id.substring(0, 8) + '...' + inscription.id.substring(inscription.id.length - 8)
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

export default OrdiscanInscriptionsListTool; 