import Templates from '@/app/(data)/Templates'
import React from 'react'
import TemplateCard from './TemplateCard'

export interface TEMPLATE{
   id?: string; // Marking `id` as optional since it's missing in some cases
    name:string,
    desc:string,
    icon:string,
    category:string,
    slug:string,
    aiPrompt:string,
    form?:FORM[]
}


export interface FORM{
  id?: string;  // Add this line
    label:string,
    field:string,
    name:string,
    required?:boolean
}

function TemplateListSection() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-10'>
         {Templates.map((item:TEMPLATE, index:number)=>(
            <TemplateCard key={item.id || index} {...item} />
         ))
         }
    </div>
  )
}

export default TemplateListSection