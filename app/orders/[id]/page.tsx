import { Suspense } from 'react';
import OrderDetails from './order-details';

export default function OrderPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <OrderDetails />
    </Suspense>
  );
}