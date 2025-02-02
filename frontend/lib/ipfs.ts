import { create } from "ipfs-http-client";

// Define types
export interface IPFSFile {
  path: string;
  content: File;
}

// Create IPFS client
const auth =
  "Basic " +
  btoa(
    process.env.NEXT_PUBLIC_IPFS_PROJECT_ID +
      ":" +
      process.env.NEXT_PUBLIC_IPFS_API_KEY
  );

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await ipfs.add(file);
    return added.path;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("IPFS upload failed");
  }
};
