"use client";

import React, { useState, useEffect } from 'react';
import { Play, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';

const REELS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=500&q=80', views: '12.4K', likes: '1.2K' },
    { id: 2, image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?w=500&q=80', views: '8.1K', likes: '942' },
    { id: 3, image: 'https://images.unsplash.com/photo-1490216766795-c1cd77ee7ae5?w=500&q=80', views: '24.5K', likes: '3.1K' },
    { id: 4, image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=500&q=80', views: '5.6K', likes: '450' },
    { id: 5, image: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=500&q=80', views: '41.2K', likes: '5.8K' },
];

export default function InstagramReels() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section className="py-24 border-t border-border bg-background overflow-hidden relative cursor-default" data-cursor-none="true">
            
            {/* Custom Cursor */}
            {isHovering && (
                <div 
                    className="fixed pointer-events-none z-[100] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-widest mix-blend-difference"
                    style={{
                        width: '80px',
                        height: '80px',
                        left: cursorPos.x - 40,
                        top: cursorPos.y - 40,
                        transition: 'transform 0.1s ease-out',
                    }}
                >
                    PLAY
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-12">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white">
                            @CREDO_GIFTING
                        </h2>
                        <p className="text-white/50 mt-3 text-sm tracking-widest uppercase font-bold">
                            Find inspiration on the grid.
                        </p>
                    </div>
                    <a href="#" className="mt-8 md:mt-0 text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-white/70 transition-colors bg-white/10 px-6 py-3 rounded-full border border-white/10 inline-block hover:bg-white/20">    
                        Follow Us
                    </a>
                </div>

                <div 
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {REELS.map((reel) => (
                        <div 
                            key={reel.id} 
                            className="relative aspect-[4/5] group overflow-hidden bg-black border border-white/10 rounded-[2rem] hover:border-white/20 transition-colors cursor-none"
                        >
                            {/* Image */}
                            <img
                                src={reel.image}
                                alt="Instagram Reel"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />

                            {/* Play icon top right */}
                            <div className="absolute top-4 right-4 text-white/90 glass-panel rounded-full p-2 bg-black/40 backdrop-blur-md">
                                <Play className="fill-white w-4 h-4" />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                <div className="flex items-center text-white font-bold text-sm tracking-widest">
                                    <Play className="w-4 h-4 mr-2 fill-white" />
                                    {reel.views}
                                </div>
                                <div className="flex items-center text-white font-bold text-sm tracking-widest">
                                    <Heart className="w-4 h-4 mr-2 fill-white" />
                                    {reel.likes}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
