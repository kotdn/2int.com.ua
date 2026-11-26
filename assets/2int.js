/* 2int.com.ua: меню «Програми» (клік / наведення, Esc, клік поза меню), бургер на телефоні, форма «Написати нам», e-mail у підвалі. */
(function () {
  var hdr = document.querySelector('.i2-hdr');
  var dd = document.querySelector('.i2-dd');
  var ddBtn = dd ? dd.querySelector('.i2-dd-btn') : null;
  var burger = document.querySelector('.i2-burger');
  var hoverable = window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 720px)');

  function setDd(open) {
    if (!dd) return;
    dd.classList.toggle('open', open);
    ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function setNav(open) {
    if (!hdr || !burger) return;
    hdr.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  }

  if (ddBtn) {
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setDd(!dd.classList.contains('open'));
    });
    var t;
    dd.addEventListener('mouseenter', function () { if (hoverable && hoverable.matches) { clearTimeout(t); setDd(true); } });
    dd.addEventListener('mouseleave', function () { if (hoverable && hoverable.matches) { t = setTimeout(function () { setDd(false); }, 150); } });
  }
  if (burger) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      setNav(!hdr.classList.contains('nav-open'));
    });
  }
  document.addEventListener('click', function (e) {
    if (dd && !dd.contains(e.target)) setDd(false);
    if (hdr && !hdr.contains(e.target)) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (dd && dd.classList.contains('open')) { setDd(false); ddBtn.focus(); }
    else if (hdr && hdr.classList.contains('nav-open')) { setNav(false); burger.focus(); }
  });
  // підменю програми: якщо не вміщується — спершу щільніші відступи, далі останні пункти переходять у «Ще ▾»
  var sub = document.querySelector('.i2-sub');
  var more = document.querySelector('.i2-more');
  if (sub && more) {
    var subLinks = sub.querySelectorAll('a');
    var moreLinks = more.querySelectorAll('.i2-more-panel a');
    var moreBtn = more.querySelector('.i2-more-btn');
    var fits = function () { return sub.scrollWidth <= sub.clientWidth + 1; };
    var setMore = function (open) { more.classList.toggle('open', open); moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    var fit = function () {
      var k;
      sub.classList.remove('tight', 'small');
      more.hidden = true;
      for (k = 0; k < subLinks.length; k++) { subLinks[k].hidden = false; moreLinks[k].hidden = true; }
      if (!sub.offsetWidth || fits()) return;             // телефон (підменю приховане) або все вміщується
      sub.classList.add('tight');
      if (fits()) return;
      sub.classList.add('small');
      if (fits()) return;
      more.hidden = false;
      for (k = subLinks.length - 1; k >= 0 && !fits(); k--) { subLinks[k].hidden = true; moreLinks[k].hidden = false; }
    };
    moreBtn.addEventListener('click', function (e) { e.stopPropagation(); setMore(!more.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!more.contains(e.target)) setMore(false); });
    document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && more.classList.contains('open')) { setMore(false); moreBtn.focus(); } });
    for (var mi = 0; mi < moreLinks.length; mi++) moreLinks[mi].addEventListener('click', function () { setMore(false); });
    var ft;
    window.addEventListener('resize', function () { clearTimeout(ft); ft = setTimeout(fit, 80); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
  }

  // підсвітка поточного розділу в «капсулі»: під час прокрутки — розділ, що зараз на екрані; після кліку — одразу
  var secLinks = document.querySelectorAll('.i2-sub a[href^="#"], .i2-more-panel a[href^="#"]');
  if (secLinks.length && 'IntersectionObserver' in window) {
    var ids = [], seen = {};
    for (var si = 0; si < secLinks.length; si++) {
      var hid = secLinks[si].getAttribute('href').slice(1);
      if (hid && !seen[hid] && document.getElementById(hid)) { seen[hid] = 1; ids.push(hid); }
    }
    var setCurrent = function (id) {
      for (var q = 0; q < secLinks.length; q++) {
        var on = secLinks[q].getAttribute('href') === '#' + id;
        secLinks[q].classList.toggle('is-current', on);
        if (on) secLinks[q].setAttribute('aria-current', 'location'); else secLinks[q].removeAttribute('aria-current');
      }
    };
    var hold = 0;   // після кліку плавна прокрутка не перебиває вибраний пункт
    var visible = {};
    var pick = function () {
      if (Date.now() < hold) return;
      var cur = '';
      for (var v = 0; v < ids.length; v++) if (visible[ids[v]]) { cur = ids[v]; break; }
      setCurrent(cur);   // жоден розділ не перетинає лінію (перший екран) — нічого не підсвічено
    };
    // «на екрані» — розділ, що перетинає лінію читання на 30% висоти вікна (під липкою шапкою)
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) visible[entries[e].target.id] = entries[e].isIntersecting;
      pick();
    }, { rootMargin: '-30% 0px -69% 0px' });
    for (var w = 0; w < ids.length; w++) io.observe(document.getElementById(ids[w]));
    for (var c2 = 0; c2 < secLinks.length; c2++) secLinks[c2].addEventListener('click', function () {
      setCurrent(this.getAttribute('href').slice(1)); hold = Date.now() + 900;
    });
    if (location.hash && seen[location.hash.slice(1)]) setCurrent(location.hash.slice(1));
  }

  // перехід за посиланням або «Написати нам» у меню — меню закривається
  var links = document.querySelectorAll('.i2-hdr a, .i2-hdr [data-feedback]');
  for (var i = 0; i < links.length; i++) links[i].addEventListener('click', function () { setDd(false); setNav(false); });

  // e-mail збирається тут — у HTML повної адреси немає
  var em = ['denis', 'samoylenko', 'ds'].join('.') + '@' + ['gmail', 'com'].join('.');
  var ems = document.querySelectorAll('.i2 a.em');
  for (var j = 0; j < ems.length; j++) { ems[j].href = 'mailto:' + em; ems[j].textContent = em; }
})();

// скрин на весь екран по кліку (сторінки програм; закриття — хрестик, Esc, клік)
(function () {
  var imgs = document.querySelectorAll('.i2-shot img');
  if (!imgs.length) return;
  var lb = document.createElement('div');
  lb.className = 'i2 i2-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Скриншот');
  lb.innerHTML = '<button type="button" aria-label="Закрити">×</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  var big = lb.querySelector('img'), cap = lb.querySelector('p'), last = null;
  function close() { lb.classList.remove('open'); document.body.classList.remove('lb-on'); big.removeAttribute('src'); if (last) last.focus(); }
  function open(im) {
    last = im; big.src = im.currentSrc || im.src; big.alt = im.alt;
    var c = im.closest('figure').querySelector('figcaption'); cap.textContent = c ? c.textContent : '';
    lb.classList.add('open'); document.body.classList.add('lb-on'); lb.querySelector('button').focus();
  }
  for (var i = 0; i < imgs.length; i++) {
    (function (im) {
      im.setAttribute('tabindex', '0'); im.setAttribute('role', 'button');
      im.addEventListener('click', function () { open(im); });
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(im); } });
    })(imgs[i]);
  }
  lb.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && lb.classList.contains('open')) close(); });
})();

// форма «Написати нам»: вікно й відправка в /feedback.php (далі — у Telegram)
(function(){
  var d=document.getElementById('fb'); if(!d) return;
  var f=d.querySelector('form'), send=f.querySelector('[type=submit]'), msg=d.querySelector('.fb-msg');
  var el=function(id){ return document.getElementById(id); };
  var local=location.protocol==='file:', t0=0, timer=null, busy=false;
  function say(text, cls){ msg.className='fb-msg'+(cls?' '+cls:''); msg.textContent=text; }
  function fail(){
    msg.className='fb-msg err'; msg.textContent='Не вдалося надіслати. Напишіть у Telegram ';
    var a=document.createElement('a'); a.href='https://t.me/kot_dn'; a.textContent='@kot_dn'; msg.appendChild(a); msg.appendChild(document.createTextNode('.'));
  }
  function open(){
    if(typeof d.showModal!=='function'){ location.href='https://t.me/kot_dn'; return; }
    clearTimeout(timer); t0=Date.now(); busy=false;
    send.disabled=local; send.textContent='Надіслати';
    if(local) say('Форма працює лише на сайті 2int.com.ua.','err'); else say('');
    d.showModal(); document.body.classList.add('fb-on');
    el('fb-name').focus();
  }
  function close(){ if(d.open) d.close(); }
  d.addEventListener('close',function(){ clearTimeout(timer); document.body.classList.remove('fb-on'); });
  d.addEventListener('click',function(e){ if(e.target===d) close(); });
  f.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',close); });
  document.querySelectorAll('[data-feedback]').forEach(function(b){ b.addEventListener('click',open); });
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(local || busy) return;
    var m=el('fb-message'), c=el('fb-contact');
    if(!c.value.trim()){ say('Вкажіть контакт для відповіді: e-mail, телефон або Telegram.','err'); c.focus(); return; }
    if(!m.value.trim()){ say('Напишіть повідомлення.','err'); m.focus(); return; }
    busy=true; send.disabled=true; send.textContent='Надсилаю…'; say('');
    fetch('/feedback.php',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      name:el('fb-name').value, contact:el('fb-contact').value, message:m.value,
      page:location.pathname, website:el('fb-website').value, t:t0 })})
    .then(function(r){ return r.json().catch(function(){ return null; }).then(function(j){ if(!r.ok || !j || !j.ok){ var er=new Error(); er.msg=j&&j.error; throw er; } }); })
    .then(function(){ f.reset(); send.textContent='Надіслати'; say('Дякуємо! Повідомлення надіслано.','ok'); timer=setTimeout(close,2000); })
    .catch(function(er){ busy=false; send.disabled=false; send.textContent='Надіслати'; if(er&&er.msg) say(er.msg,'err'); else fail(); });   // причина від сервера (напр. «Вкажіть контакт…»)
  });
})();

// плаваючі кнопки: «Вгору» — після прокрутки на ~екран; обидві піднімаються над підвалом, коли він на екрані
(function () {
  var fabs = document.querySelector('.i2-fabs'), top = document.getElementById('i2-totop'), ftr = document.querySelector('.i2-ftr');
  if (!fabs || !top) return;
  var tick = false;
  function upd() {
    tick = false;
    top.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
    var lift = ftr ? Math.max(0, window.innerHeight - ftr.getBoundingClientRect().top) : 0;
    fabs.style.setProperty('--fab-lift', lift + 'px');
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(upd); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  top.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
  upd();
})();
