document.addEventListener('DOMContentLoaded', () => {
    console.log('Elite Resells - Website Loaded');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const targetSelector = anchor.getAttribute('href');
            const target = targetSelector ? document.querySelector(targetSelector) : null;

            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const modalCards = Array.from(document.querySelectorAll('.card')).filter(card => !card.closest('.card-link'));
    let modal = null;

    if (modalCards.length) {
        if (!document.getElementById('productModal')) {
            const modalHtml = `
                <div id="productModal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2 id="modalTitle">Product Details</h2>
                        <div id="modalTags" style="margin-top: 12px;"></div>
                        <p id="modalDescription" style="margin-top: 18px; color: var(--text-muted);"></p>
                        <div id="modalPrice" style="margin-top: 22px; font-size: 1.4rem; color: var(--accent-primary-strong); font-weight: 800;"></div>
                        <button class="btn btn-primary product-cta" style="margin-top: 22px;">Contact to Buy</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        modal = document.getElementById('productModal');
        const closeBtn = document.querySelector('.close-modal');

        modalCards.forEach(card => {
            card.addEventListener('click', event => {
                if (event.target.closest('.btn')) return;

                const title = card.querySelector('h3')?.innerText || 'Product Details';
                const description = card.dataset.description || card.querySelector('p')?.innerText || '';
                const price = card.querySelector('.price')?.innerText || '';
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
                    tagsContainer.appendChild(span);
                });

                modal.style.display = 'block';
            });
        });

        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        window.addEventListener('click', event => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.option-selector').forEach(selector => {
        const priceDisplay = selector.closest('.purchase-box')?.querySelector('.display-price, #displayPrice');
        const buttons = selector.querySelectorAll('.option-btn');

        if (!priceDisplay || !buttons.length) return;

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(otherButton => otherButton.classList.remove('active'));
                button.classList.add('active');
                priceDisplay.innerText = '$' + button.dataset.price;
            });
        });
    });
});
