document.addEventListener('DOMContentLoaded', () => {
  const projectItems = document.querySelectorAll('.proj-item');
  const modalEl = document.getElementById('projectModal');
  
  if (!modalEl) return;
  
  const modal = new bootstrap.Modal(modalEl);
  
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalLocationText = document.getElementById('modalLocationText');
  const modalDesc = document.getElementById('modalDesc');
  const modalScope = document.getElementById('modalScope');
  const modalScopeTitle = document.getElementById('modalScopeTitle');
  const modalScopeTags = document.getElementById('modalScopeTags');

  projectItems.forEach(item => {
    item.addEventListener('click', () => {
      // Get image URL from background-image style property
      const imgDiv = item.querySelector('.proj-img');
      const bgImage = window.getComputedStyle(imgDiv).backgroundImage;
      const url = bgImage.slice(4, -1).replace(/"/g, "");
      modalImage.src = url;

      // Get text content
      const title = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
      const tag = item.querySelector('.proj-tag') ? item.querySelector('.proj-tag').textContent : '';
      
      let locationContent = item.querySelector('.proj-location') ? item.querySelector('.proj-location').textContent : '';
      // Strip map pin emojis if present, as the modal uses a Bootstrap icon instead
      // Handling both direct string characters and surrogate pairs for emojis
      locationContent = locationContent.replace(/[\u{1F4CD}\u{1F4CC}\u{1F30D}\u{1F30E}\u{1F30F}\u{1F5FA}]/gu, '').trim();
      
      const desc = item.querySelector('.proj-desc') ? item.querySelector('.proj-desc').textContent : '';

      // Populate modal elements
      modalTitle.textContent = title;
      
      if (tag) {
        modalTag.textContent = tag;
        modalTag.style.display = 'inline-flex';
      } else {
        modalTag.style.display = 'none';
      }
      
      modalLocationText.textContent = locationContent;
      modalDesc.textContent = desc;

      // Get scope tags (if any exist)
      const scopeDiv = item.querySelector('.proj-scope');
      
      if (scopeDiv) {
        modalScope.style.display = 'block';
        const scopeTitleText = scopeDiv.querySelector('span:not(.scope-tags span)') ? scopeDiv.querySelector('span:not(.scope-tags span)').textContent : 'Scope';
        modalScopeTitle.textContent = scopeTitleText;
        
        const tagsContainer = scopeDiv.querySelector('.scope-tags');
        modalScopeTags.innerHTML = tagsContainer ? tagsContainer.innerHTML : '';
      } else {
        modalScope.style.display = 'none';
        modalScopeTags.innerHTML = '';
      }

      // Show the modal
      modal.show();
    });
  });
});
