import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const TRADEHUB_CONTEXT = `You are a helpful assistant for TradeHub, a local marketplace platform in Nigeria where people can buy and sell pre-loved items.

Key Information about TradeHub:

PLATFORM OVERVIEW:
- TradeHub is a free marketplace connecting buyers and sellers in Nigeria
- Users can post unlimited listings at no cost
- No commission or hidden fees

CATEGORIES:
1. Electronics (phones, laptops, gadgets)
2. Vehicles (cars, motorcycles)
3. Real Estate (houses, apartments, land)
4. Furniture (home and office furniture)
5. Fashion (clothing, shoes, accessories)
6. Other (everything else)

SELLING PROCESS:
1. Sign in to your account
2. Go to Dashboard
3. Click "Add New Listing"
4. Fill in details (title, description, price, location, category)
5. Upload photos
6. Click "Post Listing"

BUYING PROCESS:
1. Browse listings on home page
2. Use search bar to find items
3. Filter by category
4. Click item to view details
5. Contact seller using provided phone number

ACCOUNT MANAGEMENT:
- Sign up: Click "Sign In" → "Sign Up" → Enter email/password
- Sign in: Click "Sign In" → Enter credentials
- Dashboard: Access after signing in to manage listings
- Edit listings: Dashboard → Find listing → Click "Edit"
- Delete listings: Dashboard → Find listing → Click "Delete"

PAYMENTS & SAFETY:
- TradeHub doesn't handle payments - arranged directly between buyer/seller
- Safety tips: Meet in public places, inspect items before paying, trust your instincts
- Report suspicious activity to support@tradehub.com

FEATURES:
- Search functionality
- Category filtering
- Photo uploads for listings
- Location-based listings
- Mobile responsive design

CONTACT:
- Email: support@tradehub.com
- Phone: +234-XXX-XXXX-XXX

Always be helpful, friendly, and provide accurate information about TradeHub. If users ask about features not mentioned here, politely let them know and suggest contacting support.`

export async function POST(request: Request) {
    try {
        const { messages } = await request.json()

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        // Format conversation history for Gemini
        const chatHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))

        const lastMessage = messages[messages.length - 1].text

        // Start chat with context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'You are a TradeHub support assistant. Here is the context about TradeHub:\n\n' + TRADEHUB_CONTEXT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m now ready to help users with TradeHub questions. I\'ll provide accurate, helpful information based on the context you\'ve provided.' }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        })

        const result = await chat.sendMessage(lastMessage)
        const response = result.response
        const text = response.text()

        return NextResponse.json({ message: text })
    } catch (error: any) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get response' },
            { status: 500 }
        )
    }
}
