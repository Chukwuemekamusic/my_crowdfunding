"use client";

import { useState } from "react";
import Image from "next/image";
import { ConnectButton } from "@/components/ConnectButton";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadFile = async () => {
    try {
      if (!file) {
        alert("No file selected");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("file", file);
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const ipfsUrl = await uploadRequest.json();
      setUrl(ipfsUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center">
      <ConnectButton />
      <input type="file" onChange={handleChange} />
      {preview && (
        <Image src={preview} alt="Image Preview" width={100} height={100} />
      )}
      <button type="button" disabled={uploading} onClick={uploadFile}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {/* Add a conditional looking for the signed url and use it as the source */}
      {url && (
        <Image src={url} alt="Image from Pinata" width={500} height={500} />
      )}
    </main>
  );
}
