const { Account, ProgramManager, initThreadPool, AleoKeyProvider, NetworkRecordProvider, AleoNetworkClient } = require('@provablehq/sdk'); // Adjust import based on exact package
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const RPC_URL = process.env.ALEO_MAINNET_RPC_URL || "https://mainnet.aleo.org";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const FEE_MICRO = BigInt(process.env.FEE_MICRO_CREDITS || "3800000"); // in microcredits (1 credit = 1_000_000 micro)

  if (!PRIVATE_KEY) throw new Error("⛔ PRIVATE_KEY not set in .env file");

  console.log("🚀 Starting Aleo program deployment...");

  // Initialize WASM thread pool (required for ZK ops)
  await initThreadPool();

  // Create account from private key
  const account = new Account({ privateKey: PRIVATE_KEY });
  console.log("Deployer address:", account.address().to_string());

  // Setup providers
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const networkClient = new AleoNetworkClient(RPC_URL);
  const recordProvider = new NetworkRecordProvider(account, networkClient);

  // ProgramManager handles deployment
  const programManager = new ProgramManager(RPC_URL, keyProvider, recordProvider);
  programManager.setAccount(account);

  // Load your Leo program source (from src/main.leo)
  const programPath = path.join(__dirname, "../programs/ogvoe/src/main.leo");
  const programSource = fs.readFileSync(programPath, "utf8");

  // Optional: If SDK expects compiled Aleo instructions, run leo build and load from build/ogvoe.aleo (adjust accordingly)
  // For many SDK versions, raw source works if it auto-compiles.

  console.log("✅ Wallet ready. Checking balance...");

  // Get balance (Aleo uses records; this fetches spendable credits)
  const credits = await recordProvider.findRecordsUnspent(); // or similar method to sum microcredits
  const balanceMicro = credits.reduce((sum, r) => sum + BigInt(r.microcredits), 0n);
  console.log("Balance:", Number(balanceMicro) / 1_000_000, "Aleo credits");

  if (balanceMicro < FEE_MICRO * 2n) throw new Error("⛔ Insufficient balance for deployment fee");

  console.log("✅ Funded. Deploying ogvoe.aleo program...");

  try {
    // Deploy: returns transaction ID if successful
    const txId = await programManager.deploy(
      programSource,           // Program string
      Number(FEE_MICRO),       // Fee in microcredits (convert to number if needed)
      false                    // Optional: true = dry-run/build only, false = broadcast
    );

    console.log("⏳ Deployment transaction sent. TX ID:", txId);

    // Wait for confirmation (poll or use SDK wait method if available)
    console.log("Waiting for confirmation...");
    // Simple polling example (improve with SDK utils if present)
    let confirmed = false;
    for (let i = 0; i < 30; i++) {
      const status = await networkClient.getTransaction(txId); // Adjust method name
      if (status && status.status === "committed") { // or check for inclusion
        confirmed = true;
        break;
      }
      await new Promise(r => setTimeout(r, 5000)); // 5s poll
    }

    if (!confirmed) throw new Error("Deployment not confirmed in time");

    console.log("✅ ogvoe.aleo deployed successfully!");
    console.log("Program ID: ogvoe.aleo"); // Fixed from program name
    console.log("Explorer: https://explorer.aleo.org/program/ogvoe.aleo"); // Or current explorer URL

    // Save deployment info
    const deploymentInfo = {
      programId: "ogvoe.aleo",
      deployer: account.address().to_string(),
      txId: txId,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("deployedAddresses.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Saved to deployedAddresses.json");

  } catch (error) {
    console.error("❌ Deployment error:", error);
    process.exitCode = 1;
  }

  console.log("\n🎉 Deployment Complete!");
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exitCode = 1;
});