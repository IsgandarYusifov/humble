import {renderPage} from './pages.mjs';

const horizonHome = `<main id="main">
<section class="horizon-card" aria-labelledby="horizon-title">
<div class="horizon-static" aria-hidden="true"></div><canvas id="horizon-scene" aria-hidden="true"></canvas>
<div class="horizon-copy"><h1 id="horizon-title"><span>The home of all ideas.</span><span>Bring yours to market. Let the</span><span>world witness it.</span></h1><a class="horizon-apply" data-apply href="/apply/">Apply <span class="ui-arrow" aria-hidden="true"></span></a></div>
</section>
<section class="horizon-ideas" id="showcase" aria-labelledby="field-title">
<div class="horizon-section-head"><h2 id="field-title">For the culture.<br>And its creators.</h2><p>Memecoin narratives, internet worlds, and ideas<br> with someone behind the beginning.</p></div>
<div class="horizon-story-grid">
<article class="horizon-story story-culture"><h3>Memes.<br>With a maker.</h3><div class="origin-brand-scene" aria-hidden="true"><img class="brand-fallback" src="/assets/origin-mark.svg" width="512" height="512" alt=""><canvas id="origin-brand-canvas"></canvas></div><a class="story-link" data-apply href="/apply/?category=culture">Bring the lore <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></article>
<article class="horizon-story story-origin"><h3>Keep the original<br>in view.</h3><div class="origin-publication" aria-hidden="true"><div class="publication-back"></div><div class="publication-sheet"><div class="publication-top"><img src="/assets/origin-mark.svg" width="25" height="25" alt=""><span>humble</span></div><p>The idea.<br>The creator.<br>The origin.</p><span class="publication-rule"></span><span class="publication-caption">One place to find the original.</span></div></div><a class="story-link" href="/origin/">Understand origin <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></article>
<article class="horizon-story story-application"><h3>Bring your idea<br>to Humble.</h3><div class="application-art" aria-hidden="true"><div class="application-art-top">Apply to Humble.<img src="/assets/origin-mark.svg" width="25" height="25" alt=""></div><div class="application-art-field"><span>Idea name</span><span>Name your idea</span></div><div class="application-art-field"><span>Category</span><span>Culture / Meme lore</span></div><div class="application-art-field"><span>The people behind it</span><span>Creator or team</span></div></div><a class="story-link" data-apply href="/apply/">Apply to the first wave <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></article>
</div>
<div class="horizon-category-row" id="idea-field"><p>What are you bringing?</p><div class="horizon-category-pills signal-table" role="group" aria-label="Explore types of ideas"><button data-signal="culture" aria-pressed="true">Culture + meme lore</button><button data-signal="art" aria-pressed="false">Art + internet IP</button><button data-signal="agent" aria-pressed="false">AI + agents</button><button data-signal="product" aria-pressed="false">Code + products</button></div></div>
<div class="horizon-category-detail signal-output" data-signal="culture"><div class="signal-description" aria-live="polite"><span id="signal-label">CULTURE / 01</span><h3 id="signal-title">Lore worth believing in.</h3><p id="signal-description">Memes, communities, and internet worlds with an identifiable creator behind the first spark.</p></div><a class="signal-apply" data-apply href="/apply/?category=culture">Bring this kind of idea <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></div>
</section>
<section class="horizon-registry" aria-labelledby="cohort-title"><div class="horizon-cohort"><div><p class="horizon-kicker">The first Humble cohort</p><h2 id="cohort-title">The first wave.<br>Originals only.</h2></div><div class="horizon-cohort-copy"><p>Great lore starts with someone. We're personally bringing together the creators behind Humble's first wave.</p><p>Bring the meme, the world, or the product. Tell us what makes it yours.</p><a class="horizon-apply" data-apply href="/apply/">Apply <span class="ui-arrow" aria-hidden="true"></span></a><span class="cohort-status">Pre-launch. Reviewed projects will appear here when the first cohort is ready.</span></div></div></section>
<section class="horizon-origin" id="manifesto" aria-labelledby="manifesto-title"><h2 id="manifesto-title">Follow the idea<br>back to its maker.</h2><div><p>A narrative spreads. Copies follow. The beginning should stay easy to find.</p><p>Humble is being built to connect an original idea to the people behind it, its public history, and its canonical mint when one exists.</p><a class="text-link" href="/origin/">Read the approach <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></div></section>
<section class="horizon-faq" aria-labelledby="home-questions"><div><h2 id="home-questions">Before the<br>first wave.</h2><a class="text-link" href="/creators/">For creators <span class="ui-arrow ui-arrow--ne" aria-hidden="true"></span></a></div><div class="questions"><details><summary>What belongs on Humble?</summary><p>Culture, high-effort meme lore, art, internet IP, AI agents, technical products, and ideas that cross categories. An identifiable creator or team should stand behind the concept.</p></details><details><summary>Is Humble live?</summary><p>Humble is pre-launch. The first cohort is being prepared; no live launches are listed. You can introduce your idea through Apply.</p></details><details><summary>What does origin mean here?</summary><p>The purpose is to connect an idea to its creator, its public history, and its canonical address when one exists. <a href="/origin/">Read the approach and its limits.</a></p></details><details><summary>Can I apply before I have a mint?</summary><p>Yes. The address field is optional. Start with your idea, the people behind it, and any origin links you can share.</p></details></div></section>
<section class="horizon-invitation" aria-labelledby="invitation-title"><h2 id="invitation-title">It could begin with you.</h2><p>Bring your world to Humble.<br>The first conversation stays private.</p><a class="horizon-apply" data-apply href="/apply/">Apply <span class="ui-arrow" aria-hidden="true"></span></a></section>
</main>`;

export function withVersionLinks(html, route='/', horizon=false){
 const original = route==='404' ? '/404.html' : route==='/' ? '/' : `/${route}/`;
 const alternate = route==='404' ? '/v2/404.html' : route==='/' ? '/v2/' : `/v2/${route}/`;
 const switcher=`<nav class="version-switcher" aria-label="Design version"><span>Design</span><a href="${original}"${horizon?'':' aria-current="page"'}>Current</a><a href="${alternate}"${horizon?' aria-current="page"':''}>Horizon</a></nav>`;
 return html.replace('<div class="footer-top">',switcher+'<div class="footer-top">');
}

export function renderHorizon(home, page=null){
 let html=page ? renderPage(home,page) : home.replace(/<main id="main">[\s\S]*?<\/main>/,horizonHome);

 if(!page)html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="The home of all ideas. Original memecoin lore, internet worlds, and the creators behind them. Humble is preparing its first cohort on Solana.">');
 html=html.replace(/<body([^>]*)>/,'<body class="horizon-theme"$1>');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/horizon.css"></head>');
 html=html.replace('<meta name="theme-color" content="#15151a">','<meta name="theme-color" content="#F5F5F8">');
 html=html.replace('<script type="module" src="/assets/rupture-scene.js"></script>','<script src="/assets/horizon-scene.js" defer></script><script type="module" src="/assets/horizon-brand.js"></script>');
 html=html.replace(/href="\/(?!assets\/)([^\"]*)"/g,(_,value)=>`href="/v2/${value}"`);
 return withVersionLinks(html,page?.route||'/',true);
}