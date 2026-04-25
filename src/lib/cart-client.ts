export interface CartProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    minOrder: number;
}

export interface ClientCartItem {
    id: string;
    quantity: number;
    product: CartProduct;
}

const GUEST_CART_KEY = "credo:guest-cart:v1";

const hasWindow = () => typeof window !== "undefined";

export function getGuestCartItems(): ClientCartItem[] {
    if (!hasWindow()) return [];
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function setGuestCartItems(items: ClientCartItem[]) {
    if (!hasWindow()) return;
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function addProductToGuestCart(
    product: CartProduct,
    quantity: number
): ClientCartItem[] {
    const current = getGuestCartItems();
    const clampedQuantity = Math.max(1, Math.min(product.stock, quantity));

    const index = current.findIndex((item) => item.product.id === product.id);
    if (index >= 0) {
        const existing = current[index];
        current[index] = {
            ...existing,
            quantity: Math.min(product.stock, existing.quantity + clampedQuantity),
        };
    } else {
        current.push({
            id: `guest-${product.id}`,
            quantity: clampedQuantity,
            product,
        });
    }

    setGuestCartItems(current);
    return current;
}

export function updateGuestCartQuantity(
    cartItemId: string,
    quantity: number
): ClientCartItem[] {
    const current = getGuestCartItems();
    const index = current.findIndex((item) => item.id === cartItemId);
    if (index < 0) return current;

    if (quantity <= 0) {
        const next = current.filter((item) => item.id !== cartItemId);
        setGuestCartItems(next);
        return next;
    }

    const item = current[index];
    current[index] = {
        ...item,
        quantity: Math.min(item.product.stock, Math.max(1, quantity)),
    };

    setGuestCartItems(current);
    return current;
}

export function removeGuestCartItem(cartItemId: string): ClientCartItem[] {
    const current = getGuestCartItems();
    const next = current.filter((item) => item.id !== cartItemId);
    setGuestCartItems(next);
    return next;
}
