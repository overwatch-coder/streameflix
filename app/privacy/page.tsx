export default function Privacy() {
  const points = [
    {
      title: "Data Collection",
      content:
        "We collect minimal information required to provide our social features, such as your username, email, and avatar choice when you create a profile.",
    },
    {
      title: "Usage Information",
      content:
        "We may collect anonymous data about how you interact with our site to improve the user experience and content recommendations.",
    },
    {
      title: "Cookies",
      content:
        "We use cookies to maintain your login session and remember your preferences (like dark mode or volume settings).",
    },
    {
      title: "Third Parties",
      content:
        "We do not sell your personal data. We use Supabase for authentication and database management, and TMDB for content metadata.",
    },
    {
      title: "Security",
      content:
        "We take reasonable measures to protect your information, but no method of transmission over the internet is 100% secure.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Privacy Policy
      </h1>
      <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-8">
        <p className="text-gray-400">
          Your privacy is important to us. This policy outlines how we handle
          your data.
        </p>
        <div className="grid gap-8">
          {points.map((point, i) => (
            <div key={i} className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {point.title}
              </h2>
              <p className="text-gray-400 leading-relaxed">{point.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
