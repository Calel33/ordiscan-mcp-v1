import { MCPServer } from "mcp-framework";

// Main Ordiscan Tool
import OrdiscanTool from "./tools/ordiscan";

// Address Tools
import AddressUTXOTool from "./tools/ordiscan-utxo";
import AddressInscriptionsTool from "./tools/ordiscan-inscriptions";
import AddressInscriptionsDetailTool from "./tools/ordiscan-inscriptions-detail";
import AddressRunesBalanceTool from "./tools/ordiscan-runes-balance";
import AddressBRC20BalanceTool from "./tools/ordiscan-brc20-balance";
import AddressRareSatsTool from "./tools/ordiscan-rare-sats";

// Activity Tools
import InscriptionsActivityTool from "./tools/ordiscan-inscriptions-activity";
import RunesActivityTool from "./tools/ordiscan-runes-activity";
import BRC20ActivityTool from "./tools/ordiscan-brc20-activity";

// Transaction Tools
import TransactionInfoTool from "./tools/ordiscan-tx-info";
import TransactionInscriptionsTool from "./tools/ordiscan-tx-inscriptions";
import InscriptionTransfersTool from "./tools/ordiscan-tx-inscription-transfers";
import TransactionRunesTool from "./tools/ordiscan-tx-runes";

// Inscription Tools
import InscriptionInfoTool from "./tools/ordiscan-inscription-info";
import InscriptionTraitsTool from "./tools/ordiscan-inscription-traits";
import InscriptionsListTool from "./tools/ordiscan-inscriptions-list";
import InscriptionsDetailTool from "./tools/ordiscan-inscriptions-detail";

// Collection Tools
import CollectionsListTool from "./tools/ordiscan-collections-list";
import CollectionInfoTool from "./tools/ordiscan-collection-info";
import CollectionInscriptionsTool from "./tools/ordiscan-collection-inscriptions";

// Rune Tools
import RunesListTool from "./tools/ordiscan-runes-list";
import RuneMarketTool from "./tools/ordiscan-rune-market";
import RuneNameUnlockTool from "./tools/ordiscan-rune-name-unlock";

// BRC-20 Tools
import BRC20ListTool from "./tools/ordiscan-brc20-list";
import BRC20InfoTool from "./tools/ordiscan-brc20-info";

// Sat Tools
import SatInfoTool from "./tools/ordiscan-sat-info";
import UTXORareSatsTool from "./tools/ordiscan-utxo-rare-sats";
import UTXOSatRangesTool from "./tools/ordiscan-utxo-sat-ranges";

// Create server with HTTP Stream transport
const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 1337,
      endpoint: "/mcp",
      responseMode: "stream"
    }
  }
});

// Start the server - tools will be automatically discovered
server.start().then(() => {
  console.log('MCP Server running on port 1337');
  console.log('Loaded Ordiscan API tools:');
  console.log('- 1 Main Ordiscan Tool');
  console.log('- 6 Address Tools');
  console.log('- 3 Activity Tools');
  console.log('- 4 Transaction Tools');
  console.log('- 4 Inscription Tools');
  console.log('- 3 Collection Tools');
  console.log('- 3 Rune Tools');
  console.log('- 2 BRC-20 Tools');
  console.log('- 3 Sat Tools');
  console.log('Total: 29 Tools');
}).catch((error: Error) => {
  console.error('Failed to start MCP Server:', error);
}); 