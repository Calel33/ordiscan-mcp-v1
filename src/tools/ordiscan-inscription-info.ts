import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";

interface InscriptionInfo {
  inscription_id: string;
  inscription_number: number;
  content_type: string;
  owner_address: string;
  owner_output: string;
  genesis_address: string;
  genesis_output: string;
  timestamp: string;
  content_url: string;
  collection_slug: string | null;
  sat: number;
  satributes: string[];
  metadata: Record<string, any> | null;
  metaprotocol: string | null;
  parent_inscription_id: string | null;
  delegate_inscription_id: string | null;
  submodules: string[];
  sats_name: string | null;
  brc20_action: {
    type: string;
    tick: string;
  } | null;
}

interface OrdiscanInput {
  id: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: InscriptionInfo;
}

class OrdiscanInscriptionInfoTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_inscription_info";
  description = "Get detailed information about a specific inscription";

  schema = {
    id: {
      type: z.string(),
      description: "The inscription ID (e.g. b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735i0)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { id, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/inscription/${id}`, {
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
          id: data.data.inscription_id,
          number: data.data.inscription_number,
          type: data.data.content_type,
          timestamp: new Date(data.data.timestamp).toLocaleString(),
          sat: data.data.sat.toLocaleString(),
          content_url: data.data.content_url,
          collection: data.data.collection_slug || 'N/A',
          owner: {
            address: data.data.owner_address,
            output: data.data.owner_output
          },
          genesis: {
            address: data.data.genesis_address,
            output: data.data.genesis_output
          },
          satributes: data.data.satributes,
          metadata: data.data.metadata,
          metaprotocol: data.data.metaprotocol || 'N/A',
          parent: data.data.parent_inscription_id || 'N/A',
          delegate: data.data.delegate_inscription_id || 'N/A',
          submodules: data.data.submodules,
          sats_name: data.data.sats_name || 'N/A',
          brc20: data.data.brc20_action ? {
            type: data.data.brc20_action.type,
            tick: data.data.brc20_action.tick
          } : null
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

export default OrdiscanInscriptionInfoTool; 