"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            
            // Check if hovering an element with data-cursor-none (like specific reels sections)
            const target = e.target as HTMLElement;
            if (target && target.closest("[data-cursor-none='true']")) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
        };

        const updateHoverState = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if we are hovering over clickable elements
            const isClickable = target.closest("a, button, input, [role='button'], [tabindex='0']");
            setIsHovering(!!isClickable);
        };

        window.addEventListener("mousemove", updatePosition);
        window.addEventListener("mouseover", updateHoverState);

        return () => {
            window.removeEventListener("mousemove", updatePosition);
            window.removeEventListener("mouseover", updateHoverState);
        };
    }, []);

    // For touch devices or mobile screens, we don't render the custom cursor CSS hiding
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            {/* The Custom Cursor styling */}
            <div
                className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden lg:flex items-center justify-center transition-all duration-100 ease-out ${isHidden ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
            >
                <div
                    className={`relative flex items-center justify-center rounded-full bg-white transition-all duration-300 ease-out transform -translate-x-1/2 -translate-y-1/2 ${
                        isHovering ? "w-10 h-10 opacity-100 scale-150" : "w-4 h-4 opacity-100 scale-100"
                    }`}
                >
                </div>
            </div>
            
            {/* Hide the default cursor completely using a globally injected style only on large screens */}
            <style jsx global>{`
                @media (min-width: 1024px) {
                    * {
                        cursor: none !important;
                    }
                }
            `}</style>
        </>
    );
}
