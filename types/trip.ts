import { Currency } from "./currency";
import { Expense } from "./expense";

export type Trip = {
    id: string;
    name: string;
    baseCurrency: Currency;
    expenses: Expense[];
    created_at: string; 
}