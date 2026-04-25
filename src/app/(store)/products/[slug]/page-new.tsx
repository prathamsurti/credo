"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    ShoppingCart,
    Heart,
    Minus,
    Plus,
    Package,
    ArrowUp,
    Sun,
    Moon,
    ChevronRight,
    ChevronDown,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProductToGuestCart } from "@/lib/cart-client";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    stock: number;
    minOrder: number;
    tags: string[];
    category: { name: string; slug: string };
}

interface RelatedProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: session } = useSession();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showStickyBar, setShowStickyBar] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data.product);
                setRelatedProducts(data.relatedProducts || []);
                setQuantity(data.product?.minOrder || 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    // Scroll listener for sticky bar
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyBar(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAddToCart = async () => {
        setAddingToCart(true);
        try {
            if (session?.user?.id) {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: product!.id, quantity }),
                });

                if (!res.ok) {
                    throw new Error("Failed to add product to cart");
                }
            } else {
                addProductToGuestCart(
                    {
                        id: product!.id,
                        name: product!.name,
                        slug: product!.slug,
                        price: product!.price,
                        images: product!.images,
                        stock: product!.stock,
                        minOrder: product!.minOrder,
                    },
                    quantity
                );
            }

            setAddedToCart(true);
            toast.success("Added to cart");
            window.dispatchEvent(new Event("cart:updated"));
            window.dispatchEvent(new Event("cart:open"));
            setTimeout(() => setAddedToCart(false), 2000);
        } catch {
            toast.error("Could not add this item to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        if (!session) {
            window.location.href = `/login?callbackUrl=/products/${slug}`;
            return;
        }
        setAddingToWishlist(true);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product!.id }),
            });
        } catch (err) {
            console.error("Failed to add to wishlist:", err);
        } finally {
            setAddingToWishlist(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="w-10 h-10 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 py-32 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Product not found</h2>
                <Link href="/products">
                    <Button variant="outline" className="mt-8 border-foreground text-foreground">BROWSE CATALOG</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#181818] text-[#e5e5e5]' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
            {/* Main Product Section */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* Left: Product Gallery */}
                    <div className="flex flex-col gap-4 md:sticky md:top-28 md:self-start z-10">
                        <div className={`aspect-square rounded-2xl overflow-hidden ${isDarkMode ? 'bg-[#222]' : 'bg-gray-100'} flex items-center justify-center`}>
                            {product.images[selectedImage] ? (
                                <img 
                                    src={product.images[selectedImage]} 
                                    alt={product.name} 
                                    className="w-4/5 h-4/5 object-contain hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <Package className="w-20 h-20 text-white/30" />
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? (isDarkMode ? 'border-gray-400' : 'border-gray-800') : 'border-transparent'} ${isDarkMode ? 'bg-[#222]' : 'bg-gray-200'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col">
                        <div className={`text-sm tracking-widest uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {product.category.name}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            {product.name}
                        </h1>
                        <div className="text-2xl font-semibold mb-2">
                            ₹{product.price.toLocaleString("en-IN")}
                        </div>
                        {product.compareAtPrice && (
                            <div className={`text-sm mb-6 line-through opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ₹{product.compareAtPrice.toLocaleString("en-IN")}
                            </div>
                        )}
                        <p className={`mb-8 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {product.description}
                        </p>

                        {/* Stock Status */}
                        <div className="mb-8">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${product.stock > 0 ? (isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700')}`}>
                                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
                            </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            {product.stock > 0 && (
                                <>
                                    <div className={`flex items-center justify-between px-4 py-3 rounded-full border sm:w-1/3 ${isDarkMode ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-white'}`}>
                                        <button onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))} className={`p-1 hover:opacity-70 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className={`font-medium ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className={`p-1 hover:opacity-70 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                                    >
                                        {addingToCart ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Adding...
                                            </>
                                        ) : addedToCart ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Added!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Buy it now
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleAddToWishlist}
                                        disabled={addingToWishlist}
                                        className={`flex-1 font-medium py-3 px-6 rounded-full border transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <Heart className="w-5 h-5" />
                                        Add to Wishlist
                                    </button>
                                </>
                            )}
                            {product.stock === 0 && (
                                <button className={`flex-1 font-medium py-3 px-6 rounded-full border transition-colors ${isDarkMode ? 'border-gray-600 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                                    Out of Stock
                                </button>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="mb-8 flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <div key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Accordions */}
                        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <AccordionItem title="Product Details" isDark={isDarkMode} content={`This ${product.name} is designed with premium quality materials. Available in multiple variants with minimum order quantity of ${product.minOrder}.`} />
                            <AccordionItem title="Shipping & Returns" isDark={isDarkMode} content="We offer fast shipping across India. Products can be returned within 14 days of purchase in original condition. Free shipping on orders above ₹500." />
                            <AccordionItem title="Care Guide" isDark={isDarkMode} content="Keep your product clean and dry. For best longevity, avoid extreme temperatures and harsh chemicals. Store in a cool, dry place." />
                        </div>
                    </div>
                </div>
            </main>

            {/* Recommendations Section */}
            {relatedProducts.length > 0 && (
                <section className={`py-16 ${isDarkMode ? 'bg-[#111]' : 'bg-gray-100'}`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12">Related Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedProducts.slice(0, 3).map((product) => (
                                <Link key={product.id} href={`/products/${product.slug}`}>
                                    <RecommendationCard 
                                        image={product.images[0]}
                                        title={product.name}
                                        price={product.price}
                                        isDark={isDarkMode}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQs Section */}
            <section className="max-w-4xl mx-auto px-4 md:px-8 py-20">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">Frequently Asked Questions</h2>
                <div className="flex flex-col gap-2">
                    <FaqItem question="What is the minimum order quantity?" isDark={isDarkMode} answer={`The minimum order quantity for this product is ${product.minOrder} unit(s).`} />
                    <FaqItem question="Do you offer international shipping?" isDark={isDarkMode} answer="Currently, we offer shipping within India. International shipping will be available soon." />
                    <FaqItem question="What is your return policy?" isDark={isDarkMode} answer="We accept returns within 14 days of purchase if the product is in original condition and packaging." />
                    <FaqItem question="How long does delivery take?" isDark={isDarkMode} answer="Standard delivery takes 3-5 business days. Express delivery options are available for selected locations." />
                </div>
            </section>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 flex flex-col gap-3 z-40">
                <button 
                    onClick={scrollToTop}
                    className={`p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-[#222] text-gray-400 hover:text-white border border-gray-700' : 'bg-white text-gray-600 hover:text-black border border-gray-200'} transition-all`}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-[#222] text-gray-400 hover:text-white border border-gray-700' : 'bg-white text-gray-600 hover:text-black border border-gray-200'} transition-all`}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Sticky Bottom Add To Cart Bar */}
            {product.stock > 0 && (
                <div 
                    className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'} border-t p-3 z-50 transform transition-transform duration-300 ease-in-out ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
                >
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded ${isDarkMode ? 'bg-[#222]' : 'bg-gray-200'} hidden sm:flex items-center justify-center`}>
                                {product.images[0] && <img src={product.images[0]} alt="thumbnail" className="w-8 h-8 object-contain" />}
                            </div>
                            <div className="hidden md:block">
                                <div className="font-semibold text-sm truncate max-w-[200px]">{product.name}</div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.category.name}</div>
                            </div>
                            <div className="font-bold text-lg hidden sm:block">₹{product.price.toLocaleString("en-IN")}</div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className={`hidden md:flex items-center justify-between px-3 py-2.5 rounded-full border ${isDarkMode ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-white'} w-28`}>
                                <button onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))} className={`p-0.5 hover:opacity-70 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className={`p-0.5 hover:opacity-70 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-8 rounded-full transition-colors whitespace-nowrap text-sm flex items-center justify-center gap-2"
                            >
                                {addingToCart ? 'Adding...' : 'Add to cart'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponents

function AccordionItem({ title, isDark, content }: { title: string; isDark: boolean; content: string }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-5 text-left font-medium hover:opacity-80 transition-opacity"
            >
                <span className="text-lg">{title}</span>
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
            {isOpen && (
                <div className={`pb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
}

function FaqItem({ question, isDark, answer }: { question: string; isDark: boolean; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={`rounded-xl overflow-hidden mb-3 ${isDark ? 'bg-[#222]' : 'bg-white border border-gray-200'}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-black/10 transition-colors"
            >
                <span className="font-medium pr-4">{question}</span>
                {isOpen ? <Minus className="w-5 h-5 flex-shrink-0" /> : <Plus className="w-5 h-5 flex-shrink-0" />}
            </button>
            {isOpen && (
                <div className={`px-6 pb-6 pt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

function RecommendationCard({ image, title, price, isDark }: { image: string; title: string; price: number; isDark: boolean }) {
    return (
        <div className="group cursor-pointer flex flex-col gap-4">
            <div className={`aspect-[4/5] rounded-2xl overflow-hidden ${isDark ? 'bg-[#222]' : 'bg-gray-200'}`}>
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                />
            </div>
            <div>
                <h3 className={`font-medium text-lg ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {title}
                </h3>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ₹{price.toLocaleString("en-IN")}
                </p>
            </div>
        </div>
    );
}
