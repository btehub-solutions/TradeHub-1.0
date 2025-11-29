'use client'

import { useState, useEffect, useRef } from 'react'

interface PriceRangeSliderProps {
    min: number
    max: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    step?: number
}

export default function PriceRangeSlider({
    min,
    max,
    value,
    onChange,
    step = 1000
}: PriceRangeSliderProps) {
    const [localValue, setLocalValue] = useState(value)
    const sliderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), localValue[1] - step)
        const newValue: [number, number] = [newMin, localValue[1]]
        setLocalValue(newValue)
        onChange(newValue)
    }

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), localValue[0] + step)
        const newValue: [number, number] = [localValue[0], newMax]
        setLocalValue(newValue)
        onChange(newValue)
    }

    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value) || min, localValue[1] - step)
        const newValue: [number, number] = [newMin, localValue[1]]
        setLocalValue(newValue)
        onChange(newValue)
    }

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value) || max, localValue[0] + step)
        const newValue: [number, number] = [localValue[0], newMax]
        setLocalValue(newValue)
        onChange(newValue)
    }

    const minPercent = ((localValue[0] - min) / (max - min)) * 100
    const maxPercent = ((localValue[1] - min) / (max - min)) * 100

    return (
        <div className="space-y-4">
            {/* Dual Range Slider */}
            <div className="relative pt-6 pb-2" ref={sliderRef}>
                {/* Track */}
                <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    {/* Active range */}
                    <div
                        className="absolute h-2 bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{
                            left: `${minPercent}%`,
                            right: `${100 - maxPercent}%`
                        }}
                    />
                </div>

                {/* Min Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[0]}
                    onChange={handleMinChange}
                    className="absolute top-6 left-0 right-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
                    style={{ zIndex: localValue[0] > max - (max - min) / 4 ? 5 : 3 }}
                />

                {/* Max Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[1]}
                    onChange={handleMaxChange}
                    className="absolute top-6 left-0 right-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Value Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Min Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            ₦
                        </span>
                        <input
                            type="number"
                            value={localValue[0]}
                            onChange={handleMinInputChange}
                            min={min}
                            max={localValue[1] - step}
                            step={step}
                            className="w-full pl-7 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Max Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            ₦
                        </span>
                        <input
                            type="number"
                            value={localValue[1]}
                            onChange={handleMaxInputChange}
                            min={localValue[0] + step}
                            max={max}
                            step={step}
                            className="w-full pl-7 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Range Display */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                ₦{localValue[0].toLocaleString()} - ₦{localValue[1].toLocaleString()}
            </div>
        </div>
    )
}
