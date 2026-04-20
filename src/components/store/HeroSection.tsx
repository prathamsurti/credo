"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    bannerImage?: string | null;
    category: { name: string };
}

export default function HeroSection({ products }: { products: FeaturedProduct[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (!autoPlay || products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [autoPlay, products.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 10000);
    };

    const nextSlide = () => {
        goToSlide((currentIndex + 1) % products.length);
    };

    const prevSlide = () => {
        goToSlide((currentIndex - 1 + products.length) % products.length);
    };

    if (!products || products.length === 0) {
        return (
            <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=2560&auto=format&fit=crop"
                        alt="Phone Case Protection"
                        className="object-cover w-full h-full opacity-40 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
                </div>

                <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 h-full flex flex-col justify-between min-h-screen">
                    <div className="max-w-xl mt-20 lg:mt-32 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                        <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-8">
                            Don't miss out on our biggest sales event of the year. This season, enjoy up to <span className="font-bold text-white">50% off</span> on every online phone case.
                        </p>
                        <Link href="/products">
                            <Button size="lg" className="rounded-full bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg font-bold transition-all border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.2)] backdrop-blur-md">
                                Start buying now
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-auto pt-20">
                        <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 leading-[0.8] mb-8 text-center md:text-left drop-shadow-2xl">
                            Protection with style
                        </h1>
                    </div>
                </div>
            </section>
        );
    }

    const currentProduct = products[currentIndex];

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image - Banner or Product Image */}
            <div className="absolute inset-0 z-0">
                {currentProduct.bannerImage ? (
                    <img
                        src={currentProduct.bannerImage}
                        alt={currentProduct.name}
                        className="object-cover w-full h-full opacity-80 mix-blend-overlay transition-opacity duration-1000"
                    />
                ) : currentProduct.images[0] ? (
                    <img
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        className="object-cover w-full h-full opacity-50 mix-blend-overlay transition-opacity duration-1000"
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
            </div>

            <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 h-full flex flex-col justify-between min-h-screen">
                {/* Left Content */}
                <div className="max-w-xl mt-20 lg:mt-32 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-700">
                    <p className="text-sm uppercase tracking-widest text-amber-400 font-bold mb-3">
                        {currentProduct.category.name}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {currentProduct.name}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-6">
                        {currentProduct.description.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-bold text-white">
                            ₹{currentProduct.price.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <Link href={`/products/${currentProduct.slug}`}>
                        <Button size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-black px-8 py-6 text-lg font-bold transition-all shadow-[0_4px_15px_rgba(251,146,60,0.4)]">
                            Shop Now
                        </Button>
                    </Link>
                </div>

                {/* Bottom Large Text */}
                <div className="mt-auto pt-20">
                    <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 leading-[0.8] mb-8 text-center md:text-left drop-shadow-2xl">
                        {currentProduct.name.split(" ")[0]}
                    </h1>
                </div>
            </div>

            {/* Right Product Image - Desktop Only */}
            {!currentProduct.bannerImage && currentProduct.images[0] && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-5 w-1/2 h-full pointer-events-none">
                    <img
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        className="w-full h-full object-contain object-right drop-shadow-2xl transition-all duration-700 animate-float"
                    />
                </div>
            )}

            {/* Navigation Dots - Bottom Center */}
            {products.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${
                                index === currentIndex
                                    ? "bg-amber-400 w-3 h-3"
                                    : "bg-white/30 w-2 h-2 hover:bg-white/50"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation Arrows */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 backdrop-blur-md"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 backdrop-blur-md"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
        </section>
    );
}
