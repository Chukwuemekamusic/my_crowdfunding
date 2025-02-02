// // app/test/page.tsx
// "use client";

// import { ConnectWallet } from "@thirdweb-dev/react";
// import { ConnectButton } from "@/components/ConnectButton";
// import { useWeb3 } from "@/context";

// export default function TestPage() {
//   const { address, isConnected } = useWeb3();

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-3xl font-bold mb-8">Wallet Connection Test</h1>

//       <div className="grid gap-8">
//         {/* Custom Implementation */}
//         <div className="p-6 border rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Custom Implementation</h2>
//           <div className="mb-4">
//             <ConnectButton />
//           </div>
//           {isConnected && (
//             <div className="mt-4 p-4 bg-gray-50 rounded">
//               <p>Connected Address: {address}</p>
//             </div>
//           )}
//         </div>

//         {/* Thirdweb Implementation */}
//         <div className="p-6 border rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">
//             Thirdweb Implementation
//           </h2>
//           <div className="mb-4">
//             <ConnectWallet />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
