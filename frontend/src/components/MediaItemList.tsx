"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "@radix-ui/react-label";

interface MediaItem {
  id: string;
  type: string;
  url: string;
  title: string;
  content: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

function MediaItemList() {
  // const [url, setURL] = useState("");
  // const [note, setNote] = useState("some testing note");
  const [mediaItems, setMediaItems] = useState<MediaItem[] | null>(null);

  // const createMediaItem = api.user.addMediaItem.useMutation();
  const getMediaItems = api.mediaItem.getMediaItems.useQuery({});
  const deleteMediaItem = api.mediaItem.deleteMediaItem.useMutation();

  useEffect(() => {
    if (getMediaItems.data) {
      setMediaItems(getMediaItems.data);
    }
  }, [getMediaItems.data]);

  // const createNewMediaItem = async () => {
  //   createMediaItem.mutate({ url, note });
  //   await getMediaItems.refetch();
  //   setURL("");
  //   setNote("");
  // };

  const handleRemoveMediaItem = async (id: string) => {
    deleteMediaItem.mutate({ id });
    await getMediaItems.refetch();
  };

  // const generatePortfolio = async () => {
  //   const response = await fetch(
  //     "https://superb-mighty-tortoise.ngrok-free.app/search",
  //     {
  //       method: "POST",
  //       body: JSON.stringify({ userid: "65ffdc76de87564a15e4bf94" }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     },
  //   );

  //   const jsonData: unknown = await response.json();
  //   console.log(jsonData);
  // };

  return (
    <div className="w-full space-y-4 pt-8">
      {/* <div className="grid"></div>
      <div className="grid space-y-2 rounded-xl border p-4">
        <Label htmlFor="url">Media URL</Label>
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
        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full" onClick={createNewMediaItem} type="button">
            Add new item
          </Button>
          <Button
            className="w-full"
            variant={"secondary"}
            onClick={generatePortfolio}
            type="button"
          >
            Generate portfolio
          </Button>
        </div>
      </div> */}
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
              className="w-fit rounded-full bg-red-100/75 px-3 py-1 font-sans text-sm font-medium text-red-600"
              type="button"
              onClick={() => handleRemoveMediaItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {!mediaItems && (
        <div className="flex w-full justify-center text-center">
          <p className="">You have no media items.</p>
        </div>
      )}
    </div>
  );
}

export default MediaItemList;
