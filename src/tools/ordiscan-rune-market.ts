import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface RuneMarketInfo {
  price_in_sats: number;
  price_in_usd: number;
  market_cap_in_btc: number;
  market_cap_in_usd: number;
}

interface OrdiscanInput {
  name: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: RuneMarketInfo;
}

class OrdiscanRuneMarketTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_rune_market";
  description = "Get the latest price and market cap for a rune";

  schema = {
    name: {
      type: z.string(),
      description: "The unique name of the rune (without spacers)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { name, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/rune/${name}/market`, {
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
          price: {
            sats: data.data.price_in_sats.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
            usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.data.price_in_usd)
          },
          market_cap: {
            btc: data.data.market_cap_in_btc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
            usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.data.market_cap_in_usd)
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

export default OrdiscanRuneMarketTool; 