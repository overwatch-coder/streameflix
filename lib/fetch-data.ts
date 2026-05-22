import { Discussion } from "@/components/social-feed";

interface GetDiscussionsParams {
  mediaId?: string;
  mediaType?: string;
  limit?: number;
  user_id?: string;
}

export const getDiscussions = async ({
  mediaId,
  mediaType,
  limit,
}: GetDiscussionsParams): Promise<Discussion[]> => {
  try {
    const params = new URLSearchParams();
    if (mediaId) params.set("media_id", mediaId);
    if (mediaType) params.set("media_type", mediaType);
    if (limit) params.set("limit", String(limit));

    const response = await fetch(`/api/discussions?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch discussions");

    const data = await response.json();
    return data.discussions || [];
  } catch (error: any) {
    console.log("Error fetching discussions: ", { error });
    return [];
  }
};

export const formatDiscussions = (discussions: Discussion[]) => {
  if (!discussions?.length) return [];
  return discussions;
};
