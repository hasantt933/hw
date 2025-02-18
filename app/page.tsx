/*import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      AI HOMEWORK WEB APP 
    
    </div>
  );
}
*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Book, FlaskConical, Calculator, Atom, ChevronRight } from "lucide-react";



export default function LandingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 px-5 bg-blue-600 text-white">
        <h1 className="text-4xl font-bold">AI Homework Helper</h1>
        <p className="mt-4 text-lg">Get instant solutions for Physics, Math, Chemistry, and Biology.</p>
        <Link href="/dashboard">
          <Button className="mt-6 bg-white text-blue-600 hover:bg-gray-100">Start Solving</Button>
        </Link>
      </section>

      {/* Subjects Section */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-center">Subjects We Cover</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {subjects.map((subject) => (
            <div key={subject.name} className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
              <subject.icon className="w-12 h-12 text-blue-600" />
              <h3 className="mt-3 text-lg font-medium">{subject.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-5">
        <h2 className="text-3xl font-semibold text-center">Why Choose Our AI?</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 bg-gray-100 rounded-lg shadow-sm">
              <feature.icon className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-blue-600 text-white">
        <h2 className="text-3xl font-bold">Solve Your Homework Instantly</h2>
        <p className="mt-4 text-lg">Start using AI-powered solutions for your studies today.</p>
        <Link href="/dashboard">
          <Button className="mt-6 bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
        </Link>
      </section>
    </div>
  );
}

const subjects = [
  { name: "Physics", icon: Atom },
  { name: "Math", icon: Calculator },
  { name: "Chemistry", icon: FlaskConical },
  { name: "Biology", icon: Brain },
];

const features = [
  { title: "AI-Powered Solutions", description: "Get accurate answers instantly.", icon: Brain },
  { title: "Step-by-Step Explanations", description: "Understand every step of the solution.", icon: Book },
  { title: "Scan & Solve", description: "Upload an image and get instant solutions.", icon: ChevronRight },
];
