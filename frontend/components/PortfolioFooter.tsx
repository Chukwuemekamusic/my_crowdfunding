"use client";
import { Github, Linkedin, ExternalLink, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PortfolioFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Project info */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <span className="font-semibold">Decentralized Crowdfunding Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Portfolio Project
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sepolia Testnet
              </Badge>
              <Badge variant="outline" className="text-xs">
                Test ETH Only
              </Badge>
            </div>
          </div>

          {/* Right side - Links and attribution */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-right">
              Built with <span className="text-primary font-medium">Solidity</span>, 
              <span className="text-primary font-medium"> Next.js</span>, 
              <span className="text-primary font-medium"> TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => window.open("https://github.com/yourusername/crowdfunding-dapp", "_blank")}
              >
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => window.open("https://linkedin.com/in/yourprofile", "_blank")}
              >
                <Linkedin className="h-4 w-4 mr-1" />
                LinkedIn
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => window.open("https://sepolia.etherscan.io/address/0xYourContractAddress", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Contract
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom row - Additional info */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>
              © 2024 Portfolio Demonstration • No real money involved • Educational purposes only
            </div>
            <div className="flex items-center gap-4">
              <span>🚀 Full-Stack Web3 Development</span>
              <span>⚡ Gas-Optimized Smart Contracts</span>
              <span>🎨 Modern UI/UX Design</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
