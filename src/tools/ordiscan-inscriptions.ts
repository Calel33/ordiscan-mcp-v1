import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanInscriptionsInput {
  address: string;
  apiKey?: string;
}

interface OrdiscanInscriptionsResponse {
  data: string[];
}

class OrdiscanInscriptionsTool extends MCPTool<OrdiscanInscriptionsInput> {
  name = "ordiscan_address_inscriptions";
  description = "Get all inscription IDs owned by a Bitcoin address";

  schema = {
    address: {
      type: z.string(),
      description: "A valid Bitcoin address",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInscriptionsInput) {
    const { address, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/address/${address}/inscription-ids`, {
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

      const data: OrdiscanInscriptionsResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_inscriptions: data.data.length,
          inscriptions: data.data.map(id => ({
            id,
            short_id: id.substring(0, 8) + '...' + id.substring(id.length - 8)
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

export default OrdiscanInscriptionsTool; 