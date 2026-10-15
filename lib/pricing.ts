export type Alloy = "6061" | "7075" | "MIC-6";

export interface QuoteInput {
  alloy: Alloy;
  length: number;    
  width: number;      
  thickness: number;  
  quantity: number;
}

export interface QuoteResult {
  weightPerPiece: number;  
  materialCost: number;   
  cutFee: number;          
  total: number;           
  minimumApplied: boolean;
}

const DENSITY = 0.098;      
const CUT_FEE_PER_PIECE = 15;
const MINIMUM_ORDER = 50;

export const PRICE_PER_LB: Record<Alloy, number> = {
  "6061": 4.5,
  "7075": 7.0,
  "MIC-6": 5.25,
};
export function calculateQuote(input: QuoteInput): QuoteResult {
  const { alloy, length, width, thickness, quantity } = input;

  const weightPerPiece = length * width * thickness * DENSITY;
  const materialCost = weightPerPiece * PRICE_PER_LB[alloy] * quantity;
  const cutFee = CUT_FEE_PER_PIECE * quantity;
  const subtotal = materialCost + cutFee;

  const minimumApplied = subtotal < MINIMUM_ORDER;
  const total = minimumApplied ? MINIMUM_ORDER : subtotal;

  return { weightPerPiece, materialCost, cutFee, total, minimumApplied };
}