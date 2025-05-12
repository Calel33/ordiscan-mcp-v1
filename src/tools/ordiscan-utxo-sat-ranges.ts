import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface OrdiscanInput {
  utxo: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: [number, number][];
}

class OrdiscanUTXOSatRangesTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_utxo_sat_ranges";
  description = "Get all the sat ranges for a specific UTXO";

  schema = {
    utxo: {
      type: z.string(),
      description: "A valid Bitcoin UTXO (e.g. 3d57f76284e17370f1ce45e75f68b5960906c4117951607f20ddd19f85c15706:0)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { utxo, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/utxo/${utxo}/sat-ranges`, {
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
          total_ranges: data.data.length,
          total_sats: data.data.reduce((acc, [start, end]) => acc + (end - start), 0),
          ranges: data.data.map(([start, end]) => ({
            start: start.toLocaleString(),
            end: (end - 1).toLocaleString(), // end is exclusive in API
            count: (end - start).toLocaleString(),
            epoch: this.getEpoch(start),
            block_estimate: this.estimateBlock(start)
          })),
          summary: {
            epochs: this.summarizeEpochs(data.data),
            total_value: this.calculateTotalValue(data.data)
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

  private getEpoch(satNumber: number): number {
    // Each epoch is 210,000 blocks with 5,000,000,000 sats per block
    const satsPerBlock = 5000000000;
    const blocksPerEpoch = 210000;
    const satsPerEpoch = satsPerBlock * blocksPerEpoch;
    return Math.floor(satNumber / satsPerEpoch);
  }

  private estimateBlock(satNumber: number): number {
    // Each block creates 5,000,000,000 sats
    const satsPerBlock = 5000000000;
    return Math.floor(satNumber / satsPerBlock);
  }

  private summarizeEpochs(ranges: [number, number][]): {
    epoch: number;
    count: number;
  }[] {
    const epochCounts = new Map<number, number>();

    ranges.forEach(([start, end]) => {
      for (let sat = start; sat < end; sat += 5000000000) { // Sample every block
        const epoch = this.getEpoch(sat);
        epochCounts.set(epoch, (epochCounts.get(epoch) || 0) + 1);
      }
    });

    return Array.from(epochCounts.entries())
      .map(([epoch, count]) => ({ epoch, count }))
      .sort((a, b) => a.epoch - b.epoch);
  }

  private calculateTotalValue(ranges: [number, number][]): string {
    const totalSats = ranges.reduce((acc, [start, end]) => acc + (end - start), 0);
    const btc = totalSats / 100000000; // 1 BTC = 100,000,000 sats
    return btc.toLocaleString(undefined, { minimumFractionDigits: 8 }) + ' BTC';
  }
}

export default OrdiscanUTXOSatRangesTool; 