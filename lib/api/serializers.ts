import type {
  Discussion,
  DiscussionReply,
  Favorite,
  Reaction,
  Review,
  ReviewReply,
  User,
  WatchHistoryItem,
  WatchListItem,
} from "@prisma/client";

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.fullName || user.email.split("@")[0],
    avatar: user.avatarUrl || "/placeholder.svg?height=40&width=40",
    username: user.username,
    full_name: user.fullName,
    avatar_url: user.avatarUrl,
    bio: user.bio,
  };
}

export function serializePublicProfile(user: User) {
  return {
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    avatar_url: user.avatarUrl,
    bio: user.bio,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export function serializeLibraryItem(item: Favorite | WatchListItem) {
  return {
    id: Number(item.mediaId),
    media_id: item.mediaId,
    media_type: item.mediaType,
    type: item.mediaType,
    title: item.title || "",
    poster_path: item.posterPath || "",
    vote_average: item.voteAverage || 0,
    release_date: "",
    overview: item.overview || "",
    created_at: item.createdAt.toISOString(),
  };
}

export function serializeWatchHistory(item: WatchHistoryItem) {
  return {
    id: Number(item.mediaId),
    media_id: item.mediaId,
    media_type: item.mediaType,
    title: item.title || "",
    type: item.mediaType,
    poster_path: item.posterPath,
    progress: item.progress,
    currentTime: item.progress,
    duration: item.duration,
    lastWatched: item.lastWatchedAt.toISOString(),
    last_watched_at: item.lastWatchedAt.toISOString(),
    seasonNumber: item.seasonNumber,
    season_number: item.seasonNumber,
    episodeNumber: item.episodeNumber,
    episode_number: item.episodeNumber,
  };
}

type UserPreview = Pick<User, "username" | "avatarUrl" | "fullName">;

function serializeProfilePreview(user: UserPreview) {
  return {
    username: user.username,
    avatar_url: user.avatarUrl,
    full_name: user.fullName,
  };
}

export function serializeReaction(reaction: Reaction) {
  return {
    user_id: reaction.userId,
    type: reaction.type,
  };
}

export function serializeDiscussion(
  discussion: Discussion & {
    user: UserPreview;
    replies: Array<DiscussionReply & { user: UserPreview }>;
    reactions?: Reaction[];
  },
) {
  return {
    id: discussion.id,
    user_id: discussion.userId,
    content: discussion.content,
    media_id: discussion.mediaId,
    media_type: discussion.mediaType,
    media_title: discussion.mediaTitle,
    media_poster: discussion.mediaPoster,
    created_at: discussion.createdAt.toISOString(),
    profiles: serializeProfilePreview(discussion.user),
    discussion_replies: discussion.replies.map((reply) => ({
      id: reply.id,
      discussion_id: reply.discussionId,
      user_id: reply.userId,
      content: reply.content,
      created_at: reply.createdAt.toISOString(),
      profiles: serializeProfilePreview(reply.user),
    })),
    reactions: (discussion.reactions || []).map(serializeReaction),
  };
}

export function serializeReview(
  review: Review & {
    user: UserPreview;
    replies: Array<ReviewReply & { user: UserPreview }>;
    reactions?: Reaction[];
  },
) {
  return {
    id: review.id,
    user_id: review.userId,
    media_id: review.mediaId,
    media_type: review.mediaType,
    media_title: review.mediaTitle,
    media_poster: review.mediaPoster,
    rating: review.rating,
    content: review.content,
    season_number: review.seasonNumber,
    episode_number: review.episodeNumber,
    created_at: review.createdAt.toISOString(),
    updated_at: review.updatedAt.toISOString(),
    profiles: serializeProfilePreview(review.user),
    review_replies: review.replies.map((reply) => ({
      id: reply.id,
      review_id: reply.reviewId,
      user_id: reply.userId,
      content: reply.content,
      created_at: reply.createdAt.toISOString(),
      profiles: serializeProfilePreview(reply.user),
    })),
    reactions: (review.reactions || []).map(serializeReaction),
  };
}
