"use client";
import { Github, Linkedin, ExternalLink, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PortfolioFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        {/* Main content - Mobile optimized */}
        <div className="flex flex-col space-y-4">
          
          {/* Top Section - Project Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Code className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm lg:text-base text-center sm:text-left">
                Decentralized Crowdfunding Platform
              </span>
            </div>
            
            {/* Tech Stack - Mobile friendly */}
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              Built with{" "}
              <span className="text-primary font-medium">Solidity</span>,{" "}
              <span className="text-primary font-medium">Next.js</span>,{" "}
              <span className="text-primary font-medium">TypeScript</span>
            </div>
          </div>

          {/* Middle Section - Badges */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Portfolio Project
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-1">
              Sepolia Testnet
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-1">
              Test ETH Only
            </Badge>
          </div>

          {/* Links Section - Mobile optimized */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 lg:px-3 text-xs"
              onClick={() =>
                window.open(
                  "https://github.com/Chukwuemekamusic/my_crowdfunding.git",
                  "_blank"
                )
              }
            >
              <Github className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">GitHub</span>
              <span className="xs:hidden">Code</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 lg:px-3 text-xs"
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/joseph-anyaegbunam-b1a430253/",
                  "_blank"
                )
              }
            >
              <Linkedin className="h-3 w-3 mr-1" />
              LinkedIn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 lg:px-3 text-xs"
              onClick={() =>
                window.open(
                  "https://sepolia.etherscan.io/address/0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A",
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Contract
            </Button>
          </div>
        </div>

        {/* Bottom Section - Legal & Features */}
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
          {/* Legal Notice */}
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Portfolio Demonstration • No real money involved • Educational purposes only
          </div>
          
          {/* Features - Stack on mobile, inline on larger screens */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              🚀 <span className="hidden sm:inline">Full-Stack</span> Web3 Development
            </span>
            <span className="flex items-center gap-1">
              ⚡ Gas-Optimized Smart Contracts
            </span>
            <span className="flex items-center gap-1">
              🎨 Modern UI/UX Design
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
