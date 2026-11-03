const assert = require('node:assert/strict');
require('./public/pricing.js');
const input = { quantity:'500', purchaseEUR:'5.2', exchangeRate:'10.5',
  international:'1000', importCharges:'0', clearance:'0', local:'0', fixed:'0',
  personalization:'2', markupPercent:'30', vatPercent:'20', overrideHT:'' };
const r = CCPricing.calculate(input);
assert.equal(r.purchaseTotal, 2730000n);
assert.equal(r.costTotal, 2930000n);
assert.equal(r.unitHT, 7618n);
assert.equal(r.totalHT, 3809000n);
assert.equal(r.totalVAT, 761800n);
assert.equal(r.totalTTC, 4570800n);
assert.equal(CCPricing.calculate({...input,purchaseEUR:'5,2'}).totalTTC,r.totalTTC);
assert.throws(()=>CCPricing.calculate({...input, exchangeRate:''}));
assert.throws(()=>CCPricing.calculate({...input, quantity:'1.5'}));
assert.throws(()=>CCPricing.calculate({...input, international:'-1'}));
assert.equal(CCPricing.calculate({...input,overrideHT:'60'}).totalHT,3000000n);
assert.equal(CCPricing.calculate({...input,quantity:'3',purchaseEUR:'0.005',exchangeRate:'1',
 international:'0',personalization:'0',markupPercent:'0',vatPercent:'0'}).unitHT,1n);
console.log('11 contrôles de calcul et validation réussis');
