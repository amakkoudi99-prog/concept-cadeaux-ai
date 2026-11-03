let mockupDraft = null;
function renderMockup() {
  const workspace = document.querySelector('#workspace');
  if (!mockupDraft) {
    const intro = document.createElement('p');
    intro.textContent = 'Choisis une variante depuis l’Assistant pour commencer.';
    const link = document.createElement('a');
    link.href = '#assistant';
    link.textContent = 'Ouvrir l’Assistant';
    workspace.append(intro, link);
    return;
  }
  const product = mockupDraft;
  const card = document.createElement('article');
  const heading = document.createElement('h2');
  heading.textContent = [product.name,product.color,product.size].filter(Boolean).join(' · ');
  const notice = document.createElement('p');
  notice.textContent = 'Simulation visuelle · Confirme la couleur de la photo. Le logo conserve ses proportions. Le prix de vente est saisi en MAD.';
  const status = document.createElement('p');
  status.setAttribute('role','status');
  const canvas = document.createElement('canvas');
  canvas.width = 1000; canvas.height = 1000;
  canvas.style.width = '100%'; canvas.style.maxWidth = '650px';
  const ctx = canvas.getContext('2d');
  const controls = document.createElement('div');
  controls.className = 'studio-controls';
  function field(label, type, value) {
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const input = document.createElement('input');
    input.type = type;
    if (type !== 'file') input.value = value ?? '';
    wrapper.append(input);
    controls.append(wrapper);
    return input;
  }
  const photoFile = field('Photo de cette variante (PNG, JPEG ou WebP)', 'file');
  const logoFile = field('Logo client (PNG, JPEG ou WebP)', 'file');
  photoFile.accept = logoFile.accept = 'image/png,image/jpeg,image/webp';
  const confirmed = field('Je confirme que la photo correspond à cette couleur / taille', 'checkbox');
  const price = field('Prix de vente unitaire (MAD)', 'text');
  price.inputMode = 'decimal';
  const taxLabel = document.createElement('label');
  taxLabel.textContent = 'Présentation du prix';
  const tax = document.createElement('select');
  for (const value of ['HT','TTC']) {
    const option=document.createElement('option'); option.textContent=value; option.value=value; tax.append(option);
  }
  taxLabel.append(tax); controls.append(taxLabel);
  const x = field('Position horizontale du logo', 'range', '50');
  const y = field('Position verticale du logo', 'range', '45');
  const width = field('Largeur du logo', 'range', '18');
  for (const slider of [x,y,width]) { slider.min='0'; slider.max='100'; }
  width.min='1'; width.max='45';
  let photo = null, logo = null, photoVersion=0, logoVersion=0;
  function draw() {
    ctx.fillStyle='white'; ctx.fillRect(0,0,1000,1000);
    ctx.fillStyle='#24262b'; ctx.font='bold 30px sans-serif';
    ctx.fillText('CONCEPT CADEAUX',40,50);
    if (photo) {
      const scale=Math.min(880/photo.width,600/photo.height);
      ctx.drawImage(photo,(1000-photo.width*scale)/2,110+(600-photo.height*scale)/2,photo.width*scale,photo.height*scale);
    }
    if (logo) {
      const w=Number(width.value)*10;
      const h=w*logo.height/logo.width;
      ctx.drawImage(logo,Number(x.value)*10-w/2,Number(y.value)*7+80-h/2,w,h);
    }
    ctx.fillStyle='#24262b'; ctx.font='24px sans-serif';
    ctx.fillText(String(product.name ?? '').slice(0,55),40,760);
    ctx.font='19px sans-serif';
    ctx.fillText('Réf. '+product.reference+' · '+(product.color??'')+' · '+product.quantity+' pièces',40,800);
    const validPrice=/^\d{1,8}([.,]\d{1,2})?$/.test(price.value.trim());
    ctx.font='bold 30px sans-serif';
    ctx.fillStyle='#a92133';
    ctx.fillText(validPrice ? price.value.trim().replace('.',',')+' MAD '+tax.value+' / pièce' : 'Prix de vente à renseigner',40,855);
    ctx.fillStyle='#51555e'; ctx.font='18px sans-serif';
    ctx.fillText('Simulation visuelle · disponibilité et marquage à confirmer',40,925);
    download.disabled = !(photo && logo && confirmed.checked && validPrice);
  }
  async function loadPhoto(src, local = false) {
    const version=++photoVersion;
    confirmed.checked=false; photo=null; download.disabled=true;
    const image=new Image();
    if (!local) image.crossOrigin='anonymous';
    image.onload=()=> {
      if(version!==photoVersion)return;
      photo=image; status.textContent='Photo chargée. Vérifie sa correspondance avec la variante.'; draw();
    };
    image.onerror=()=> {
      if(version!==photoVersion)return;
      status.textContent='La photo fournisseur ne peut pas être utilisée automatiquement ici. Charge une photo de la variante pour poursuivre.';
      draw();
    };
    image.src=src;
  }
  function loadFile(input, isLogo) {
    const file=input.files[0];
    if(isLogo){++logoVersion;logo=null;} else {++photoVersion;photo=null;confirmed.checked=false;}
    draw();
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>10000000) {
      status.textContent='Choisis une image PNG, JPEG ou WebP de moins de 10 Mo.'; return;
    }
    const reader=new FileReader();
    if(isLogo) {
      const version=++logoVersion; logo=null; draw();
      reader.onload=()=>{
        const image=new Image();
        image.onload=()=>{ if(version===logoVersion){logo=image;draw();} };
        image.onerror=()=>{status.textContent='Logo illisible.';};
        image.src=reader.result;
      };
    } else {
      const version=++photoVersion; photo=null; confirmed.checked=false; draw();
      reader.onload=()=>{if(version===photoVersion)loadPhoto(reader.result,true);};
    }
    reader.onerror=()=>{status.textContent='Lecture de l’image impossible.';};
    reader.readAsDataURL(file);
  }
  photoFile.onchange=()=>loadFile(photoFile,false);
  logoFile.onchange=()=>loadFile(logoFile,true);
  for(const input of [confirmed,price,tax,x,y,width]) input.addEventListener('input',draw);
  const download=document.createElement('button');
  download.textContent='Télécharger la maquette PNG';
  download.disabled=true;
  download.onclick=()=>{
    try {
      const link=document.createElement('a');
      link.download='Concept-Cadeaux-'+String(product.reference).replace(/[^a-zA-Z0-9_-]/g,'_')+'.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
    } catch {
      status.textContent='L’export nécessite une photo chargée depuis ton appareil. Sélectionne le fichier image ci-dessus.';
    }
  };
  const link=document.createElement('a');
  if(product.photo) { link.href=product.photo;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ouvrir la photo fournisseur'; }
  card.append(heading,notice,link,controls,status,canvas,download);
  workspace.append(card);
  draw();
  const embedded = typeof makitoPhotos !== 'undefined' ? makitoPhotos[product.model] : null;
  if(embedded) loadPhoto(embedded,true);
  else if(product.photo) loadPhoto(product.photo);
}
