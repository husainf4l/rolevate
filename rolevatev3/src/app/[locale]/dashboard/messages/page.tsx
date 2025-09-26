import type { Metadata } from "next";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Messages - Rolevate",
  description: "Communicate with employers and recruiters",
};

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const conversations = [
    {
      id: 1,
      company: "TechCorp Inc.",
      contact: "Sarah Johnson",
      position: "HR Manager",
      avatar: "/placeholder-avatar.jpg",
      lastMessage:
        "Thank you for your application. We would like to schedule an interview with you.",
      timestamp: "2 hours ago",
      unread: true,
      messages: [
        {
          id: 1,
          sender: "company",
          content:
            "Hi John, thank you for applying to the Senior Frontend Developer position. Your experience looks impressive!",
          timestamp: "2024-01-15 10:30 AM",
          read: true,
        },
        {
          id: 2,
          sender: "candidate",
          content:
            "Thank you! I'm very excited about this opportunity and believe my skills would be a great fit for your team.",
          timestamp: "2024-01-15 11:15 AM",
          read: true,
        },
        {
          id: 3,
          sender: "company",
          content:
            "Thank you for your application. We would like to schedule an interview with you. Are you available next Tuesday at 2 PM?",
          timestamp: "2024-01-15 2:45 PM",
          read: false,
        },
      ],
    },
  ];

  const messageStats = [
    {
      label: locale === "ar" ? "إجمالي المحادثات" : "Total Conversations",
      value: "1",
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: locale === "ar" ? "رسائل غير مقروءة" : "Unread Messages",
      value: "1",
      icon: Mail,
      color: "text-orange-600",
    },
    {
      label: locale === "ar" ? "ردود معلقة" : "Pending Replies",
      value: "0",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: locale === "ar" ? "محادثات مكتملة" : "Completed",
      value: "0",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "الرسائل" : "Messages"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "تواصل مع أصحاب العمل والمسؤولين عن التوظيف"
                : "Communicate with employers and recruiters"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {messageStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {locale === "ar" ? "المحادثات" : "Conversations"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder={
                          locale === "ar"
                            ? "البحث في الرسائل..."
                            : "Search messages..."
                        }
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={conversation.avatar}
                            alt={conversation.contact}
                          />
                          <AvatarFallback>
                            {conversation.contact
                              .split(" ")
                              .map((n) => n.charAt(0))
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {conversation.company}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conversation.contact} • {conversation.position}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {conversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {locale === "ar" ? "لا توجد رسائل" : "No messages yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {locale === "ar"
                          ? "ستظهر رسائلك هنا عندما تتلقاها"
                          : "Your messages will appear here when you receive them"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {conversations.length > 0 ? (
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={conversations[0].avatar}
                          alt={conversations[0].contact}
                        />
                        <AvatarFallback>
                          {conversations[0].contact
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {conversations[0].company}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {conversations[0].contact} •{" "}
                          {conversations[0].position}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversations[0].messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "candidate"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === "candidate"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === "candidate"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={
                          locale === "ar"
                            ? "اكتب رسالتك هنا..."
                            : "Type your message here..."
                        }
                        className="min-h-[60px] resize-none"
                      />
                      <Button className="flex-shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {locale === "ar"
                        ? "اختر محادثة"
                        : "Select a conversation"}
                    </h3>
                    <p className="text-muted-foreground">
                      {locale === "ar"
                        ? "اختر محادثة من القائمة لبدء المراسلة"
                        : "Choose a conversation from the list to start messaging"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">
                  {locale === "ar" ? "طلب مكالمة" : "Request Call"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "اطلب مكالمة مع المسؤول عن التوظيف"
                    : "Request a call with the hiring manager"}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">
                  {locale === "ar" ? "جدولة مقابلة" : "Schedule Interview"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "اقترح أوقات متاحة للمقابلة"
                    : "Suggest available times for interview"}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">
                  {locale === "ar" ? "طلب معلومات إضافية" : "Request More Info"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "اطلب تفاصيل إضافية عن الوظيفة"
                    : "Ask for additional job details"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
