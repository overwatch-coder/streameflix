"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: number
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
  likes: number
  dislikes: number
  helpful: boolean
}

interface UserReviewsProps {
  movieTitle: string
  movieId: number
  reviews?: Review[]
}

const mockReviews: Review[] = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 5,
    comment: "Absolutely incredible movie! The cinematography and acting were top-notch. Highly recommend!",
    date: "2024-01-15",
    likes: 24,
    dislikes: 2,
    helpful: true,
  },
  {
    id: 2,
    user: {
      name: "Sarah Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 4,
    comment: "Great storyline and character development. Some pacing issues in the middle, but overall very enjoyable.",
    date: "2024-01-12",
    likes: 18,
    dislikes: 5,
    helpful: false,
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 3,
    comment: "Decent movie but didn't live up to the hype. The ending felt rushed.",
    date: "2024-01-10",
    likes: 8,
    dislikes: 12,
    helpful: false,
  },
]

export default function UserReviews({ movieId, reviews = mockReviews }: UserReviewsProps) {
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmitReview = () => {
    if (userRating === 0 || userComment.trim() === "") {
      alert("Please provide both a rating and comment")
      return
    }

    // Here you would typically submit to your backend
    console.log("Submitting review:", { movieId, rating: userRating, comment: userComment })
    alert("Review submitted successfully!")
    setUserRating(0)
    setUserComment("")
  }

  const handleVote = (reviewId: number, type: "like" | "dislike") => {
    // Here you would typically update the vote via API
    console.log(`${type} review ${reviewId}`)
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            User Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= averageRating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                  />
                ))}
              </div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length
                const percentage = (count / reviews.length) * 100
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-gray-400 text-sm w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || userRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-600 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white text-sm mb-2 block">Your Review</label>
            <Textarea
              placeholder="Share your thoughts about this movie..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[100px]"
            />
          </div>
          <Button onClick={handleSubmitReview} className="bg-red-600 hover:bg-red-700">
            Submit Review
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                  <AvatarFallback className="bg-red-600 text-white">{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold">{review.user.name}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">{review.date}</span>
                    {review.helpful && (
                      <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                        Helpful
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, "like")}
                      className="text-gray-400 hover:text-green-400"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {review.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, "dislike")}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {review.dislikes}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
