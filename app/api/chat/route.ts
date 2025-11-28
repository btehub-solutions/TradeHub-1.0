import { NextResponse } from 'next/server'

type Message = {
    text: string
    sender: 'user' | 'bot'
}

// Knowledge base for TradeHub
const KNOWLEDGE_BASE = {
    problem_solution: {
        keywords: ['problem', 'solve', 'solution', 'why tradehub', 'what is tradehub', 'about'],
        response: 'TradeHub solves the problem of finding trustworthy local buyers and sellers. We provide a secure, transparent marketplace with verified users and no hidden fees, making it easy to declutter or find great deals in your community.'
    },
    operation_area: {
        keywords: ['operate', 'location', 'where', 'area', 'city', 'country', 'region'],
        response: 'TradeHub currently operates in Nigeria. We connect local buyers and sellers within their communities, making transactions faster and more personal.'
    },
    buying: {
        keywords: ['buy', 'purchase', 'get', 'find', 'search', 'browse', 'how to buy', 'buying work'],
        response: 'Buying on TradeHub is simple:\n1. Browse listings or search for items\n2. Click on an item to view details\n3. Contact the seller via phone or WhatsApp\n4. Meet in a safe public place to inspect and pay\n\nNo middlemen, just direct local trading!'
    },
    delivery: {
        keywords: ['delivery', 'shipping', 'ship', 'send', 'courier', 'logistics'],
        response: 'TradeHub is designed for local face-to-face transactions. We do not offer official delivery services. However, you can arrange delivery directly with the seller if you both agree on a safe method.'
    },
    selling: {
        keywords: ['sell', 'post', 'listing', 'list', 'upload', 'create listing', 'add item', 'free'],
        response: 'It is completely FREE to list items on TradeHub! Just sign in, click "Post Item", add your photos and details, and you\'re ready to sell. No listing fees and no commissions.'
    },
    contact: {
        keywords: ['contact', 'reach', 'message', 'call', 'phone', 'whatsapp', 'talk to seller', 'seller info'],
        response: 'To contact a seller, simply click on their listing to view the full details. You\'ll find the seller\'s phone number or WhatsApp contact there. You can reach out directly to ask questions or arrange a meeting.'
    },
    fees: {
        keywords: ['fee', 'charge', 'cost', 'commission', 'price', 'payment', 'paid'],
        response: 'TradeHub charges ZERO fees! \n• Free to sign up\n• Free to list items\n• No commission on sales\n\nKeep 100% of what you make.'
    },
    safety: {
        keywords: ['safe', 'safety', 'secure', 'scam', 'fraud', 'trust', 'meet', 'meeting', 'legit'],
        response: 'Yes, TradeHub is safe to use! We prioritize your safety by:\n• Verifying users\n• Encouraging public meetups\n• Providing safety tips\n\nAlways meet in public places, inspect items before paying, and never send money in advance.'
    },
    photos: {
        keywords: ['photo', 'image', 'picture', 'upload photo', 'add photo'],
        response: 'Great photos help sell faster! When posting:\n• Use good lighting\n• Show multiple angles\n• Highlight key features\n• Be honest about condition'
    }
}

// Analyze conversation context
function analyzeContext(messages: Message[]): { topics: string[], lastTopic: string | null } {
    const topics: string[] = []
    let lastTopic: string | null = null

    // Analyze all messages to understand context
    for (const msg of messages) {
        if (msg.sender === 'user') {
            const text = msg.text.toLowerCase()
            for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
                if (data.keywords.some(keyword => text.includes(keyword))) {
                    topics.push(topic)
                    lastTopic = topic
                }
            }
        }
    }

    return { topics, lastTopic }
}

// Handle follow-up questions and pronouns
function handleFollowUp(userMessage: string, context: { topics: string[], lastTopic: string | null }): string | null {
    const msg = userMessage.toLowerCase().trim()

    // Handle pronouns and references
    const followUpPatterns = [
        /^(how|what|where|when|why|can i|do i|is it|are there)/,
        /^(tell me more|more info|explain|details|elaborate)/,
        /(that|this|it|them)/,
        /^(yes|yeah|yep|ok|okay|sure)/,
        /^(no|nope|nah)/
    ]

    const isFollowUp = followUpPatterns.some(pattern => pattern.test(msg))

    if (isFollowUp && context.lastTopic) {
        // If it's a follow-up question, provide more specific info based on context
        if (msg.includes('how') || msg.includes('what') || msg.includes('more')) {
            const topic = KNOWLEDGE_BASE[context.lastTopic as keyof typeof KNOWLEDGE_BASE]
            if (topic) {
                return topic.response
            }
        }

        // Handle "yes" responses
        if (/^(yes|yeah|yep|ok|okay|sure)/.test(msg)) {
            return `Great! ${KNOWLEDGE_BASE[context.lastTopic as keyof typeof KNOWLEDGE_BASE]?.response || 'Let me know if you need anything else!'}`
        }
    }

    return null
}

// Get intelligent response based on full conversation context
function getContextualResponse(userMessage: string, messages: Message[]): string {
    const msg = userMessage.toLowerCase().trim()

    // Greetings
    if (/^(hi|hello|hey|greetings)/.test(msg)) {
        return 'Hello! Welcome to TradeHub. I\'m here to help you buy and sell items in your local community. What would you like to know?'
    }

    // Thanks
    if (/^(thanks|thank you|thx|ty)/.test(msg)) {
        return 'You\'re welcome! Feel free to ask if you have any other questions about TradeHub. 😊'
    }

    // Analyze conversation context
    const context = analyzeContext(messages)

    // Check for follow-up questions
    const followUpResponse = handleFollowUp(userMessage, context)
    if (followUpResponse) {
        return followUpResponse
    }

    // Match against knowledge base with context awareness
    let bestMatch: { topic: string, score: number } | null = null

    for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
        let score = 0

        // Check keyword matches
        for (const keyword of data.keywords) {
            if (msg.includes(keyword)) {
                score += 2
            }
        }

        // Boost score if topic was mentioned in recent conversation
        if (context.topics.includes(topic)) {
            score += 1
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { topic, score }
        }
    }

    if (bestMatch) {
        return KNOWLEDGE_BASE[bestMatch.topic as keyof typeof KNOWLEDGE_BASE].response
    }

    // Handle questions about specific features
    if (msg.includes('how do') || msg.includes('how can') || msg.includes('how to')) {
        if (context.lastTopic) {
            return KNOWLEDGE_BASE[context.lastTopic as keyof typeof KNOWLEDGE_BASE]?.response || getDefaultResponse()
        }
    }

    // Default response with context
    return getDefaultResponse(context.topics)
}

function getDefaultResponse(recentTopics: string[] = []): string {
    if (recentTopics.length > 0) {
        return 'I\'m not sure I understood that. Could you rephrase your question? I can help you with:\n• Posting/selling items\n• Buying items\n• Account setup\n• Categories\n• Safety tips\n• Pricing'
    }

    return 'I\'m here to help! You can ask me about:\n• Posting/selling items\n• Buying items\n• Account setup\n• Categories\n• Safety tips\n• Pricing\n\nWhat would you like to know?'
}

export async function POST(request: Request) {
    try {
        const { messages } = await request.json()

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            )
        }

        const lastMessage = messages[messages.length - 1]
        const userText = lastMessage.text

        // Get contextual response based on full conversation history
        const botResponse = getContextualResponse(userText, messages)

        return NextResponse.json({ message: botResponse })
    } catch (error: any) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        )
    }
}
