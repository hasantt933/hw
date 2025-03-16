"use client"
import React, { useContext, useState, useEffect, useRef } from 'react';
import { TEMPLATE } from '../../_components/TemplateListSection';
import Templates from '@/app/(data)/Templates';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { chatSession } from '@/utils/AiModal';
import { useRouter, useParams } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { format } from 'date-fns';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext';
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function CreateNewContent() {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const selectedTemplate: TEMPLATE | undefined = Templates?.find(
    (item) => item.slug === params["template-slug"]
  );

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [processingResponse, setProcessingResponse] = useState(false);
  
  const { user } = useUser();
  const router = useRouter();
  const { totalUsage } = useContext(TotalUsageContext);
  const { setUpdateCreditUsage } = useContext(UpdateCreditUsageContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChatInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
  };

  const GenerateAIContent = async (inputFormData: any = null) => {
    if (totalUsage >= 10000) {
      console.log("Please Upgrade");
      router.push('dashboard/billing');
      return;
    }

    const dataToSend = inputFormData || 
      (hasStartedChat ? { question: newMessage } : formData);
    
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    const userMessage = { role: "user", content: typeof dataToSend === 'string' ? dataToSend : JSON.stringify(dataToSend) };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setNewMessage('');

    try {
      const SelectedPrompt = selectedTemplate?.aiPrompt;
      const FinalAIPrompt = JSON.stringify(dataToSend) + ", " + SelectedPrompt;
      const result = await chatSession.sendMessage(FinalAIPrompt);
      const aiResponse = await result.response.text();
      
      // Add slight delay before updating messages to avoid flickering
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
        setLoading(false);
        SaveInDb(dataToSend, selectedTemplate?.slug, aiResponse);
        setUpdateCreditUsage(Date.now());
      }, 100);
    } catch (error) {
      console.error("Error generating AI content:", error);
      setLoading(false);
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error processing your request. Please try again." }]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    GenerateAIContent();
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || loading) return;
    GenerateAIContent({ question: newMessage });
  };

  const SaveInDb = async (formData: any, slug: any, aiResp: string) => {
    try {
      await db.insert(AIOutput).values({
        formData: formData,
        templateSlug: slug,
        aiResponse: aiResp,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? "",
        createdAt: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  };

  // Function to format user message for display
  const formatUserMessage = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.question || Object.values(parsed).join(", ");
    } catch (e) {
      return content;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-5 border-b flex-shrink-0">
        <Link href={"/dashboard"}>
          <Button><ArrowLeft className="mr-2" />Back</Button>
        </Link>
      </div>

      {!hasStartedChat ? (
        // Intro view with bot details and first question form
        <div className="flex-1 flex flex-col items-center justify-center p-5 overflow-auto">
          <div className="max-w-2xl w-full p-8 shadow-md border rounded-lg bg-white">
            {selectedTemplate?.icon && (
              <div className="flex justify-center mb-6">
                {/* @ts-ignore */}
                <Image src={selectedTemplate.icon} alt='icon' width={100} height={100} />
              </div>
            )}
            <h2 className='font-bold text-3xl mb-4 text-primary text-center'>{selectedTemplate?.name}</h2>
            <p className='text-gray-500 text-center mb-8'>{selectedTemplate?.desc}</p>

            <form className='mt-6' onSubmit={handleFormSubmit}>
              {selectedTemplate?.form?.map((item, index) => (
                <div key={item.id || index} className='my-2 flex flex-col gap-2 mb-7'>
                  <label className='font-bold'>{item.label}</label>
                  {item.field == 'input' ?
                    <Textarea 
                      name={item.name} 
                      required={item?.required} 
                      onChange={handleInputChange}
                      placeholder="Enter your homework question here..."
                      className="min-h-[120px] resize-none"
                    />
                    : item.field == 'textarea' ?
                    <Textarea 
                      name={item.name} 
                      required={item?.required} 
                      onChange={handleInputChange}
                      className="min-h-[120px]"
                    /> : null
                  }
                </div>
              ))}

              <Button type='submit' className='w-full py-6' disabled={loading}>
                {loading && <Loader2Icon className='animate-spin mr-2' />}
                Get Answer
              </Button>
            </form>
          </div>
        </div>
      ) : (
        // Chat view after conversation has started - Using a single scroll container
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main chat area with single scroll container */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 pb-20">
              <div className="max-w-4xl mx-auto">
                {messages.map((msg, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex items-start gap-4">
                      {msg.role === "user" ? (
                        <>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            U
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium mb-1">You</div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              {formatUserMessage(msg.content)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                            {/* @ts-ignore */}
                            {selectedTemplate?.icon ? (
                              <Image 
                                // @ts-ignore
                                src={selectedTemplate.icon} 
                                alt="AI" 
                                width={32} 
                                height={32} 
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold">AI</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium mb-1">{selectedTemplate?.name || "AI Assistant"}</div>
                            <div className="p-4 bg-white rounded-lg shadow-sm prose max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="mb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        {/* @ts-ignore */}
                        {selectedTemplate?.icon ? (
                          <Image 
                            // @ts-ignore
                            src={selectedTemplate.icon} 
                            alt="AI" 
                            width={32} 
                            height={32} 
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-white font-bold">AI</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium mb-1">{selectedTemplate?.name || "AI Assistant"}</div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2Icon className="w-4 h-4 animate-spin text-gray-500" />
                            <span className="text-gray-500">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Fixed position input at bottom */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Textarea
                    value={newMessage}
                    onChange={handleChatInputChange}
                    placeholder="Ask another question..."
                    className="min-h-[60px] resize-none"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (newMessage.trim() && !loading) {
                          handleChatSubmit(e);
                        }
                      }
                    }}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || loading}
                  className="h-10 px-4"
                >
                  {loading ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateNewContent;