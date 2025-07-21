import SocialFeatures from "@/components/social-features"

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Hub</h1>
          <p className="text-gray-400">Connect with other movie enthusiasts and share your thoughts</p>
        </div>

        <SocialFeatures />
      </div>
    </div>
  )
}
