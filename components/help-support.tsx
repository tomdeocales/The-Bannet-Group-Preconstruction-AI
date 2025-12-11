"use client"

import { Search, Book, MessageCircle, FileText, Video, ExternalLink, ChevronRight, Mail, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ModuleType } from "@/app/page"

const faqs = [
  {
    question: "How does the AI Estimator calculate costs?",
    answer: "The AI Estimator analyzes your uploaded drawings to identify quantities (like linear feet of wall or count of fixtures) and multiplies them by unit costs derived from your historical data and current market rates."
  },
  {
    question: "Can I customize the cost codes?",
    answer: "Yes! In the Estimator, you can manually map items to specific CSI MasterFormat codes. You can also save these mappings as templates for future projects."
  },
  {
    question: "How do I invite subcontractors to bid?",
    answer: "Once you have selected subcontractors in the 'Subcontractor Matching' module, click 'Push to Procore'. This will create a Bid Package in Procore where you can send out invitations."
  },
  {
    question: "What file formats are supported for Zoning Review?",
    answer: "We support PDF, DOCX, and TXT files for zoning documents. For best results, ensure PDFs are text-selectable (OCR)."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We adhere to enterprise-grade security standards. Your data is encrypted in transit and at rest, and we do not share your project data with other clients."
  }
]

interface HelpSupportProps {
  onLogout?: () => void
  setActiveModule?: (module: ModuleType) => void
}

export function HelpSupport({ onLogout, setActiveModule }: HelpSupportProps) {
  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Help & Support</h1>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 [&_[data-highlighted]]:bg-accent [&_[data-highlighted]]:text-foreground [&_[data-highlighted]_span]:text-foreground [&_[data-highlighted]_p]:text-foreground"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Support ticket updated</span>
                <span className="text-xs text-muted-foreground">Zoning checklist guidance posted</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">New tutorial</span>
                <span className="text-xs text-muted-foreground">Watch “Estimate QA best practices”</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Release note</span>
                <span className="text-xs text-muted-foreground">Improved Procore sync stability</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3 pl-3 border-l border-bannett-navy/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-1 pr-3 py-1 h-11 rounded-full hover:bg-muted/50 focus-visible:ring-0 focus-visible:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-bannett-navy flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground leading-tight">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground leading-tight">Project Manager</p>
                    </div>
                  </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveModule?.("settings")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>

      {/* Content */}
      <Card className="shadow-sm flex-1 min-h-0">
        <CardContent className="p-0 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="px-6 py-0 space-y-8">

          {/* Search Hero */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-3xl font-bold tracking-tight">How can we help you today?</h2>
            <p className="text-muted-foreground text-lg">
              Search our knowledge base or browse common topics below.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for articles, guides, and more..."
                className="pl-10 h-12 text-base shadow-sm"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-2">
                  <Book className="h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Documentation</CardTitle>
                <CardDescription>
                  Detailed guides on how to use every feature of the platform.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="px-0">Read Guides <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 mb-2">
                  <Video className="h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Video Tutorials</CardTitle>
                <CardDescription>
                  Step-by-step video walkthroughs of common workflows.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="px-0">Watch Now <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 mb-2">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">API Reference</CardTitle>
                <CardDescription>
                  Technical documentation for developers and integrators.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="px-0">View API Docs <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQs */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Contact Support</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Still need help?</CardTitle>
                  <CardDescription>Send us a message and we'll get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What can we help with?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardFooter>
              </Card>

              <div className="p-4 rounded-lg bg-muted flex items-start gap-4">
                <MessageCircle className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Live Chat</h4>
                  <p className="text-sm text-muted-foreground mb-2">Available Mon-Fri, 9am - 5pm EST</p>
                  <Button variant="outline" size="sm" className="h-8">Start Chat</Button>
                </div>
              </div>
            </div>
          </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
