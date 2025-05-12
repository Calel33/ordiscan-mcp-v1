import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";
interface SatInfo {
  ordinal: number;
  rarity: string;
  coinbase_height: number;
  timestamp: string;
  name: string;
  block_height: number;
  cycle: number;
  epoch: number;
  period: number;
  decimal: string;
  degree: string;
  percentile: string;
}

interface OrdiscanInput {
  ordinal: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: SatInfo;
}

class OrdiscanSatInfoTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_sat_info";
  description = "Get information about a specific satoshi";

  schema = {
    ordinal: {
      type: z.union([z.string(), z.number()]).refine(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        return !isNaN(num) && num >= 0 && num <= 2099999997689999;
      }, {
        message: "Ordinal must be between 0 and 2099999997689999"
      }),
      description: "The ordinal number of the satoshi",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { ordinal, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL(`https://api.ordiscan.com/v1/sat/${ordinal}`);

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
      const sat = data.data;
      
      return {
        success: true,
        data: sat,
        formatted: {
          ordinal: sat.ordinal.toLocaleString(),
          name: sat.name,
          rarity: sat.rarity,
          mining: {
            block: sat.block_height,
            coinbase_block: sat.coinbase_height,
            timestamp: new Date(sat.timestamp).toLocaleString()
          },
          position: {
            cycle: sat.cycle,
            epoch: sat.epoch,
            period: sat.period,
            decimal: sat.decimal,
            degree: sat.degree,
            percentile: sat.percentile
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

export default OrdiscanSatInfoTool; 