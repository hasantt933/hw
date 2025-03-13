"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { AIOutput, subscriptions } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import React, { useContext, useEffect, useState } from 'react'
import { HISTORY } from '../history/page';
import { desc, eq } from 'drizzle-orm';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext';
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext';
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext';

function UsageTrack() {
    const {user} = useUser();
    const {totalUsage, setTotalUsage} = useContext(TotalUsageContext);
    const {userSubscription, setUserSubscription} = useContext(UserSubscriptionContext);
    const {updateCreditUsage, setUpdateCreditUsage} = useContext(UpdateCreditUsageContext);
    
    // Default to free tier token limit
    const [maxTokens, setMaxTokens] = useState(10);

    useEffect(() => {
        if (user) {
            GetData();
            IsUserSubscribed();
        }
    }, [user]);

    useEffect(() => {
        if (user && updateCreditUsage) {
            GetData();
            IsUserSubscribed();
        }
    }, [updateCreditUsage, user]);
    
    const GetData = async() => {
        const result:HISTORY[] = await db.select().from(AIOutput)
            .where(eq(AIOutput.createdBy, user?.primaryEmailAddress?.emailAddress ?? ""));

        GetTotalUsage(result);
    }

    const IsUserSubscribed = async() => {
        try {
            const result = await db.select().from(subscriptions)
                .where(eq(subscriptions.email, user?.primaryEmailAddress?.emailAddress ?? ""));

            // Check if the array has any items (subscription exists)
            if (result && result.length > 0) {
                console.log("User is subscribed:", result);
                setUserSubscription(true);
                setMaxTokens(555);
            } else {
                console.log("User is not subscribed");
                setUserSubscription(false);
                setMaxTokens(10); // Reset to free tier
            }
        } catch (error) {
            console.error("Error checking subscription:", error);
            // Default to free tier on error
            setUserSubscription(false);
            setMaxTokens(10);
        }
    }

    const GetTotalUsage = (result:HISTORY[]) => {
        let total = result.length; // Each successful response counts as 1 token
        setTotalUsage(total);
        console.log("Total usage:", total);
    };

    return (
        <div className='p-5'>
            <div className='bg-purple-600 text-white p-3 rounded-lg'>
                <h2 className='font-medium'>Credits</h2>
                <div className='h-2 bg-[#9981f9] w-full rounded-full mt-3'>
                    <div className='h-2 bg-white rounded-full'
                    style={{
                        width: `${Math.min((totalUsage/maxTokens)*100, 100)}%`
                    }}>
                    </div>
                </div>
                <h2 className='text-sm my-2'>{totalUsage}/{maxTokens} Credits Used</h2>
            </div>
            <Button variant={'secondary'} className='w-full my-3 text-purple-600'>
                {userSubscription ? 'Manage Subscription' : 'Upgrade'}
            </Button>
        </div>
    )
}

export default UsageTrack