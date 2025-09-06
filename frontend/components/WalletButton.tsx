import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Wallet,
  LogOut,
  Copy,
  ExternalLink,
  Coins,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";

export function WalletButton() {
  const { isConnected, connect, disconnect, address, isConnecting } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!window.ethereum || !address) return;

      try {
        setIsLoadingBalance(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (isConnected && address) {
      fetchBalance();
      // Set up balance refresh interval
      const intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setIsOpen(false);
      setBalance(null);
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full sm:w-auto"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
        <div className="text-xs text-muted-foreground text-right">
          💡 Switch to Sepolia testnet
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Balance Display */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <Coins className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {isLoadingBalance ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : balance ? (
            `${Number(balance).toFixed(4)} ETH`
          ) : (
            "-.-- ETH"
          )}
        </span>
      </div>

      {/* Wallet Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Wallet className="mr-2 h-4 w-4" />
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Connected"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Show balance in dropdown for mobile */}
          <div className="sm:hidden px-2 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {isLoadingBalance ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : balance ? (
                `${Number(balance).toFixed(4)} ETH`
              ) : (
                "-.-- ETH"
              )}
            </div>
          </div>
          <DropdownMenuSeparator className="sm:hidden" />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openEtherscan} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
