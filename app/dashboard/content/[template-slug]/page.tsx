"use client"
import React from 'react'
import { aiOutput } from '@/utils/schema'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from "next/link";
import { chatSession } from '@/utils/AiModal'
import { useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import { format } from 'date-fns';



interface PROPS{
    params:{
        'template-slug':string
    }
}

function CreateNewContent(props:PROPS) {

  const params = useParams(); // Correct way to get params in a Client Component
  const [loading, setLoading] = useState(false);

  const selectedTemplate: TEMPLATE | undefined = Templates?.find(
    (item) => item.slug === params["template-slug"]
  );

  const [aiOutput, setAiOutput] = useState<string>('');
  const {user}=useUser();
/*const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug']);

const [loading, setLoading]= useState(false);*/

const GenerateAIContent=async(formData:any)=>{

          setLoading(true);
          const SelectedPrompt= selectedTemplate?.aiPrompt;

          const FinalAIPrompt= JSON.stringify(formData)+", "+SelectedPrompt;

          const result= await chatSession.sendMessage(FinalAIPrompt);

          console.log(result.response.text());

          setAiOutput(result?.response.text());
          await SaveInDb(formData, selectedTemplate?.slug, result?.response.text())
          setLoading(false);
}

const SaveInDb= async(formData:any, slug:any, aiResp:string)=>{
  const result = await db.insert(aiOutput).values({
    formData: formData,
    templateSlug: slug,
    aiResponse: AuthenticatorResponse,
    CreatedBy:user?.primaryEmailAddress?.emailAddress, 
    createdAt:format(new Date(), 'dd/MM/yyyy')
  })
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
