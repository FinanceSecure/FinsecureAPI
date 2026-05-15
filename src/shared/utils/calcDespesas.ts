type Expenses = {
  amount: number;
};

export function calcTotalExpenses(
  incurredExpenses: Expenses[]
): number {
  return incurredExpenses.reduce(
    (total, expense) => total + expense.amount, 0
  );
};
