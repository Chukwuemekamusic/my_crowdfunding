# Troubleshooting Guide - Sepolia Contract Connection

## Issue Fixed
Error: `could not decode result data (value="0x")` when calling `getPublishedCampaigns()`

## What Was Wrong
1. **Wrong ABI format** - Frontend had array `[...]` instead of `{abi: [...]}`
2. **Cached build** - Next.js `.next` folder had old code
3. **Browser cache** - Browser had old contract instance

## What Was Fixed
✅ Copied correct ABI from `forge_contract/out/CrowdFunding.sol/CrowdFunding.json` to `frontend/constants/CrowdFunding.json`
✅ Deleted `.next` build cache
✅ Contract address is correct: `0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A`

## Steps to Test

### 1. Restart Dev Server
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

### 2. Clear Browser Cache
- **Hard Refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- **Or**: Open DevTools → Application → Clear Storage → Clear site data

### 3. Verify MetaMask Settings
- Network: **Sepolia Test Network**
- Chain ID should be: **11155111**

### 4. Reconnect Wallet
1. Disconnect wallet in the app if connected
2. Refresh the page
3. Connect wallet again

### 5. Check Browser Console
You should see:
```
Network info: Network {#name: 'sepolia', #chainId: 11155111n, ...}
```

**NOT:**
```
Network info: Network {#name: 'mainnet', #chainId: 1n, ...}
```

## Expected Behavior
- Wallet connects successfully to Sepolia
- Contract calls work without `value="0x"` error
- Campaigns load correctly

## Contract Details
- **Address**: `0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **RPC**: https://eth-sepolia.g.alchemy.com/v2/3Jb3TWD0R5XuZPppWD5PfKgAdfD0HsL-

## If Still Not Working

### Check .env file
Ensure these are set:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/3Jb3TWD0R5XuZPppWD5PfKgAdfD0HsL-
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Verify ABI
Check that `frontend/constants/CrowdFunding.json` starts with:
```json
{"abi":[...
```

NOT:
```json
[...
```

### Test Contract Directly
Run this in the frontend directory:
```bash
node -e "const { ethers } = require('ethers'); (async () => { const data = require('./constants/CrowdFunding.json'); const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/3Jb3TWD0R5XuZPppWD5PfKgAdfD0HsL-'); const contract = new ethers.Contract('0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A', data.abi, provider); const count = await contract.campaignCount(); console.log('✅ Works! Campaign count:', count.toString()); })();"
```

Should output: `✅ Works! Campaign count: 5`
