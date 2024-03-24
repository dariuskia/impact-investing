"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

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

interface PortfolioAllocation {
  company_name: string;
  symbol: string;
  qty: number;
  explanation: string;
}

interface PortfolioAllocationResponse {
  companies: PortfolioAllocation[];
}

function AddMediaItem() {
  const [url, setURL] = useState("");
  const [note, setNote] = useState("some testing note");
  const [mediaItems, setMediaItems] = useState<MediaItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [portfolioAllocation, setPortfolioAllocation] = useState<
    PortfolioAllocation[] | null
  >(null);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (symbol: string, newQuantity: number) => {
    setQuantities({ ...quantities, [symbol]: newQuantity });
  };

  useEffect(() => {
    if (portfolioAllocation) {
      portfolioAllocation.forEach((company) => {
        setQuantities((prev) => ({
          ...prev,
          [company.symbol]: company.qty,
        }));
      });
    }
  }, [portfolioAllocation]);

  const createMediaItem = api.user.addMediaItem.useMutation();
  const getMediaItems = api.mediaItem.getMediaItems.useQuery({});

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

  const generatePortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://superb-mighty-tortoise.ngrok-free.app/search",
        {
          method: "POST",
          body: JSON.stringify({ userid: "65ffdc76de87564a15e4bf94" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const jsonData: unknown = await response.json();
      console.log(jsonData);
      setPortfolioAllocation(
        (jsonData as PortfolioAllocationResponse).companies as
          | PortfolioAllocation[]
          | null,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const finalGeneratePortfolio = async () => {
    setLoading(true);
    const updatedPortfolioAllocation = portfolioAllocation?.map((company) => ({
      ...company,
      qty: quantities[company.symbol],
    }));

    const bodyData = JSON.stringify({
      userid: "65ffdc76de87564a15e4bf94",
      companies: updatedPortfolioAllocation,
    });

    try {
      const response = await fetch(
        "https://superb-mighty-tortoise.ngrok-free.app/createportfolio",
        {
          method: "POST",
          body: bodyData,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const jsonData: unknown = await response.json();
      console.log(jsonData);
      setPortfolioAllocation(
        (jsonData as PortfolioAllocationResponse).companies as
          | PortfolioAllocation[]
          | null,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add new media</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new media</DialogTitle>
          <DialogDescription>
            Upload a video or news article to use as context for your generated
            portfolio.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center">
            Generating portfolio allocation...
          </div>
        )}
        {!isLoading && !portfolioAllocation && (
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2 space-y-2">
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
            </div>
          </div>
        )}
        {!isLoading && portfolioAllocation && (
          <div className="grid gap-2">
            {portfolioAllocation.map((company) => (
              <div key={company.symbol}>
                <Label htmlFor={`quantity-${company.symbol}`}>
                  {company.company_name}
                </Label>
                <Input
                  name={`quantity-${company.symbol}`}
                  type="number"
                  className=""
                  value={quantities?.[company.symbol] ?? ""}
                  onChange={(e) =>
                    handleQuantityChange(
                      company.symbol,
                      parseInt(e.target.value),
                    )
                  }
                  placeholder="Enter quantity"
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <div className="grid grid-cols-2 gap-4">
            {portfolioAllocation && (
              <Button
                className="w-full"
                onClick={finalGeneratePortfolio}
                type="button"
                disabled={isLoading}
              >
                Purchase stocks
              </Button>
            )}
            <Button
              className="w-full"
              onClick={createNewMediaItem}
              type="button"
              disabled={isLoading}
            >
              Add item
            </Button>
            <Button
              className="w-full"
              variant={"secondary"}
              onClick={generatePortfolio}
              type="button"
              disabled={isLoading}
            >
              Generate portfolio
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddMediaItem;
