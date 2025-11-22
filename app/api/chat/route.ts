import { NextResponse } from 'next/server'

// Simple rule-based chatbot responses
const RESPONSES: Record<string, string> = {
    // Greetings
    'hello': 'Hello! Welcome to TradeHub. How can I help you today?',
    'hi': 'Hi there! I\'m here to help you with TradeHub. What would you like to know?',
    'hey': 'Hey! How can I assist you with TradeHub today?',

    // Selling
    'sell': 'To sell an item on TradeHub:\n1. Sign in to your account\n2. Click "Post Item" button\n3. Fill in item details (title, description, price, location)\n4. Upload photos\n5. Click "Post Item" to publish\n\nIt\'s completely free!',
    'post': 'To post a listing:\n1. Sign in to your account\n2. Click the "Post Item" button in the header\n3. Fill in all required fields\n4. Add photos of your item\n5. Submit your listing\n\nYour listing will appear immediately!',
    'listing': 'You can create a listing by clicking the "Post Item" button after signing in. Fill in the details about your item, add photos, and publish. It\'s free and takes just a few minutes!',

    // Buying
    'buy': 'To buy an item:\n1. Browse listings on the home page\n2. Use search or filter by category\n3. Click on an item to view details\n4. Contact the seller using their phone number\n5. Arrange payment and pickup directly\n\nTradeHub connects you with sellers - you handle the transaction directly!',
    'contact': 'To contact a seller, click on any listing to view the full details. You\'ll find the seller\'s phone number there. You can call or WhatsApp them directly to arrange the purchase.',

    // Account
    'account': 'To create an account:\n1. Click "Sign Up" in the header\n2. Enter your email and password\n3. You\'ll be signed in immediately\n\nTo manage your account, click "Dashboard" after signing in.',
    'signup': 'Click the "Sign Up" button in the top right corner, enter your email and password, and you\'re all set! No email confirmation needed.',
    'signin': 'Click "Sign In" in the header and enter your email and password. If you don\'t have an account yet, click "Sign Up" instead.',
    'dashboard': 'Your dashboard shows all your listings. You can edit or delete them from there. Access it by clicking "Dashboard" in the header after signing in.',

    // Categories
    'category': 'TradeHub has these categories:\n• Electronics (phones, laptops, gadgets)\n• Vehicles (cars, motorcycles)\n• Real Estate (houses, apartments)\n• Furniture (home & office)\n• Fashion (clothing, shoes)\n• Other (everything else)',
    'categories': 'We have 6 main categories: Electronics, Vehicles, Real Estate, Furniture, Fashion, and Other. You can filter by category on the home page.',

    // Pricing
    'price': 'TradeHub is completely FREE! No listing fees, no commissions, no hidden charges. Post as many items as you want at no cost.',
    'free': 'Yes! TradeHub is 100% free to use. You can post unlimited listings without any fees or commissions.',
    'cost': 'There are no costs to use TradeHub. It\'s completely free for both buyers and sellers.',

    // Payment
    'payment': 'TradeHub doesn\'t handle payments. Buyers and sellers arrange payment directly. We recommend:\n• Meet in public places\n• Inspect items before paying\n• Use secure payment methods\n• Trust your instincts',
    'pay': 'Payments are arranged directly between buyer and seller. TradeHub is just the platform to connect you. Always meet safely and inspect items before paying!',

    // Safety
    'safe': 'Safety tips:\n• Meet in public, well-lit places\n• Bring a friend if possible\n• Inspect items thoroughly before paying\n• Trust your instincts\n• Report suspicious activity to support@tradehub.com',
    'safety': 'For safe transactions:\n1. Meet in public places\n2. Inspect items before paying\n3. Use secure payment methods\n4. Never share sensitive personal info\n5. Report suspicious users',

    // Help
    'help': 'I can help you with:\n• How to sell/post items\n• How to buy items\n• Account management\n• Categories\n• Safety tips\n• Pricing information\n\nWhat would you like to know?',
    'support': 'For additional support, email us at support@tradehub.com. I\'m here to answer common questions about using TradeHub!',

    // Default
    'default': 'I\'m here to help! You can ask me about:\n• Posting/selling items\n• Buying items\n• Account setup\n• Categories\n• Safety tips\n• Pricing\n\nWhat would you like to know?'
}

function getResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim()

    // Check for exact or partial matches
    for (const [key, response] of Object.entries(RESPONSES)) {
        if (key === 'default') continue
        if (message.includes(key)) {
            return response
        }
    }

    // Return default response if no match
    return RESPONSES.default
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

        const botResponse = getResponse(userText)

        return NextResponse.json({ message: botResponse })
    } catch (error: any) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        )
    }
}
