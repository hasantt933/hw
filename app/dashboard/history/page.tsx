import Templates from '@/app/(data)/Templates';
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { currentUser } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import React from 'react';

export interface HISTORY {
  id: number;
  formData: string;
  aiResponse: string | null;  // Accepts null
  templateSlug: string;
  createdBy: string;
  createdAt: string | null;  // Accepts null
}

async function History() {
    const user = await currentUser();

    if (!user || !user.primaryEmailAddress?.emailAddress) {
        return <div>Please log in to view your history.</div>;
    }

    const history: HISTORY[] = await db
        .select()
        .from(AIOutput)
        .where(eq(AIOutput.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(AIOutput.createdAt));

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold">History</h2>
            <p className="text-gray-600 mb-4">Search your previously generated AI content</p>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Template</th>
                        <th className="border p-2">AI Response</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Words</th>
                        <th className="border p-2">Edit</th>
                    </tr>
                </thead>
                <tbody>
    {history.map((entry: HISTORY) => {
        const template = Templates.find((t) => t.slug === entry.templateSlug);
        const templateName = template ? template.name : 'Unknown Template';
        const aiResponse = entry.aiResponse ?? ''; // Ensure it's never null
        const createdAt = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'; // Handle null date

        return (
            <tr key={entry.id} className="border">
                <td className="border p-2">{templateName}</td>
                <td className="border p-2">{aiResponse.slice(0, 50)}...</td>
                <td className="border p-2">{createdAt}</td>
                <td className="border p-2">{aiResponse ? aiResponse.split(' ').length : 0}</td>
                <td className="border p-2">
                    <Link href={`/dashboard/history/edit/${entry.id}`} className="text-blue-500 hover:underline">
                        Edit
                    </Link>
                </td>
            </tr>
        );
    })}
</tbody>

            </table>
        </div>
    );
}

export default History;
