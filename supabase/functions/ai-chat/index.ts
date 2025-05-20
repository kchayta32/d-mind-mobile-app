
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestData {
  message: string;
  chatHistory?: Message[];
  systemPrompt?: string;
  searchQuery?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('SUPABASE credentials are not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    const requestData: RequestData = await req.json();
    const { message, chatHistory = [], systemPrompt = "คุณคือผู้ช่วยในแอพเตือนภัยฉุกเฉิน คุณให้คำแนะนำเกี่ยวกับความปลอดภัยและการรับมือกับภัยพิบัติต่างๆ", searchQuery } = requestData;

    // Generate search query from user message if not provided
    const queryToSearch = searchQuery || message;

    // ค้นหาข้อมูลที่เกี่ยวข้องจากตาราง documents
    let contextFromDocuments = "";
    try {
      // แบ่งคำค้นหาเป็นคำย่อยเพื่อป้องกันข้อผิดพลาด syntax error in tsquery
      const searchTerms = queryToSearch.split(/\s+/).filter(term => {
        // กรองคำที่มีแนวโน้มสร้างปัญหากับ tsquery
        const invalidChars = /['"\\:&|!()[\]{}<>=@\-\+\*\?]/g;
        return term.length > 1 && !invalidChars.test(term);
      });
      
      // หากมีคำค้นหาที่ใช้ได้
      if (searchTerms.length > 0) {
        // สร้าง simple query แบบปลอดภัย
        const safeQuery = searchTerms.join(' | '); // ใช้ OR operator ระหว่างคำ
        
        console.log(`Searching with terms: ${safeQuery}`);
        
        const { data: documents, error } = await supabase
          .from('documents')
          .select('content, metadata')
          .textSearch('content', safeQuery, {
            config: 'simple'
          })
          .limit(3);

        if (error) {
          console.error('Error fetching documents:', error);
        } else if (documents && documents.length > 0) {
          contextFromDocuments = "ข้อมูลเพิ่มเติมที่เกี่ยวข้อง:\n\n" + 
            documents.map(doc => doc.content).join("\n\n");
          console.log(`Found ${documents.length} relevant documents`);
        } else {
          console.log('No relevant documents found');
        }
      } else {
        console.log('No valid search terms found in query');
      }
    } catch (searchError) {
      console.error('Search error:', searchError);
      // ถ้าเกิดข้อผิดพลาดในการค้นหา ให้ดำเนินการต่อโดยไม่มีข้อมูลเพิ่มเติม
    }

    // สร้างประวัติการแชทและเพิ่มข้อความผู้ใช้ปัจจุบัน
    const enhancedSystemPrompt = systemPrompt + (contextFromDocuments ? 
      `\n\nนี่คือข้อมูลที่เกี่ยวข้องที่คุณสามารถใช้ในการตอบคำถาม (ใช้เฉพาะเมื่อข้อมูลมีความเกี่ยวข้องกับคำถาม):\n${contextFromDocuments}` : 
      "");

    const messages: Message[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    // เรียกใช้ OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    // สร้างการตอบกลับพร้อม CORS headers
    return new Response(
      JSON.stringify({
        response: aiResponse,
        messages: [...messages, { role: 'assistant', content: aiResponse }]
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
