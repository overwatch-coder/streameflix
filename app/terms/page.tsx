export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using StreameFlix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
    },
    {
      title: "2. Description of Service",
      content:
        "StreameFlix is a content discovery and curation platform. We aggregate metadata from TMDB and provide links to community-contributed streaming sources. We do not host any video content on our servers.",
    },
    {
      title: "3. User Conduct",
      content:
        "Users are responsible for their own interactions and content (reviews, discussions). Harassment, hate speech, or sharing prohibited content will lead to account suspension.",
    },
    {
      title: "4. Intellectual Property",
      content:
        "All movie metadata and images are provided by The Movie Database (TMDB). Streaming links are provided by third parties. We respect intellectual property rights and will respond to valid DMCA requests.",
    },
    {
      title: "5. Disclaimer of Warranties",
      content:
        'The service is provided "as is" without any warranties, express or implied. We do not guarantee the availability or quality of third-party streaming links.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Terms of Service
      </h1>
      <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-8">
        <p className="text-gray-400">Last Updated: May 23, 2024</p>
        {sections.map((section, i) => (
          <div key={i} className="space-y-3">
            <h2 className="text-xl font-semibold text-white">
              {section.title}
            </h2>
            <p className="text-gray-400 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
