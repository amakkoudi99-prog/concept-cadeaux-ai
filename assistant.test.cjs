const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('public/assistant.js','utf8'));
const products=[
 {reference:'A-BL',model:'A',category:'Bidon',name:'A',color:'BLEU',material:'Acier Inox'},
 {reference:'A-R',model:'A',category:'Bidon',name:'A',color:'ROUGE',material:'Acier Inox'},
 {reference:'B-BL',model:'B',category:'Bidon',name:'B',color:'BLEU',material:'Aluminium'},
 {reference:'5071AZULS/T',model:'5071',category:'Clé USB',name:'Rebik',color:'BLEU'}
];
assert.deepEqual(CCAssistant.analyze('500 gourdes bleues, 150 tote bags et 300 stylos').map(x=>x.quantity),[500,150,300]);
assert.equal(CCAssistant.analyze('des gourdes bleues')[0].quantity,null);
assert.deepEqual(CCAssistant.search(products,'500 gourdes bleues inox').map(p=>p.reference),['A-BL']);
assert.equal(CCAssistant.search(products,'5071')[0].name,'Rebik');
assert.equal(CCAssistant.search(products,'ref 5071 bleu')[0].name,'Rebik');
assert.equal(CCAssistant.search(products,'produit inexistant').length,0);
assert.equal(CCAssistant.search(products,'').length,0);
assert.equal(CCAssistant.search(products,'500 blue bottles').length,2);
console.log('8 contrôles recherche/extraction réussis');
