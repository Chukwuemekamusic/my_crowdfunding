"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CampaignForm({
  contract,
}: {
  contract: ethers.Contract;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    category: 0,
  });

  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    try {
      if (!file) {
        alert("No file selected");
        return;
      }

      //   setUploading(true);
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
      //   setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await uploadFile();
    } catch (error) {
      return;
    }

    await contract.createCampaign(
      form.title,
      form.description,
      ethers.parseEther(form.target),
      Math.floor(new Date(form.deadline).getTime() / 1000),
      url,
      form.category,
      false // save as draft
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <Input
        placeholder="Campaign Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Target (ETH)"
        value={form.target}
        onChange={(e) => setForm({ ...form, target: e.target.value })}
      />
      <Input
        type="datetime-local"
        value={form.deadline}
        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
      />
      <Input type="file" onChange={handleChange} />
      <Button type="submit">Create Campaign</Button>
    </form>
  );
}
