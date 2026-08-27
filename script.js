const consentKey = 'verde-acao-cookie-consent';

const programContent = {
  'Plantio de mudas': 'Participe de mutirões de plantio e de momentos de preparo do solo. Cada encontro é uma oportunidade de aprender fazendo, em contato direto com o território.',
  'Educação ambiental': 'Colabore em oficinas, rodas de conversa e atividades criativas que aproximam crianças, jovens e comunidades de práticas mais sustentáveis.',
  'Mapeamento vivo': 'Ajude a observar caminhos, registrar necessidades e apoiar a leitura coletiva dos lugares onde a Verde Ação pode fazer diferença.',
  'Cuidados compartilhados': 'Acompanhe áreas preservadas, apoie ações de manutenção e ajude a garantir que cada gesto de cuidado tenha continuidade.'
};

function setupNavigation() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  toggle?.addEventListener('click', () => {
    const next = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(next));
    const toggleLabel = toggle.querySelector('.sr-only');
    if (toggleLabel) toggleLabel.textContent = next ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', next);
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    const toggleLabel = toggle?.querySelector('.sr-only');
    if (toggleLabel) toggleLabel.textContent = 'Abrir menu';
    menu.classList.remove('is-open');
  }));
}

function setupRevealsAndDepth() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.reveal').forEach((element) => {
    if (prefersReducedMotion) return element.classList.add('is-visible');
    new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .14 }).observe(element);
  });
  if (prefersReducedMotion) return;
  const depths = [...document.querySelectorAll('[data-depth]')];
  let frame = 0;
  const updateDepth = () => {
    const y = window.scrollY;
    depths.forEach((element) => element.style.transform = `translate3d(0, ${y * Number(element.dataset.depth)}px, 0)`);
    frame = 0;
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateDepth); }, { passive: true });
}

function setupProgramDialog() {
  const dialog = document.querySelector('[data-program-dialog]');
  const title = document.querySelector('[data-program-title]');
  const description = document.querySelector('[data-program-description]');
  const close = () => { dialog.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('[data-program]').forEach((button) => button.addEventListener('click', () => {
    const program = button.dataset.program;
    title.textContent = program;
    description.textContent = programContent[program];
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.dialog-close').focus();
  }));
  dialog?.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', close));
  dialog?.querySelector('[data-dialog-join]')?.addEventListener('click', close);
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !dialog.hidden) close(); });
}

function setupVolunteerForm() {
  const form = document.querySelector('[data-volunteer-form]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = form.querySelector('[data-form-error]');
    const success = form.querySelector('[data-form-success]');
    if (!form.checkValidity()) {
      error.textContent = 'Revise os campos obrigatórios e confirme a autorização de contato.';
      form.querySelector(':invalid')?.focus();
      return;
    }
    error.textContent = '';
    form.reset();
    success.hidden = false;
    success.focus();
  });
}

function setupPolicies() {
  const dialog = document.querySelector('[data-policy-dialog]');
  const title = document.querySelector('[data-policy-title]');
  const content = document.querySelector('[data-policy-content]');
  const copy = {
    privacy: { title: 'Política de privacidade', body: '<p>Usamos as informações enviadas neste formulário apenas para responder ao seu interesse em participar de ações da Verde Ação.</p><p>Não vendemos dados pessoais. Você pode solicitar esclarecimentos ou atualização das informações pelo e-mail de contato exibido no rodapé.</p>' },
    cookies: { title: 'Política de cookies', body: '<p>Cookies essenciais guardam sua preferência de consentimento para que o aviso não apareça a cada visita.</p><p>A medição anônima é opcional e só é considerada quando você autoriza essa preferência no painel de cookies.</p>' }
  };
  const close = () => { dialog.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('[data-policy]').forEach((button) => button.addEventListener('click', () => {
    const policy = copy[button.dataset.policy];
    title.textContent = policy.title;
    content.innerHTML = policy.body;
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.dialog-close').focus();
  }));
  dialog?.querySelectorAll('[data-close-policy]').forEach((button) => button.addEventListener('click', close));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !dialog.hidden) close(); });
}

function setupCookies() {
  const layer = document.querySelector('[data-cookie-layer]');
  const preferences = document.querySelector('[data-cookie-preferences]');
  const panel = layer.querySelector('.cookie-panel');
  const analytics = layer.querySelector('[data-analytics-toggle]');
  const save = (analyticsAllowed) => {
    localStorage.setItem(consentKey, JSON.stringify({ essential: true, analytics: analyticsAllowed, updatedAt: new Date().toISOString() }));
    layer.hidden = true;
    preferences.hidden = true;
    panel.hidden = false;
  };
  const stored = localStorage.getItem(consentKey);
  if (!stored) layer.hidden = false;
  document.querySelectorAll('[data-open-cookies]').forEach((button) => button.addEventListener('click', () => {
    try { analytics.checked = JSON.parse(localStorage.getItem(consentKey))?.analytics === true; } catch { analytics.checked = false; }
    layer.hidden = false;
    preferences.hidden = false;
    panel.hidden = true;
  }));
  layer.querySelector('[data-cookie-settings]')?.addEventListener('click', () => { preferences.hidden = false; panel.hidden = true; });
  layer.querySelector('[data-cookie-close]')?.addEventListener('click', () => { preferences.hidden = true; panel.hidden = false; });
  layer.querySelector('[data-cookie-accept]')?.addEventListener('click', () => save(true));
  layer.querySelector('[data-cookie-essential]')?.addEventListener('click', () => save(false));
  layer.querySelector('[data-cookie-save]')?.addEventListener('click', () => save(analytics.checked));
}

setupNavigation();
setupRevealsAndDepth();
setupProgramDialog();
setupVolunteerForm();
setupPolicies();
setupCookies();
