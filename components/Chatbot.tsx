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
            text: 'Hi! I\'m your TradeHub AI assistant. How can I help you today?',
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

    const handleSend = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const currentInput = inputText
        setInputText('')

        // Add typing indicator
        const typingMessage: Message = {
            id: 'typing',
            text: 'Typing...',
            sender: 'bot',
            timestamp: new Date()
        }
        setMessages(prev => [...prev, typingMessage])

        try {
            // Call AI API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            })

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const data = await response.json()

            // Remove typing indicator and add real response
            setMessages(prev => {
                const withoutTyping = prev.filter(m => m.id !== 'typing')
                return [
                    ...withoutTyping,
                    {
                        id: (Date.now() + 1).toString(),
                        text: data.message,
                        sender: 'bot',
                        timestamp: new Date()
                    }
                ]
            })
        } catch (error) {
            console.error('Chat error:', error)
            // Remove typing indicator and show error
            setMessages(prev => {
                const withoutTyping = prev.filter(m => m.id !== 'typing')
                return [
                    ...withoutTyping,
                    {
                        id: (Date.now() + 1).toString(),
                        text: 'Sorry, I\'m having trouble connecting. Please try again or contact support@tradehub.com',
                        sender: 'bot',
                        timestamp: new Date()
                    }
                ]
            })
        }
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
                        <h3 className="font-bold text-lg">TradeHub AI Assistant</h3>
                        <p className="text-sm text-blue-100">Powered by Google Gemini</p>
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
                                            : message.id === 'typing'
                                                ? 'bg-gray-200 text-gray-600 rounded-bl-none italic'
                                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                                    {message.id !== 'typing' && (
                                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
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
                                placeholder="Ask me anything about TradeHub..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
