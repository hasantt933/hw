"use client"
import React, { useContext } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from "next/link";
import { chatSession } from '@/utils/AiModal'
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'
import { format } from 'date-fns';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext'



interface PROPS{
    params:{
        'template-slug':string
    }
}

function CreateNewContent(props:PROPS) {

  const params = useParams() as { 'template-slug'?: string };
  /*const params = useParams(); */ // Correct way to get params in a Client Component
  const [loading, setLoading] = useState(false);

  const selectedTemplate: TEMPLATE | undefined = Templates?.find(
    (item) => item.slug === params["template-slug"]
  );

  const [aiOutput, setAiOutput] = useState<string>('');
  const {user}=useUser();
  const router = useRouter();
/*const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug']);

const [loading, setLoading]= useState(false);*/
const {totalUsage, setTotalUsage} = useContext(TotalUsageContext)
const {updateCreditUsage, setUpdateCreditUsage} = useContext(UpdateCreditUsageContext)

const GenerateAIContent=async(formData:any)=>{

            if(totalUsage>=10000){
              console.log("Please Upgrade");
              router.push('dashboard/billing');
              return;
            }

          setLoading(true);
          const SelectedPrompt= selectedTemplate?.aiPrompt;

          const FinalAIPrompt= JSON.stringify(formData)+", "+SelectedPrompt;

          const result= await chatSession.sendMessage(FinalAIPrompt);

          console.log(result.response.text());

          setAiOutput(result?.response.text());
          await SaveInDb(formData, selectedTemplate?.slug, result?.response.text()) 
          setLoading(false);

          setUpdateCreditUsage(Date.now())
}

const SaveInDb= async(formData:any, slug:any, aiResp:string)=>{
  const result = await db.insert(AIOutput).values({
    formData: formData,
    templateSlug: slug,
    aiResponse: aiResp,
    createdBy: user?.primaryEmailAddress?.emailAddress ?? "", 
    createdAt:format(new Date(), 'yyyy-MM-dd')
  });

  console.log(result);
}

  return (

    <div className='p-5'>
      <Link href={"/dashboard"}>
      <Button><ArrowLeft/>Back</Button>
      </Link>

    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 py-5'>
        {/* FormSection */}
        <FormSection selectedTemplate={selectedTemplate}
        userFormInput={(v:any)=>GenerateAIContent(v)} loading= {loading} 
        />

        {/*Output Section */}
        <div className='col-span-2'>
            <OutputSection aiOutput={aiOutput}/>
        </div>
    </div>
    </div>
  )
}

export default CreateNewContent
