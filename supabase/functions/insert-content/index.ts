import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { type, content, model = 'sonar', instructions, title } = await req.json()

    if (!type || !content) {
      throw new Error('Missing required fields: type and content are required')
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a content generation assistant specializing in creating high-quality, structured content.
                     You MUST follow the provided HTML structure EXACTLY as shown in the instructions.
                     Do not add any classes, styles, or additional HTML elements not specified.
                     Do not include any CSS or styling.
                     Do not include any line breaks, <br> tags, or whitespace at the end of the content.
                     Return only the requested HTML structure.
                     Do not include any "Buy" links or product recommendations.
                     Focus on providing valuable, informative content.
                     
                     CRITICAL REQUIREMENTS FOR ALL CONTENT TYPES:
                     - NEVER include citation footnotes like [1], [2], etc.
                     - NEVER add references or bibliography sections
                     - ALL URLs must be complete and readable (e.g., "https://example.com/page" NOT just "example.com")
                     - URLs must be real, accessible, and relevant
                     - Do not use placeholder URLs like "example.com" or "[URL]"
                     - Do not add any markdown formatting
                     - Do not add any additional HTML elements not specified in the instructions
                     
                     For tables:
                     - Use div with class="table-container"
                     - Use h3 tag for the table title
                     - Use proper table structure with thead and tbody
                     - Include appropriate column headers in th tags
                     - IMPORTANT: Include ALL relevant data from the content - do not limit the number of rows
                     - If the content contains a list of items, each item should be a row in the table
                     - If the content contains multiple sections, create appropriate columns to organize the data
                     - Table content must directly relate to the content
                     - Keep cell content concise and informative
                     - No additional styling or classes
                     
                     For statistics:
                     - Always include the topic in the h2 title
                     - Format h3 headings as "[Number][Unit] [Context]" (e.g., "75% Energy Savings with LED Bulbs")
                     - Keep descriptions concise and focused on impact
                     - Use real statistics with proper attribution
                     - Do not make up statistics
                     
                     For FAQs:
                     - Use h2 for section title
                     - Use h3 for questions
                     - Use p for answers
                     - Questions should be clear and directly related to the content
                     - Answers should be informative and concise
                     - No additional styling or classes

                     For related links:
                     - Use h2 for section title including the topic/context
                     - Each link must have three parts:
                       1. A p tag with relevant text being referenced
                       2. A p tag with the source name
                       3. An a tag with href and nested p for the FULL URL (e.g., "https://example.com/page")
                     - Links must be real, accessible URLs with complete http:// or https:// prefix
                     - Links must directly relate to the content or selected text
                     - The URL text inside the <p> tag must be the complete URL, not just the domain
                     - No additional styling or classes

                     For quotes:
                     - Use <blockquote> tag to wrap the entire quote
                     - Quote text must be in quotation marks
                     - Use <cite> tag with nested <a> tag for attribution
                     - Include source name and year
                     - Use real, accessible URLs with complete http:// or https:// prefix
                     - The URL in the href attribute must be complete (e.g., "https://example.com/page")
                     - No additional styling or markdown formatting

                     For CTAs:
                     - Use h3 for action-oriented heading (4-8 words)
                     - Use p for concise description (1-2 sentences)
                     - Use button tag for clear call-to-action text (2-5 words)
                     - Content must directly relate to selected text or overall context
                     - No additional styling or classes
                     - No markdown formatting

                     For Pro Tips:
                     - Generate EXACTLY ONE pro tip only
                     - Use div with class="pro-tip"
                     - Use h3 tag with text "Pro Tip"
                     - Use p tag for the tip content
                     - Reference the selected text or content section
                     - Keep tips concise (2-3 sentences)
                     - Make tips specific and actionable
                     - No additional styling or classes
                     - No markdown formatting
                     - DO NOT generate multiple pro tips - only one is needed

                     For Description Boxes:
                     - Use div with class="description-box"
                     - Use h3 tag with text "Overview of [Topic/Subject]" (replace with actual topic)
                     - Use p tag with id="summary" for the content
                     - Keep summary concise (2-3 sentences)
                     - Make summary clear and easy to understand
                     - Reference selected text or overall content
                     - No additional styling or classes
                     - No markdown formatting

                     For Warning Sections:
                     - Use div with class="content-warnings"
                     - Use h3 tag with text "Important Considerations Related to [Topic]"
                     - Use ul tag for the list of warnings
                     - Include 2-4 concise li items with clear warnings
                     - Each warning should be one sentence and actionable
                     - Reference selected text or overall content
                     - No additional styling or classes
                     - No markdown formatting

                     For Key Takeaways:
                     - Use div with class="key-takeaways"
                     - Use h3 tag with text "Key Takeaways"
                     - Use ol tag for ordered list of takeaways
                     - Include 3-5 concise li items
                     - Each takeaway should be one clear sentence
                     - List points in order of significance
                     - Reference selected text or overall content
                     - No additional styling or classes
                     - No markdown formatting`
          },
          {
            role: 'user',
            content: `Context: ${content}
                     Title: ${title}
                     Type: ${type}
                     
                     Instructions:
                     ${instructions}
                     
                     Generate the content following these instructions exactly.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedContent = data.choices[0].message.content

    // Clean up the response to ensure it's valid HTML
    const cleanContent = generatedContent
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .replace(/\[\d+\]/g, '') // Remove citation footnotes like [1], [2], etc.
      .replace(/<br\s*\/?>\s*$/g, '') // Remove trailing <br> tags
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .replace(/\n+/g, '\n') // Normalize line breaks
      .trim()

    // Return the response with CORS headers
    return new Response(
      JSON.stringify({ content: cleanContent }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}) 