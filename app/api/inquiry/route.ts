import { NextRequest, NextResponse } from "next/server";
export async function POST(req:NextRequest){
  try{const data=await req.json();const webhook=process.env.SLACK_WEBHOOK_URL;
    if(webhook){await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:`New RAR Inquiry\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nTier: ${data.tier}\nAddOns: ${data.addOns?.join(", ")||"None"}\nNotes: ${data.notes}`})});}
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false,error:String(e)},{status:500});}
}