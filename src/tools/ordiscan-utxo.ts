import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanUtxoInput {
  address: string;
  apiKey?: string;
}

interface RuneBalance {
  name: string;
  balance: string;
}

interface UtxoData {
  outpoint: string;
  value: number;
  runes: RuneBalance[];
  inscriptions: string[];
}

interface OrdiscanUtxoResponse {
  data: UtxoData[];
}

class OrdiscanUtxoTool extends MCPTool<OrdiscanUtxoInput> {
  name = "ordiscan_address_utxos";
  description = "Get all UTXOs owned by a Bitcoin address and their associated inscriptions and runes";

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

  async execute(input: OrdiscanUtxoInput) {
    const { address, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/address/${address}/utxos`, {
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

      const data: OrdiscanUtxoResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: data.data.map(utxo => ({
          outpoint: utxo.outpoint,
          value_sats: utxo.value,
          value_btc: (utxo.value / 100000000).toFixed(8),
          rune_count: utxo.runes.length,
          inscription_count: utxo.inscriptions.length,
          has_runes: utxo.runes.length > 0,
          has_inscriptions: utxo.inscriptions.length > 0
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

export default OrdiscanUtxoTool; 