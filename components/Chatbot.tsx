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

        // Predefined responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Hello! Welcome to TradeHub. How can I assist you today?'
        }
        if (lowerMessage.includes('sell') || lowerMessage.includes('post')) {
            return 'To sell an item, go to your Dashboard and click "Add New Listing". Fill in the details and upload photos of your item!'
        }
        if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
            return 'To buy an item, browse our listings on the home page. Click on any item to view details and contact the seller.'
        }
        if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
            return 'To delete a listing, go to your Dashboard, find the listing, and click the "Delete" button.'
        }
        if (lowerMessage.includes('edit') || lowerMessage.includes('update')) {
            return 'To edit a listing, go to your Dashboard, find the listing, and click the "Edit" button. Make your changes and save.'
        }
        if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
            return 'You can manage your account by signing in. Your listings are available in the Dashboard.'
        }
        if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
            return 'For additional support, you can contact us at support@tradehub.com or call +234-XXX-XXXX-XXX.'
        }
        if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
            return 'TradeHub connects buyers and sellers. Payment arrangements are made directly between you and the seller.'
        }
        if (lowerMessage.includes('help')) {
            return 'I can help you with:\n• Posting listings\n• Buying items\n• Managing your account\n• Editing or deleting listings\n\nWhat would you like to know?'
        }

        return 'I\'m not sure about that. You can ask me about posting listings, buying items, managing your account, or contact support for more help!'
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
                        <p className="text-sm text-blue-100">We're here to help!</p>
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
