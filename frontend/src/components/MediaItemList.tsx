"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

interface MediaItem {
  id: string;
  type: string;
  url: string;
  title: string;
  content: string;
  description: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

function MediaItemList() {
  const [url, setURL] = useState("");
  const [note, setNote] = useState("some testing note");
  const [mediaItems, setMediaItems] = useState<MediaItem[] | null>(null);

  const createMediaItem = api.user.addMediaItem.useMutation();
  const getMediaItems = api.mediaItem.getMediaItems.useQuery({});
  const deleteMediaItem = api.mediaItem.deleteMediaItem.useMutation();

  useEffect(() => {
    if (getMediaItems.data) {
      setMediaItems(getMediaItems.data);
    }
  }, [getMediaItems.data]);

  const createNewMediaItem = async () => {
    createMediaItem.mutate({ url, note });
    await getMediaItems.refetch();
    setURL("");
    setNote("");
  };

  const handleRemoveMediaItem = async (id: string) => {
    deleteMediaItem.mutate({ id });
    await getMediaItems.refetch();
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid"></div>
      <div className="grid space-y-2 rounded-xl border p-4">
        <Label htmlFor="url">Article URL</Label>
        <Input
          name="url"
          type="text"
          className=""
          onChange={(e) => {
            setURL(e.target.value);
          }}
          value={url}
          placeholder="https://example.com"
        />
        <Label htmlFor="url">Notes</Label>
        <Input
          name="url"
          type="text"
          className=""
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
          placeholder="Notes about the article."
        />
        <Button className="w-full" onClick={createNewMediaItem} type="button">
          Add new item
        </Button>
      </div>
      {/* <div className="h-px w-full bg-neutral-500/20" /> */}
      <div className="space-y-4">
        {mediaItems?.map((item) => (
          <div key={item.url} className="grid space-y-1 rounded-xl border p-4">
            <div className="">
              <p className="font-semibold">{item.title}</p>
              <a
                href={item.url}
                className="font-sans text-sm text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            </div>
            <button
              className="font-sans text-sm font-medium text-red-600"
              type="button"
              onClick={() => handleRemoveMediaItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {!mediaItems && (
        <div className="">
          <p className="">You have no media items.</p>
        </div>
      )}
    </div>
  );
}

export default MediaItemList;
