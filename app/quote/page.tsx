'use client';

import { useState } from 'react';
import { calculateQuote, Alloy } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';

export default function QuotePage() {
  const [alloy, setAlloy] = useState<Alloy>('6061');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [quantity, setQuantity] = useState('1');

  const l = Number(length);
  const w = Number(width);
  const t = Number(thickness);
  const q = Number(quantity);

  const allPositive = l > 0 && w > 0 && t > 0 && q > 0;
  const oversize = l > 96 || w > 48 || t > 6;
  const isValid = allPositive && !oversize;

  const result = calculateQuote({ alloy, length: l, width: w, thickness: t, quantity: q });

  const [orderMessage, setOrderMessage] = useState('');
    const [placing, setPlacing] = useState(false);

    async function handleOrder() {
        setPlacing(true);
        setOrderMessage('');

        const { data, error } = await supabase
            .from('orders')
            .insert({
            alloy,
            length: l,
            width: w,
            thickness: t,
            quantity: q,
            total: result.total,
            })
            .select()
            .single();

        setPlacing(false);

        if (error) {
            setOrderMessage(`Something went wrong: ${error.message}`);
        } else {
            setOrderMessage(`Order #${data.id} placed! Status: ${data.status}`);
        }
    }

  const money = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const inputClass = 'border border-gray-400 rounded px-2 py-1 ml-2';

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md">
      <h1 className="text-2xl font-bold">Instant Quote</h1>

      <label>
        Alloy:
        <select
          className={inputClass}
          value={alloy}
          onChange={(e) => setAlloy(e.target.value as Alloy)}
        >
          <option value="6061">6061</option>
          <option value="7075">7075</option>
          <option value="MIC-6">MIC-6</option>
        </select>
      </label>

      <label>
        Length (in):
        <input className={inputClass} type="number" value={length}
          onChange={(e) => setLength(e.target.value)} />
      </label>

      <label>
        Width (in):
        <input className={inputClass} type="number" value={width}
          onChange={(e) => setWidth(e.target.value)} />
      </label>

      <label>
        Thickness (in):
        <input className={inputClass} type="number" value={thickness}
          onChange={(e) => setThickness(e.target.value)} />
      </label>

      <label>
        Quantity:
        <input className={inputClass} type="number" value={quantity}
          onChange={(e) => setQuantity(e.target.value)} />
      </label>

      {oversize && <p className="text-red-500">Contact us for oversize pieces.</p>}

      {isValid ? (
        <div className="border-t pt-4 flex flex-col gap-1">
          <p>Weight per piece: {result.weightPerPiece.toFixed(2)} lb</p>
          <p>Material cost: {money(result.materialCost)}</p>
          <p>Cut fee: {money(result.cutFee)}</p>
          <p className="text-xl font-bold">Total: {money(result.total)}</p>
          {result.minimumApplied && (
            <p className="text-yellow-500">Minimum order $50 applied.</p>
          )}
        </div>
      ) : (
        !oversize && <p className="text-gray-400">Enter all dimensions to see a price.</p>
      )}
      <div>
        <button
            onClick={handleOrder}
            disabled={placing}
            className="mt-2 bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
            {placing ? 'Placing order…' : 'Order'}
            </button>

            {orderMessage && <p>{orderMessage}</p>}
      </div>
    </div>
  );
}