const ADMIN_CODE = 'yosugoadmin2026';

if (!localStorage.getItem('idiotsClearedOnce')) {
    localStorage.removeItem('idiots');
    localStorage.setItem('idiotsClearedOnce', 'true');
}

const defaultUsers = [
    {
        username: 'admin',
        password: 'YoungFinal070811$$',
        displayName: 'Young',
        pfp: 'https://i.pinimg.com/736x/71/d1/8e/71d18ec075e722c02d06c52ad769a333.jpg',
        bio: 'the man himself',
        isAdmin: true,
        joinDate: '2026-01-01T00:00:00.000Z',
        idiotsPosted: []
    }
];

if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

currentUser = null;
let selectedImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupNav();
    setupAuthTabs();
    setupUserMenu();
    setupImageInput();
});

function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        showLoggedInState();
    } else {
        showLoggedOutState();
    }
}

function openAdminLogin() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('authModal').style.display = 'flex';
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector('.auth-tab[data-tab="admin"]').classList.add('active');
    document.getElementById('admin').classList.add('active');
}

function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authModal').style.display = 'none';
}

function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const code = document.getElementById('adminCode').value.trim();
    
    if (!username || !password || !code) {
        alert('Please enter all fields from the txt file!');
        return;
    }
    
    if (code !== ADMIN_CODE) {
        alert('Invalid admin code!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password && u.isAdmin);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showLoggedInState();
        closeAuthModal();
    } else {
        alert('Invalid admin credentials! Check the txt file.');
    }
}

function showLoggedInState() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('adminBtn').classList.add('hidden');
    document.getElementById('userMenuBtn').classList.remove('hidden');
    const commentForm = document.querySelector('.add-comment-form');
    if (commentForm) commentForm.classList.remove('hidden');
    
    const userPfp = document.getElementById('userPfp');
    userPfp.src = currentUser.pfp || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">👤</text></svg>';
    
    document.getElementById('userDisplayName').classList.remove('admin-badge');
    
    if (currentUser.isAdmin) {
        document.getElementById('userDisplayName').classList.add('admin-badge');
        document.getElementById('userDisplayName').innerHTML = `<span class="animated-admin">${currentUser.displayName}</span>`;
    } else {
        document.getElementById('userDisplayName').textContent = currentUser.displayName;
    }
    
    loadIdiots();
    loadProfiles();
}

function showLoggedOutState() {
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('adminBtn').classList.remove('hidden');
    document.getElementById('userMenuBtn').classList.add('hidden');
    const commentForm = document.querySelector('.add-comment-form');
    if (commentForm) commentForm.classList.add('hidden');
    loadIdiots();
    loadProfiles();
}

function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
}

function setupUserMenu() {
    const btn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', function() {
        dropdown.classList.add('hidden');
    });
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        alert('Please fill in all fields!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showLoggedInState();
        closeAuthModal();
    } else {
        alert('Invalid username or password!');
    }
}

function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const displayName = document.getElementById('signupDisplayName').value.trim() || username;
    const pfp = document.getElementById('signupPfp').value.trim();
    
    if (!username || !password) {
        alert('Please fill in username and password!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === username)) {
        alert('Username already taken!');
        return;
    }
    
    const newUser = {
        username,
        password,
        displayName,
        pfp: pfp || '',
        bio: '',
        isAdmin: false,
        joinDate: new Date().toISOString(),
        idiotsPosted: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showLoggedInState();
    closeAuthModal();
    loadProfiles();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoggedOutState();
}

function setupNav() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            localStorage.setItem('activeSection', targetSection);
        });
    });
    
    const savedSection = localStorage.getItem('activeSection');
    if (savedSection) {
        const savedButton = document.querySelector(`[data-section="${savedSection}"]`);
        if (savedButton) {
            savedButton.click();
        }
    }
}

function setupImageInput() {
    const imageInput = document.getElementById('idiotImages');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

function showAddIdiotForm() {
    const form = document.getElementById('addIdiotForm');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        clearImagePreview();
    }
}

function handleImagePreview(e) {
    const files = Array.from(e.target.files);
    selectedImages = files;
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb';
            thumb.innerHTML = `
                <img src="${event.target.result}" alt="Preview ${index + 1}">
                <button class="remove-thumb" onclick="removeImage(${index})">&times;</button>
            `;
            previewContainer.appendChild(thumb);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    handleImagePreview({ target: { files: selectedImages } });
}

function clearImagePreview() {
    selectedImages = [];
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('idiotImages').value = '';
}

function addIdiot() {
    const nameInput = document.getElementById('idiotName');
    const reasonInput = document.getElementById('idiotReason');
    const list = document.getElementById('idiotList');
    const counter = document.querySelector('.idiots-counter .count');
    
    const name = nameInput.value.trim();
    const reason = reasonInput.value.trim();
    
    if (!name || !reason) {
        alert('Please fill in both name and reason fields!');
        return;
    }
    
    const imagePromises = selectedImages.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                resolve(event.target.result);
            };
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(imagePromises).then(images => {
        const idiotId = Date.now().toString();
        const postedBy = currentUser ? currentUser.username : 'Anonymous';
        
        const newIdiot = {
            id: idiotId,
            name,
            reason,
            images,
            postedBy,
            date: new Date().toISOString()
        };
        
        const savedIdiots = JSON.parse(localStorage.getItem('idiots') || '[]');
        savedIdiots.unshift(newIdiot);
        localStorage.setItem('idiots', JSON.stringify(savedIdiots));
        
        if (currentUser) {
            currentUser.idiotsPosted.push(idiotId);
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.username === currentUser.username);
            if (userIndex !== -1) {
                users[userIndex].idiotsPosted.push(idiotId);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
        
        addIdiotToList(newIdiot, list);
        
        nameInput.value = '';
        reasonInput.value = '';
        clearImagePreview();
        
        document.getElementById('addIdiotForm').classList.add('hidden');
        
        let currentCount = parseInt(counter.textContent) || 0;
        counter.textContent = currentCount + 1;
    });
}

function addIdiotToList(idiot, list) {
    const li = document.createElement('li');
    li.className = 'idiot-item';
    li.setAttribute('data-id', idiot.id);
    
    let deleteBtn = '';
    if (currentUser && currentUser.isAdmin) {
        deleteBtn = `<button class="delete-idiot-btn" onclick="deleteIdiot('${idiot.id}')">Delete</button>`;
    }
    
    let imagesHtml = '';
    if (idiot.images && idiot.images.length > 0) {
        imagesHtml = `<div class="idiot-images">`;
        idiot.images.forEach(img => {
            imagesHtml += `<img src="${img}" onclick="openImageModal('${img}')" alt="Proof">`;
        });
        imagesHtml += `</div>`;
    }
    
    li.innerHTML = `
        <h4>${escapeHtml(idiot.name)}</h4>
        <p>${escapeHtml(idiot.reason)}</p>
        <p class="idiot-meta">Posted by ${escapeHtml(idiot.postedBy)} on ${new Date(idiot.date).toLocaleDateString()}</p>
        ${imagesHtml}
        ${deleteBtn}
    `;
    
    list.appendChild(li);
}

function deleteIdiot(id) {
    if (!currentUser || !currentUser.isAdmin) {
        alert('You do not have permission to delete!');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this idiot?')) {
        return;
    }
    
    const savedIdiots = JSON.parse(localStorage.getItem('idiots') || '[]');
    const filteredIdiots = savedIdiots.filter(i => i.id !== id);
    localStorage.setItem('idiots', JSON.stringify(filteredIdiots));
    
    const item = document.querySelector(`.idiot-item[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
    
    const counter = document.querySelector('.idiots-counter .count');
    let currentCount = parseInt(counter.textContent) || 0;
    counter.textContent = Math.max(0, currentCount - 1);
}

function deleteAccount() {
    if (!currentUser || !currentUser.isAdmin) {
        alert('Only admins can delete accounts!');
        return;
    }
    
    const profileUsername = document.getElementById('profileUsername').textContent.replace('@', '');
    
    if (!confirm(`Are you sure you want to delete the account "${profileUsername}"? This cannot be undone!`)) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === profileUsername);
    
    if (userIndex !== -1) {
        const userToDelete = users[userIndex];
        
        if (userToDelete.isAdmin && currentUser.username !== profileUsername) {
            alert('You cannot delete another admin account!');
            return;
        }
        
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        
        let idiots = JSON.parse(localStorage.getItem('idiots') || '[]');
        idiots = idiots.filter(i => i.postedBy !== profileUsername);
        localStorage.setItem('idiots', JSON.stringify(idiots));
        
        let comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments = comments.filter(c => c.profileUsername !== profileUsername && c.commenter !== profileUsername);
        localStorage.setItem('comments', JSON.stringify(comments));
        
        alert(`Account "${profileUsername}" has been deleted!`);
        loadProfiles();
        
        document.querySelectorAll('.nav-btn')[1].click();
    }
}

let viewingProfileUsername = null;

function addComment() {
    if (!currentUser) {
        alert('You must be logged in to comment!');
        return;
    }
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        alert('Please write a comment!');
        return;
    }
    
    if (!viewingProfileUsername) {
        alert('No profile selected!');
        return;
    }
    
    const comment = {
        id: Date.now().toString(),
        profileUsername: viewingProfileUsername,
        commenter: currentUser.username,
        displayName: currentUser.displayName,
        pfp: currentUser.pfp,
        text: commentText,
        date: new Date().toISOString()
    };
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push(comment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    document.getElementById('commentText').value = '';
    loadComments(viewingProfileUsername);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadIdiots() {
    const stored = localStorage.getItem('idiots');
    if (!stored) {
        document.querySelector('.idiots-counter .count').textContent = '0';
        return;
    }
    
    const idiots = JSON.parse(stored);
    const list = document.getElementById('idiotList');
    const counter = document.querySelector('.idiots-counter .count');
    
    list.innerHTML = '';
    idiots.forEach(idiot => {
        addIdiotToList(idiot, list);
    });
    
    counter.textContent = idiots.length;
}

function loadProfiles() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const grid = document.getElementById('profilesGrid');
    grid.innerHTML = '';
    
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'profile-card-mini';
        card.onclick = () => viewProfile(user.username);
        
        const badge = user.isAdmin ? '<span class="profile-badge-mini">👑 Admin</span>' : '';
        
        card.innerHTML = `
            <div class="profile-card-mini-avatar">
                <img src="${user.pfp || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">👤</text></svg>'}" alt="${user.displayName}">
            </div>
            <h4>${escapeHtml(user.displayName)} ${badge}</h4>
            <p>@${escapeHtml(user.username)}</p>
            <p class="profile-bio-mini">${user.bio ? escapeHtml(user.bio.substring(0, 80)) : 'No bio yet'}</p>
            <span class="idiots-count-mini">${user.idiotsPosted.length} idiots</span>
        `;
        
        grid.appendChild(card);
    });
}

function viewProfile(username) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (!user) return;
    
    viewingProfileUsername = username;
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active'));
    
    const profileSection = document.getElementById('profile');
    profileSection.classList.add('active');
    
    document.getElementById('profileDisplayName').textContent = user.displayName;
    document.getElementById('profileUsername').textContent = '@' + user.username;
    document.getElementById('profilePfp').src = user.pfp || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">👤</text></svg>';
    
    const bioEl = document.getElementById('profileBio');
    if (user.bio) {
        bioEl.textContent = user.bio;
        bioEl.classList.remove('hidden');
    } else {
        bioEl.classList.add('hidden');
    }
    
    document.getElementById('profileIdiotsCount').textContent = user.idiotsPosted.length;
    document.getElementById('profileJoinDate').textContent = new Date(user.joinDate).toLocaleDateString();
    
    const badge = document.getElementById('profileBadge');
    if (user.isAdmin) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    
    const editBtn = document.querySelector('.edit-profile-btn');
    if (currentUser && currentUser.username === user.username) {
        editBtn.classList.remove('hidden');
    } else {
        editBtn.classList.add('hidden');
    }
    
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (currentUser && currentUser.isAdmin && currentUser.username !== user.username && !user.isAdmin) {
        deleteBtn.classList.remove('hidden');
    } else {
        deleteBtn.classList.add('hidden');
    }
    
    loadComments(username);
    document.getElementById('editProfileForm').classList.add('hidden');
    
    const list = document.getElementById('profileIdiotList');
    list.innerHTML = '';
    
    const savedIdiots = JSON.parse(localStorage.getItem('idiots') || '[]');
    const userIdiots = savedIdiots.filter(i => i.postedBy === user.username);
    
    userIdiots.forEach(idiot => {
        const li = document.createElement('li');
        li.className = 'idiot-item';
        li.setAttribute('data-id', idiot.id);
        
        let imagesHtml = '';
        if (idiot.images && idiot.images.length > 0) {
            imagesHtml = `<div class="idiot-images">`;
            idiot.images.forEach(img => {
                imagesHtml += `<img src="${img}" onclick="openImageModal('${img}')" alt="Proof">`;
            });
            imagesHtml += `</div>`;
        }
        
        li.innerHTML = `
            <h4>${escapeHtml(idiot.name)}</h4>
            <p>${escapeHtml(idiot.reason)}</p>
            <p class="idiot-meta">Posted by ${escapeHtml(idiot.postedBy)} on ${new Date(idiot.date).toLocaleDateString()}</p>
            ${imagesHtml}
        `;
        list.appendChild(li);
    });
}

function showProfile() {
    if (!currentUser) return;
    viewingProfileUsername = currentUser.username;
    viewProfile(currentUser.username);
}

function loadComments(profileUsername) {
    viewingProfileUsername = profileUsername;
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const profileComments = comments.filter(c => c.profileUsername === profileUsername);
    const container = document.getElementById('commentsList');
    container.innerHTML = '';
    
    profileComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="comment-header">
                <img src="${comment.pfp || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="30">👤</text></svg>'}" alt="${comment.displayName}">
                <span class="comment-author">${escapeHtml(comment.displayName)}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
        `;
        container.appendChild(div);
    });
    
    if (currentUser) {
        document.querySelector('.add-comment-form').classList.remove('hidden');
    } else {
        document.querySelector('.add-comment-form').classList.add('hidden');
    }
}

function showEditProfile() {
    if (!currentUser) return;
    
    document.getElementById('editDisplayName').value = currentUser.displayName;
    document.getElementById('editPfp').value = currentUser.pfp || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editProfileForm').classList.remove('hidden');
}

function saveProfile() {
    if (!currentUser) return;
    
    const displayName = document.getElementById('editDisplayName').value.trim();
    const pfp = document.getElementById('editPfp').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    
    if (!displayName) {
        alert('Display name cannot be empty!');
        return;
    }
    
    if (bio.length > 200) {
        alert('Bio must be 200 characters or less!');
        return;
    }
    
    currentUser.displayName = displayName;
    currentUser.pfp = pfp;
    currentUser.bio = bio;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('editProfileForm').classList.add('hidden');
    showProfile();
    loadProfiles();
    showLoggedInState();
}

function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modalImg.src = src;
    modal.classList.add('active');
}

function closeImageModal() {
    document.getElementById('imageModal').classList.remove('active');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

const style = document.createElement('style');
style.textContent = `
    .hidden { display: none !important; }
`;
document.head.appendChild(style);