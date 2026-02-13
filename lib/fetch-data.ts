import { Discussion } from "@/components/social-feed";
import { supabase } from "./supabase";

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
  user_id,
}: GetDiscussionsParams): Promise<Discussion[]> => {
  try {
    let query = supabase
      .from("discussions")
      .select(
        `
          *,
          profiles (username, avatar_url, full_name, reactions (type, user_id)),
          discussion_replies (
            *,
            profiles (username, avatar_url, full_name, reactions (type, user_id))
          )
        `,
      )
      .order("created_at", { ascending: false });

    if (mediaId && mediaType) {
      query = query.eq("media_id", mediaId).eq("media_type", mediaType);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return formatDiscussions(data || [], user_id || "");
  } catch (error: any) {
    console.log("Error fetching discussions: ", { error });
    return [];
  }
};

export const formatDiscussions = (
  discussions: Discussion[],
  user_id: string,
) => {
  if (!discussions?.length) return [];

  return discussions.map((discussion) => ({
    ...discussion,
    reactions: discussion?.profiles?.reactions?.filter(
      (reaction: { user_id: string; type: string }) =>
        reaction.user_id === user_id,
    ),
  }));
};
