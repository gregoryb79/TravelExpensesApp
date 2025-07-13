import { slimCurrency } from "../utils/currencyUtils";
import { Expense } from "./expense";

export type Trip = {
    id: string;
    name: string;
    baseCurrency: slimCurrency;
    localCurrency: slimCurrency;
    currenciesList: slimCurrency[];    
    expenses: Expense[];
    created_at: string; 
}