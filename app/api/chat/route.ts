import { NextResponse } from 'next/server'

type Message = {
    text: string
    sender: 'user' | 'bot'
}

// Knowledge base for TradeHub
const KNOWLEDGE_BASE = {
    selling: {
        keywords: ['sell', 'post', 'listing', 'list', 'upload', 'create listing', 'add item'],
        response: 'To sell an item on TradeHub:\n1. Sign in to your account\n2. Click "Post Item" button\n3. Fill in item details (title, description, price, location)\n4. Upload photos\n5. Click "Post Item" to publish\n\nIt\'s completely free!'
    },
    buying: {
        keywords: ['buy', 'purchase', 'get', 'find', 'search', 'browse'],
        response: 'To buy an item:\n1. Browse listings on the home page\n2. Use search or filter by category\n3. Click on an item to view details\n4. Contact the seller using their phone number\n5. Arrange payment and pickup directly\n\nTradeHub connects you with sellers - you handle the transaction directly!'
    },
    contact: {
        keywords: ['contact', 'reach', 'message', 'call', 'phone', 'whatsapp', 'talk to seller'],
        response: 'To contact a seller, click on any listing to view the full details. You\'ll find the seller\'s phone number there. You can call or WhatsApp them directly to arrange the purchase.'
    },
    account: {
        keywords: ['account', 'profile', 'register', 'signup', 'sign up', 'signin', 'sign in', 'login', 'log in'],
        response: 'To create an account:\n1. Click "Sign Up" in the header\n2. Enter your email and password\n3. You\'ll be signed in immediately\n\nTo sign in: Click "Sign In" and enter your credentials.\n\nTo manage your account, click "Dashboard" after signing in.'
    },
    dashboard: {
        keywords: ['dashboard', 'my listings', 'my items', 'manage', 'edit listing', 'delete listing'],
        response: 'Your dashboard shows all your listings. You can edit or delete them from there. Access it by clicking "Dashboard" in the header after signing in.'
    },
    categories: {
        keywords: ['category', 'categories', 'type', 'section', 'electronics', 'vehicles', 'real estate', 'furniture', 'fashion'],
        response: 'TradeHub has these categories:\n• Electronics (phones, laptops, gadgets)\n• Vehicles (cars, motorcycles)\n• Real Estate (houses, apartments)\n• Furniture (home & office)\n• Fashion (clothing, shoes)\n• Other (everything else)\n\nYou can filter by category on the home page.'
    },
    pricing: {
        keywords: ['price', 'cost', 'fee', 'charge', 'free', 'pay', 'money', 'commission'],
        response: 'TradeHub is completely FREE! No listing fees, no commissions, no hidden charges. Post as many items as you want at no cost.'
    },
    payment: {
        keywords: ['payment', 'paying', 'transaction', 'escrow', 'pay seller'],
        response: 'TradeHub doesn\'t handle payments. Buyers and sellers arrange payment directly. We recommend:\n• Meet in public places\n• Inspect items before paying\n• Use secure payment methods\n• Trust your instincts'
    },
    safety: {
        keywords: ['safe', 'safety', 'secure', 'scam', 'fraud', 'trust', 'meet', 'meeting'],
        response: 'Safety tips:\n• Meet in public, well-lit places\n• Bring a friend if possible\n• Inspect items thoroughly before paying\n• Trust your instincts\n• Report suspicious activity to support@tradehub.com'
    },
    photos: {
        keywords: ['photo', 'image', 'picture', 'upload photo', 'add photo'],
        response: 'When creating a listing, you can upload photos of your item. Good photos help sell faster! Make sure to:\n• Take clear, well-lit photos\n• Show the item from multiple angles\n• Include any defects or wear\n• Upload during the listing creation process'
    },
    location: {
        keywords: ['location', 'where', 'area', 'city', 'delivery', 'shipping'],
        response: 'When posting a listing, you\'ll specify your location. Buyers can see where the item is located. TradeHub is for local transactions - buyers and sellers meet in person. We don\'t offer shipping services.'
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
