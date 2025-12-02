'use client'

import { CheckCircle, Camera, DollarSign, MessageCircle, TrendingUp, Shield, Clock, Star, Package, Users, Zap, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SellerGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Seller's Guide to Success</h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Master the art of selling on TradeHub with our comprehensive guide. Learn proven strategies to maximize your sales and build a thriving business.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1000+</h3>
                        <p className="text-gray-600 dark:text-gray-400">Active Buyers</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">85%</h3>
                        <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24hrs</h3>
                        <p className="text-gray-600 dark:text-gray-400">Avg. Sale Time</p>
                    </div>
                </div>

                {/* Getting Started */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-600" />
                        Getting Started
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="space-y-6">
                            <Step
                                number={1}
                                title="Create Your Account"
                                description="Sign up for free and complete your profile with accurate information. A complete profile builds trust with buyers."
                                icon={Users}
                            />
                            <Step
                                number={2}
                                title="Prepare Your Item"
                                description="Clean and inspect your item. Gather all relevant information including model numbers, dimensions, and condition details."
                                icon={Package}
                            />
                            <Step
                                number={3}
                                title="Take Quality Photos"
                                description="Capture clear, well-lit photos from multiple angles. Good photos can increase your sale chances by up to 70%."
                                icon={Camera}
                            />
                            <Step
                                number={4}
                                title="Create Your Listing"
                                description="Write a detailed, honest description. Include all important details and set a competitive price based on market research."
                                icon={CheckCircle}
                            />
                        </div>
                    </div>
                </section>

                {/* Photography Tips */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <Camera className="w-8 h-8 text-blue-600" />
                        Photography Best Practices
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TipCard
                            icon={Camera}
                            title="Use Natural Lighting"
                            description="Take photos during daytime near a window. Avoid harsh shadows and use soft, diffused light for the best results."
                            color="blue"
                        />
                        <TipCard
                            icon={Package}
                            title="Show Multiple Angles"
                            description="Include front, back, side, and detail shots. Show any defects or wear honestly to build buyer trust."
                            color="green"
                        />
                        <TipCard
                            icon={Star}
                            title="Clean Background"
                            description="Use a plain, uncluttered background. A white or neutral backdrop makes your item stand out."
                            color="purple"
                        />
                        <TipCard
                            icon={Zap}
                            title="Highlight Features"
                            description="Zoom in on unique features, brand labels, or special details that add value to your item."
                            color="orange"
                        />
                    </div>
                </section>

                {/* Pricing Strategy */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        Pricing Strategy
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="space-y-6">
                            <PricingTip
                                title="Research the Market"
                                description="Check similar listings on TradeHub and other platforms. Price competitively based on condition, age, and demand."
                            />
                            <PricingTip
                                title="Consider Condition"
                                description="New items: 70-80% of retail. Excellent: 50-70%. Good: 30-50%. Fair: 20-30%. Adjust based on market demand."
                            />
                            <PricingTip
                                title="Leave Room for Negotiation"
                                description="Price slightly higher than your minimum acceptable price. Most buyers expect to negotiate, so build in 10-15% flexibility."
                            />
                            <PricingTip
                                title="Use Psychological Pricing"
                                description="Price at ₦9,900 instead of ₦10,000. Odd numbers feel like better deals and can increase conversion rates."
                            />
                        </div>
                    </div>
                </section>

                {/* Writing Great Descriptions */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                        Writing Compelling Descriptions
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Essential Elements</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-900 dark:text-white">Brand & Model:</strong>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">Always include the manufacturer and specific model number</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-900 dark:text-white">Condition:</strong>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">Be honest about wear, defects, or damage. Include age and usage history</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-900 dark:text-white">Specifications:</strong>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">List technical details, dimensions, color, materials, and features</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-900 dark:text-white">What's Included:</strong>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">Mention accessories, original packaging, manuals, or warranties</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-900 dark:text-white">Reason for Selling:</strong>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">A brief, honest reason builds trust (upgrading, moving, etc.)</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-blue-600" />
                                    Example of a Great Description
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    &ldquo;iPhone 13 Pro Max 256GB in Sierra Blue. Excellent condition with minimal wear. Used for 8 months, always kept in a case with screen protector (both included). Battery health at 98%. Comes with original box, charging cable, and Apple warranty valid until Dec 2024. Selling because I upgraded to iPhone 15. No scratches on screen, tiny scuff on bottom edge (see photo 4). Face ID and all cameras work perfectly.&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Safety & Security */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Safety & Security Tips
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SafetyCard
                            icon={Shield}
                            title="Meet in Public Places"
                            description="Always meet buyers in well-lit, public locations like shopping malls or bank lobbies. Bring a friend if possible."
                        />
                        <SafetyCard
                            icon={AlertCircle}
                            title="Verify Payment First"
                            description="For bank transfers, confirm the money is in your account before handing over the item. Avoid checks or promises of future payment."
                        />
                        <SafetyCard
                            icon={MessageCircle}
                            title="Keep Communication on Platform"
                            description="Use TradeHub's messaging or WhatsApp. This creates a record and helps prevent scams."
                        />
                        <SafetyCard
                            icon={Users}
                            title="Trust Your Instincts"
                            description="If something feels off, it probably is. Don't proceed with transactions that make you uncomfortable."
                        />
                    </div>
                </section>

                {/* Boosting Your Sales */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        Boost Your Sales
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BoostTip
                                title="Respond Quickly"
                                description="Reply to inquiries within 1-2 hours. Fast responses increase your chances of making a sale by 3x."
                            />
                            <BoostTip
                                title="Be Professional"
                                description="Use proper grammar, be courteous, and answer all questions thoroughly. Professionalism builds trust."
                            />
                            <BoostTip
                                title="Update Regularly"
                                description="If your item hasn't sold in a week, consider updating the photos, adjusting the price, or refreshing the description."
                            />
                            <BoostTip
                                title="Build Your Reputation"
                                description="Encourage buyers to leave reviews. A strong seller rating dramatically increases future sales."
                            />
                        </div>
                    </div>
                </section>

                {/* Common Mistakes */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        Common Mistakes to Avoid
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-100 dark:border-red-800">
                        <div className="space-y-4">
                            <MistakeItem mistake="Poor quality or insufficient photos" />
                            <MistakeItem mistake="Vague or incomplete descriptions" />
                            <MistakeItem mistake="Overpricing without market research" />
                            <MistakeItem mistake="Being unresponsive to buyer inquiries" />
                            <MistakeItem mistake="Hiding defects or misrepresenting condition" />
                            <MistakeItem mistake="Not being flexible with meeting times/locations" />
                            <MistakeItem mistake="Accepting payment methods you're uncomfortable with" />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Put these tips into practice and create your first listing today. Join thousands of successful sellers on TradeHub!
                    </p>
                    <Link href="/listings/new">
                        <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                            Create Your First Listing
                        </button>
                    </Link>
                </section>
            </div>
        </div>
    )
}

// Helper Components
function Step({ number, title, description, icon: Icon }: { number: number, title: string, description: string, icon: any }) {
    return (
        <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{number}</span>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    )
}

function TipCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    )
}

function PricingTip({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex items-start gap-3 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
            <DollarSign className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    )
}

function SafetyCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    )
}

function BoostTip({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    )
}

function MistakeItem({ mistake }: { mistake: string }) {
    return (
        <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 dark:text-gray-300">{mistake}</p>
        </div>
    )
}
