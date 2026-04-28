document.addEventListener('DOMContentLoaded', () => {
    console.log('Elite Resells - Website Loaded');
    
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Create Modal Element if it doesn't exist
    if (!document.getElementById('productModal')) {
        const modalHtml = `
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2 id="modalTitle">Product Details</h2>
                    <div id="modalTags" style="margin-top: 10px;"></div>
                    <p id="modalDescription" style="margin-top: 20px; color: var(--text-muted);"></p>
                    <div id="modalPrice" style="margin-top: 20px; font-size: 1.5rem; color: var(--accent-secondary); font-weight: bold;"></div>
                    <button class="btn btn-primary" style="margin-top: 20px; width: 100%;">Contact to Buy</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');

    // Hover and Click effect for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
            card.style.cursor = 'pointer';
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });

        card.addEventListener('click', (e) => {
            // Don't open modal if clicking the Buy button specifically (though it's inside the card)
            if (e.target.classList.contains('btn')) return;

            const title = card.querySelector('h3').innerText;
            const description = card.dataset.description || card.querySelector('p').innerText;
            const price = card.querySelector('.price').innerText;
            const tags = card.querySelectorAll('.product-tag');

            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDescription').innerText = description;
            document.getElementById('modalPrice').innerText = price;
            
            const tagsContainer = document.getElementById('modalTags');
            tagsContainer.innerHTML = '';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = tag.className;
                span.innerText = tag.innerText;
                span.style.marginRight = '5px';
                tagsContainer.appendChild(span);
            });

            modal.style.display = 'block';
        });
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    }
});
