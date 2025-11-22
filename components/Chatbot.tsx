'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

type Message = {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! I\'m your TradeHub assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase()

        // Greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hello! Welcome to TradeHub - your local marketplace for buying and selling. How can I assist you today?'
        }

        // About TradeHub
        if (lowerMessage.includes('what is tradehub') || lowerMessage.includes('about tradehub') || lowerMessage.includes('tell me about')) {
            return 'TradeHub is a local marketplace platform where you can buy and sell pre-loved items in Nigeria. We connect buyers and sellers in your community, making it easy to find great deals or sell items you no longer need!'
        }

        // Categories
        if (lowerMessage.includes('categor')) {
            return 'TradeHub has 6 main categories:\n• Electronics (phones, laptops, gadgets)\n• Vehicles (cars, motorcycles)\n• Real Estate (houses, apartments, land)\n• Furniture (home and office furniture)\n• Fashion (clothing, shoes, accessories)\n• Other (everything else)\n\nYou can filter by category on the home page!'
        }

        // Selling/Posting
        if (lowerMessage.includes('sell') || lowerMessage.includes('post') || lowerMessage.includes('list')) {
            return 'To sell an item on TradeHub:\n1. Sign in to your account\n2. Go to your Dashboard\n3. Click "Add New Listing"\n4. Fill in the details (title, description, price, location, category)\n5. Upload photos of your item\n6. Click "Post Listing"\n\nYour item will be visible to buyers immediately!'
        }

        // Buying/Searching
        if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
            return 'To buy an item:\n1. Browse listings on the home page\n2. Use the search bar to find specific items\n3. Filter by category using the category buttons\n4. Click on any item to view full details\n5. Contact the seller using the provided phone number\n\nAll listings show price, location, and seller contact info!'
        }

        // Authentication/Account
        if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('create account')) {
            return 'To create an account:\n1. Click "Sign In" in the top navigation\n2. Click "Sign Up" on the login page\n3. Enter your email and password\n4. Click "Sign Up"\n\nYou\'ll receive a confirmation email. Once verified, you can start posting listings!'
        }

        if (lowerMessage.includes('sign in') || lowerMessage.includes('login') || lowerMessage.includes('log in')) {
            return 'To sign in:\n1. Click "Sign In" in the top navigation\n2. Enter your email and password\n3. Click "Sign In"\n\nOnce signed in, you can access your Dashboard and manage your listings!'
        }

        if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
            return 'Your account allows you to:\n• Post unlimited listings\n• Manage all your listings from the Dashboard\n• Edit or delete your listings\n• Track your posted items\n\nAccess your Dashboard by clicking "Dashboard" in the navigation after signing in.'
        }

        // Dashboard
        if (lowerMessage.includes('dashboard')) {
            return 'Your Dashboard is your control center! Here you can:\n• View all your posted listings\n• Add new listings\n• Edit existing listings\n• Delete listings\n• See how many items you have posted\n\nAccess it from the top navigation when signed in.'
        }

        // Editing listings
        if (lowerMessage.includes('edit') || lowerMessage.includes('update') || lowerMessage.includes('change')) {
            return 'To edit a listing:\n1. Go to your Dashboard\n2. Find the listing you want to edit\n3. Click the "Edit" button\n4. Make your changes (title, description, price, location)\n5. Click "Save Changes"\n\nNote: You can only edit listings that are marked as "available".'
        }

        // Deleting listings
        if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
            return 'To delete a listing:\n1. Go to your Dashboard\n2. Find the listing you want to delete\n3. Click the "Delete" button\n4. Confirm the deletion\n\nWarning: This action cannot be undone!'
        }

        // Pricing
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
            return 'TradeHub is completely FREE to use! There are:\n• No listing fees\n• No commission on sales\n• No hidden charges\n\nYou can post as many items as you want at no cost!'
        }

        // Payment
        if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
            return 'TradeHub connects buyers and sellers directly. We don\'t handle payments - all payment arrangements are made between you and the seller/buyer.\n\nFor safety:\n• Meet in public places\n• Inspect items before paying\n• Use secure payment methods\n• Trust your instincts!'
        }

        // Contact/Support
        if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
            return 'Need additional help? Contact our support team:\n📧 Email: support@tradehub.com\n📞 Phone: +234-XXX-XXXX-XXX\n\nWe typically respond within 24 hours!'
        }

        // Location
        if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
            return 'TradeHub operates across Nigeria! When posting a listing, you specify your location so buyers can find items near them. You can search for items in specific locations using the search bar.'
        }

        // Images/Photos
        if (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
            return 'You can upload photos when creating a listing! Good photos help sell items faster. Tips:\n• Use clear, well-lit photos\n• Show the item from multiple angles\n• Include any defects or damage\n• Use your phone camera for best results'
        }

        // Safety
        if (lowerMessage.includes('safe') || lowerMessage.includes('security') || lowerMessage.includes('scam')) {
            return 'Stay safe on TradeHub:\n• Meet in public, well-lit places\n• Bring a friend when meeting buyers/sellers\n• Inspect items before paying\n• Never share sensitive personal information\n• Trust your instincts - if something feels wrong, walk away\n• Report suspicious activity to support@tradehub.com'
        }

        // General help
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return 'I can help you with:\n• Creating and managing listings\n• Buying and searching for items\n• Account and sign-in issues\n• Categories and pricing\n• Safety tips\n• Contact information\n\nWhat would you like to know more about?'
        }

        // Default response
        return 'I\'m here to help! You can ask me about:\n• How to buy or sell items\n• Managing your account and listings\n• Categories and search features\n• Pricing and payments\n• Safety tips\n• Contact information\n\nWhat would you like to know?'
    }

    const handleSend = () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')

        // Simulate bot typing delay
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputText),
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        }, 500)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50"
                aria-label="Open chat"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
                        <h3 className="font-bold text-lg">TradeHub Support</h3>
                        <p className="text-sm text-blue-100">We&apos;re here to help!</p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
