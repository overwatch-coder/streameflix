import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Have a question or feedback? We'd love to hear from you. Fill out the
          form below and our team will get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-red-600/10 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Email Us</h3>
              <p className="text-gray-500 text-sm">support@streameflix.com</p>
              <p className="text-gray-500 text-sm">media@streameflix.com</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-12 w-12 bg-red-600/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Live Chat</h3>
              <p className="text-gray-500 text-sm">
                Available 24/7 for premium members
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-12 w-12 bg-red-600/10 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Location</h3>
              <p className="text-gray-500 text-sm">
                Digital Nomad St. 101, Cloud City
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="bg-black/50 border-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Subject</label>
                <Input
                  placeholder="How can we help?"
                  className="bg-black/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Message</label>
                <Textarea
                  placeholder="Your message here..."
                  className="bg-black/50 border-gray-700 min-h-[150px]"
                />
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 h-12">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
