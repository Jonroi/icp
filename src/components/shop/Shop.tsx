import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

const PRODUCTS: Product[] = [
  {
    id: 'icp-pro',
    name: 'ICP Pro',
    description: 'Advanced ICP analysis with segmentation and scoring.',
    price: 49,
  },
  {
    id: 'campaign-studio',
    name: 'Campaign Studio',
    description: 'Multi‑channel campaign generation and export.',
    price: 79,
  },
  {
    id: 'growth-bundle',
    name: 'Growth Bundle',
    description: 'ICP Pro + Campaign Studio at a discounted price.',
    price: 109,
  },
];

export function Shop(): JSX.Element {
  const [cart, setCart] = useState<Record<string, number>>({});

  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight'>Products</h2>
        <p className='text-sm text-muted-foreground'>
          Simple pricing, pay as you grow.
        </p>
        <div className='mt-4 grid gap-6 md:grid-cols-3'>
          {PRODUCTS.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className='flex items-center justify-between'>
                <span className='text-xl font-semibold'>${product.price}</span>
                <Button onClick={() => addToCart(product.id)}>
                  Add to cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-semibold tracking-tight'>Cart</h2>
        {Object.keys(cart).length === 0 ? (
          <p className='text-sm text-muted-foreground'>Your cart is empty.</p>
        ) : (
          <Card>
            <CardContent className='space-y-3 pt-6'>
              {Object.entries(cart).map(([id, qty]) => {
                const product = PRODUCTS.find((p) => p.id === id)!;
                return (
                  <div
                    key={id}
                    className='flex items-center justify-between text-sm'>
                    <span>
                      {product.name} × {qty}
                    </span>
                    <span>${product.price * qty}</span>
                  </div>
                );
              })}
              <div className='flex items-center justify-between border-t pt-3'>
                <span className='font-medium'>Total</span>
                <span className='text-base font-semibold'>${total}</span>
              </div>
              <div className='pt-2'>
                <Button disabled={total === 0}>Checkout</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
