"use client";
import { useState } from "react";
import { X, TestTube, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TestnetBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 dark:from-blue-950/20 dark:to-purple-950/20 dark:border-blue-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Demo Version
              </Badge>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                🚀 <strong>Portfolio Showcase</strong> - Running on Sepolia Testnet with test ETH only
              </span>
            </div>
            <div className="sm:hidden">
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Portfolio Demo • Test ETH Only
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 h-8"
                onClick={() => window.open("https://sepoliafaucet.com/", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Test ETH
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 h-8"
                onClick={() => window.open("https://github.com/yourusername/crowdfunding-dapp", "_blank")}
              >
                <Github className="h-3 w-3 mr-1" />
                GitHub
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile links */}
        <div className="md:hidden mt-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 h-7 text-xs"
            onClick={() => window.open("https://sepoliafaucet.com/", "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Get Test ETH
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 h-7 text-xs"
            onClick={() => window.open("https://github.com/yourusername/crowdfunding-dapp", "_blank")}
          >
            <Github className="h-3 w-3 mr-1" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
