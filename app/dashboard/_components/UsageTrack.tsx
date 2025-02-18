"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import React, { useContext, useEffect, useState } from 'react'
import { HISTORY } from '../history/page';
import { desc, eq } from 'drizzle-orm';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext';
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext';

function UsageTrack() {

    const {user}=useUser();
    const {totalUsage, setTotalUsage}= useContext(TotalUsageContext);

    const {updateCreditUsage, setUpdateCreditUsage} = useContext(UpdateCreditUsageContext);

    useEffect(()=>{
        user&&GetData();
    },[user])

    useEffect(()=>{
        user&&GetData();
    }, [updateCreditUsage&&user])
    
    const GetData=async()=>{
        const result:HISTORY[]= await db.select().from(AIOutput).where(eq(AIOutput.createdBy, 
            user?.primaryEmailAddress?.emailAddress));
            GetTotalUsage(result)
    }

    const GetTotalUsage=(result:HISTORY[])=>{
        let total:number=0;
        /*result.forEach(element=>{
            //total=total+Number(element.aiResponse?.length)
            total += element.aiResponse.trim().split(/\s+/).length;
        });*/
        result.forEach(element => {
            if (element.aiResponse && typeof element.aiResponse === "string") {
                total += element.aiResponse.trim().split(/\s+/).length; // Count words correctly
            }
        });
        setTotalUsage(total)
        console.log(total);
    }

  return (
    <div className='p-5'>
        <div className='bg-purple-600 text-white p-3 rounded-lg'>
            <h2 className='font-medium'>Credits</h2>
            <div className='h-2 bg-[#9981f9] w-full rounded-full mt-3'>
                <div className='h-2 bg-white rounded-full'
                style={{
                    width: (totalUsage/10000)*100+"%"
                }}>
                </div>
            </div>
            <h2 className='text-sm my-2'>{totalUsage}/10,000 Credit Used</h2>
        </div>
        <Button variant={'secondary'} className='w-full my-3 text-purple-600'>
                Upgrade
            </Button>
    </div>
  )
}

export default UsageTrack