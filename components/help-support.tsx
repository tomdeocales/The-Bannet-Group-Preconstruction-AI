"use client"

import { Search, Book, MessageCircle, FileText, Video, ExternalLink, ChevronRight, Mail, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const faqs = [
  {
    question: "How does the AI Estimator calculate costs?",
    answer:
      "The AI Estimator analyzes your uploaded drawings to identify quantities (like linear feet of wall or count of fixtures) and multiplies them by unit costs derived from your historical data and current market rates.",
  },
  {
    question: "Can I customize the cost codes?",
    answer:
      "Yes! In the Estimator, you can manually map items to specific CSI MasterFormat codes. You can also save these mappings as templates for future projects.",
  },
  {
    question: "How do I invite subcontractors to bid?",
    answer:
      "Once you have selected subcontractors in the 'Subcontractor Matching' module, click 'Push to Procore'. This will create a Bid Package in Procore where you can send out invitations.",
  },
  {
    question: "What file formats are supported for Zoning Review?",
    answer:
      "We support PDF, DOCX, and TXT files for zoning documents. For best results, ensure PDFs are text-selectable (OCR).",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We adhere to enterprise-grade security standards. Your data is encrypted in transit and at rest, and we do not share your project data with other clients.",
  },
]

export function HelpSupport() {
  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Help & Support</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-9 h-9 rounded-full bg-bannett-navy flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="shadow-sm flex-1 min-h-0">
        <CardContent className="p-6 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="space-y-8">
            {/* Search Hero */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-3xl font-bold tracking-tight">How can we help you today?</h2>
              <p className="text-muted-foreground text-lg">Search our knowledge base or browse common topics below.</p>
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for articles, guides, and more..." className="pl-10 h-12 text-lg shadow-sm" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Knowledge Base
                  </CardTitle>
                  <CardDescription>Browse articles and implementation guides.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Articles
                  </Button>
                </CardFooter>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>Chat with Bannett preconstruction support.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full bg-bannett-navy hover:bg-bannett-navy/90">Start Chat</Button>
                </CardFooter>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Training Videos
                  </CardTitle>
                  <CardDescription>Learn the workflows in 5-minute videos.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Watch Videos
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* FAQs */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Top FAQs</h3>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="text-left text-card-foreground">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Submit a Request */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Submit a Request</CardTitle>
                <CardDescription>Describe your issue and we’ll respond quickly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief summary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea id="details" placeholder="Describe what you need help with..." rows={4} />
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="your.email@bannett.com" />
                  <Button>Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
