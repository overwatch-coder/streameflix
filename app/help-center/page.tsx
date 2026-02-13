import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle, PlayCircle, ShieldCheck } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          How can we help you?
        </h1>
        <p className="text-gray-400">
          Search for help or browse frequent topics below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: PlayCircle,
            title: "Getting Started",
            desc: "Setting up your account and watching content.",
          },
          {
            icon: ShieldCheck,
            title: "Account & Billing",
            desc: "Manage your subscription and security.",
          },
          {
            icon: Search,
            title: "Watching Anywhere",
            desc: "Devices and streaming quality information.",
          },
          {
            icon: MessageCircle,
            title: "Community & Social",
            desc: "How reviews and discussions work.",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-red-600 transition-colors cursor-pointer group"
          >
            <card.icon className="h-8 w-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-gray-800">
            <AccordionTrigger className="text-white hover:text-red-500">
              How do I start watching?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Simply search for a movie or TV show using the search bar at the
              top, select a title, and click "Watch Now". You may need to choose
              a preferred server source for the best experience.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-gray-800">
            <AccordionTrigger className="text-white hover:text-red-500">
              Is StreameFlix free?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              StreameFlix provides access to content via community-driven links
              and third-party sources. We do not charge for access to content,
              but we recommend using an ad-blocker for the best experience on
              certain server links.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-gray-800">
            <AccordionTrigger className="text-white hover:text-red-500">
              How do reviews work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              You can rate any movie or TV show on a scale of 1-10 and write a
              detailed review. Reviews help other community members find
              high-quality content. You can also mark reviews as helpful!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-gray-800">
            <AccordionTrigger className="text-white hover:text-red-500">
              Can I request content?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Currently, we aggregate content from TMDB and various streaming
              pools. If a title is on TMDB, it should appear here. If a source
              link is broken, please try an alternative server.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
