'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
            const { data, error } = await supabase
                .from('orders')
                .select('*');

            if (error) {
                console.error('Error loading orders:', error);
            } else {
                setOrders(data);
            }
            setLoading(false);
        }

        loadOrders();
    }, []);

    if (loading) {
        return <p className="p-6">Loading…</p>;
    }

    return (
        <div className="flex flex-col gap-4 p-6">
            <Link href="/quote" className ="text-blue-500 hover:underline">
                Go Back to Quote Page
            </Link>
            <h1 className="text-2xl font-bold">Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="border p-4">
                        <p>Order #{order.id}</p>
                        <Link href={`/orders/${order.id}`} className="text-blue-500 hover:underline">
                            View Details
                        </Link>
                        <p>Status: {order.status}</p>
                    </div>
                ))
            )}
        </div>
    );
}
