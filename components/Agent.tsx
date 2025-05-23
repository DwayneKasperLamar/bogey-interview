"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils' 
import { useRouter } from 'next/navigation'
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from '@/constants'


enum  CallStatus {
    INACTIVE = 'inactive',
    ACTIVE = 'active',
    CONNECTING= 'connecting',
    FINISHED= 'finished',
}

interface SavedMessage {
    role: "user" | "assistant" | "system"
    content: string;
}




const Agent = ({userName, userId, type, interviewId, questions}: AgentProps) => {
    const router = useRouter()

    const [isSpeaking, setIsSpeaking] = useState(false)
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
    const [messages, setMessages] = useState<SavedMessage[]>([]);
   

    useEffect(() => {
        const OnCallStart = () => setCallStatus(CallStatus.ACTIVE)
        const OnCallEnd = () => setCallStatus(CallStatus.FINISHED)
         

    const onMessage = (message:Message) => {
        if(message.type === 'transcript' && message.transcriptType === "final") {
            const newMessage = {role: message.role, content: message.transcript}

            setMessages((prev) => [...prev, newMessage])
        }

    }
        const OnSpeechStart = () =>  setIsSpeaking(true)
        const OnSpeechEnd = () => setIsSpeaking(false)


        const OnError = (error: Error) => console.log('Error',error);


        vapi.on('call-start', OnCallStart);
        vapi.on('call-end', OnCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', OnSpeechStart);
        vapi.on('speech-end', OnSpeechEnd);
        vapi.on('error', OnError);


            return () => {
                vapi.off('call-start', OnCallStart);
                vapi.off('call-end', OnCallEnd);
                vapi.off('message', onMessage);
                vapi.off('speech-start', OnSpeechStart);
                vapi.off('speech-end', OnSpeechEnd);
                vapi.off('error', OnError);
            }
    }, [])
    
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log("Generate Feedback here.")

        const { success, id } ={
            success: true,
            id: 'feedback-id'
        }

        if(success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log("Error generating feedback")
            router.push('/')
        }
    }

    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) {
            if(type === 'generate') {
                router.push('/')
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, router ])

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        
        if(type === "generate") {
             await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues:{
                username:userName,
                userid: userId,
            }
        })

        } else {
            let formattedQuestions = " " ;

            if(questions)  {
                formattedQuestions = questions.map((question) => `- ${question}`)
                .join('\n')

            }
        }

        await vapi.start('interviewer',{
            variableValues:{
                questions: formattedQuestions,
            }
        } )
    }


    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED)

        vapi.stop();

    }
    

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;


  return (
    <>
        <div className='call-view'>
            <div className='card-interviewer'>
                <div className="avatar">
                    <Image src="/ai-avatar.png" 
                    alt="Vapi"
                    width={65}
                    height={54}
                    className="object-cover"/>
                    {isSpeaking && <span className='animate-speak'/>}
                </div>
                <h3>Bogey The AI Interviwer</h3>
            </div>

            <div className='card-border'>
                <div className='card-content'>
                    <Image src="/user-avatar.png"
                    alt="user avater"
                    width={540}
                    height={540}
                    className="rounded-full object-cover
                    size-[120px]"/>
                        <h3>{userName}</h3>
                </div>
            </div>
        </div>
        {messages.length > 0 && (
            <div className='transcript-border'>
                <div className='transcript'>
                    <p key={latestMessage} className={cn(
                        'transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100'
                    )}>
                        {latestMessage}
                    </p>


                </div>
            </div>
        )}



        <div className="w-full flex justify-center">
            {callStatus !== CallStatus.ACTIVE ? (
                <button className='relative btn-call' onClick={handleCall}>
                    <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== CallStatus.CONNECTING && 'hidden')}
                      />
                      <span>
                          {isCallInactiveOrFinished ? 'Call' :  '...'} 
                      </span>
                </button>
            ) : (
                <button className='btn-disconnect' onClick={handleDisconnect}>
                    End
                </button>
            )}   
        </div>
    </>
        
  )
}

export default Agent