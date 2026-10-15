'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  created_at: string;
  alloy: string;
  length: number;
  width: number;
  thickness: number;
  quantity: number;
  total: number;
  status: string;
}

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setNotFound(true);
      } else {
        setOrder(data);
      }
    }
    loadOrder();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => setOrder(payload.new as Order)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (notFound) return <p className="p-6">Order not found.</p>;
  if (!order) return <p className="p-6">Loading…</p>;

  return (
    <div className="flex flex-col gap-2 p-6 max-w-md">
      <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      <p className="text-3xl font-bold uppercase text-blue-500">{order.status}</p>
      <p>Alloy: {order.alloy}</p>
      <p>Size: {order.length}" × {order.width}" × {order.thickness}"</p>
      <p>Quantity: {order.quantity}</p>
      <p>Total: {money(order.total)}</p>
      <p className="text-gray-400 text-sm">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>
    </div>
  );
}