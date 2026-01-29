export function confirmModal(message, primaryText = 'OK', secondaryText = 'Cancel') {
  return new Promise((resolve) => {
    // create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const box = document.createElement('div');
    box.style.background = 'white';
    box.style.borderRadius = '8px';
    box.style.padding = '18px';
    box.style.maxWidth = '420px';
    box.style.width = '90%';
    box.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)';

    const msg = document.createElement('div');
    msg.style.marginBottom = '12px';
    msg.style.color = '#222';
    msg.textContent = message;

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.justifyContent = 'flex-end';
    btns.style.gap = '8px';

    const secondary = document.createElement('button');
    secondary.textContent = secondaryText;
    secondary.className = 'btn btn-light';
    secondary.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });

    const primary = document.createElement('button');
    primary.textContent = primaryText;
    primary.className = 'btn btn-primary';
    primary.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    btns.appendChild(secondary);
    btns.appendChild(primary);
    box.appendChild(msg);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    // focus primary for accessibility
    primary.focus();
  });
}
