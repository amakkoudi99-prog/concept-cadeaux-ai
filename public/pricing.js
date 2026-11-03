// Decimal inputs have four places. Monetary outputs are integer MAD centimes.
globalThis.CCPricing = (() => {
  function decimal(value, label) {
    const text = String(value).trim().replace(',', '.');
    if (!/^\d{1,12}(\.\d{1,4})?$/.test(text)) {
      throw new Error(label + ' doit être un nombre positif avec au plus 4 décimales.');
    }
    const [whole, fraction = ''] = text.split('.');
    return BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'));
  }
  function round(numerator, denominator) {
    return (numerator + denominator / 2n) / denominator;
  }
  function calculate(input) {
    if (!/^\d{1,7}$/.test(String(input.quantity)) || BigInt(input.quantity) < 1n) {
      throw new Error('La quantité doit être un entier supérieur à zéro.');
    }
    const quantity = BigInt(input.quantity);
    const purchase = decimal(input.purchaseEUR, 'Prix EUR');
    const rate = decimal(input.exchangeRate, 'Taux EUR/MAD');
    if (!rate) throw new Error('Le taux EUR/MAD doit être supérieur à zéro.');
    const markup = decimal(input.markupPercent, 'Majoration');
    const vat = decimal(input.vatPercent, 'TVA');
    if (vat > 1000000n) throw new Error('La TVA doit être comprise entre 0 et 100 %.');
    const fees = ['international', 'importCharges', 'clearance', 'local', 'fixed']
      .reduce((sum, key) => sum + decimal(input[key], 'Frais ' + key), 0n);
    const personalization = decimal(input.personalization, 'Personnalisation unitaire');
    // Cost is retained as an exact fraction of a centime until display/sale rounding.
    const costNumerator = purchase * rate * quantity + (fees + personalization * quantity) * 10000n;
    const costDenominator = 1000000n;
    const unitCost = round(costNumerator, costDenominator * quantity);
    const suggestedUnitHT = round(
      costNumerator * (1000000n + markup),
      costDenominator * quantity * 1000000n
    );
    const unitHT = input.overrideHT === '' || input.overrideHT == null
      ? suggestedUnitHT : round(decimal(input.overrideHT, 'Prix de vente HT'), 100n);
    const totalHT = unitHT * quantity;
    const totalVAT = round(totalHT * vat, 1000000n);
    const costTotal = round(costNumerator, costDenominator);
    return { quantity, purchaseTotal: round(purchase * rate * quantity, costDenominator),
      costTotal, unitCost, suggestedUnitHT, unitHT, totalHT, totalVAT,
      totalTTC: totalHT + totalVAT, profitHT: totalHT - costTotal };
  }
  function mad(cents) {
    const sign = cents < 0n ? '−' : '';
    const absolute = cents < 0n ? -cents : cents;
    return sign + (absolute / 100n).toString() + ',' +
      (absolute % 100n).toString().padStart(2, '0') + ' MAD';
  }
  return { calculate, mad };
})();
