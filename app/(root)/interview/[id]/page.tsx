import { redirect } from 'next/navigation'
import { getInterviewById } from '@/lib/actions/general.action'
import React from 'react'
import { getRandomInterviewCover } from '@/lib/utils'
import Image from 'next/image'
import DisplayTechIcons from '@/components/DisplayTechIcons'
import { getCurrentUser } from '@/lib/actions/auth.action'
import Agent from '@/components/Agent'




const page = async ({ params }: RouteParams) => {
  const { id } = await  params
  const user = await getCurrentUser()
  const interview = await getInterviewById(id)

  if(!interview) redirect('/')

  return (
    <>
     <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className='flex flex-row gap-4 items-center'>
            <Image src={getRandomInterviewCover()}
            alt='cover-image'
            width={40}
            height={40}
            className="rounded-full object-cover size-[40px]"
           />
            <h3 className='capitalize'>
              {interview?.role} interview
            </h3>
          </div>
          <DisplayTechIcons techStack={interview?.techstack} />
        </div>
        <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>{interview.type}</p>
     </div>

     <Agent
        userName={user?.name}
          type={user?.type}
          interviewId={id}
          type="interview"
          questions={interview.questions}
        />
    </>
   
  )
}

export default page