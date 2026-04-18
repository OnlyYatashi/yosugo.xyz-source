const ADMIN_CODE = 'yosugoadmin2026';
const API_BASE = '';

currentUser = null;
let selectedImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupNav();
    setupAuthTabs();
    setupUserMenu();
    setupImageInput();
});

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'API error');
        }
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

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

async function adminLogin() {
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
    
    try {
        const user = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (user.isAdmin) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showLoggedInState();
            closeAuthModal();
        } else {
            alert('Invalid admin credentials! Check the txt file.');
        }
    } catch (error) {
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

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        alert('Please fill in all fields!');
        return;
    }
    
    try {
        const user = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showLoggedInState();
        closeAuthModal();
    } catch (error) {
        alert('Invalid username or password!');
    }
}

async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const displayName = document.getElementById('signupDisplayName').value.trim() || username;
    const pfp = document.getElementById('signupPfp').value.trim();
    
    if (!username || !password) {
        alert('Please fill in username and password!');
        return;
    }
    
    try {
        const newUser = await apiCall('/api/signup', {
            method: 'POST',
            body: JSON.stringify({ username, password, displayName, pfp })
        });
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        showLoggedInState();
        closeAuthModal();
        loadProfiles();
    } catch (error) {
        alert(error.message || 'Username already taken!');
    }
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

async function addIdiot() {
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
    
    const images = await Promise.all(imagePromises);
    const postedBy = currentUser ? currentUser.username : 'Anonymous';
    
    try {
        const newIdiot = await apiCall('/api/idiots', {
            method: 'POST',
            body: JSON.stringify({ name, reason, images, postedBy })
        });
        
        if (currentUser) {
            const users = await apiCall('/api/users');
            const userIndex = users.findIndex(u => u.username === currentUser.username);
            if (userIndex !== -1) {
                users[userIndex].idiotsPosted.push(newIdiot.id);
                currentUser.idiotsPosted.push(newIdiot.id);
                await apiCall(`/api/users/${currentUser.username}`, {
                    method: 'PUT',
                    body: JSON.stringify({ idiotsPosted: currentUser.idiotsPosted })
                });
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
    } catch (error) {
        alert('Failed to add idiot');
    }
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

async function deleteIdiot(id) {
    if (!currentUser || !currentUser.isAdmin) {
        alert('You do not have permission to delete!');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this idiot?')) {
        return;
    }
    
    try {
        await apiCall(`/api/idiots/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ adminCode: ADMIN_CODE })
        });
        
        const item = document.querySelector(`.idiot-item[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
        
        const counter = document.querySelector('.idiots-counter .count');
        let currentCount = parseInt(counter.textContent) || 0;
        counter.textContent = Math.max(0, currentCount - 1);
    } catch (error) {
        alert('Failed to delete idiot');
    }
}

async function deleteAccount() {
    if (!currentUser || !currentUser.isAdmin) {
        alert('Only admins can delete accounts!');
        return;
    }
    
    const profileUsername = document.getElementById('profileUsername').textContent.replace('@', '');
    
    if (!confirm(`Are you sure you want to delete the account "${profileUsername}"? This cannot be undone!`)) {
        return;
    }
    
    try {
        const users = await apiCall('/api/users');
        const userToDelete = users.find(u => u.username === profileUsername);
        
        if (!userToDelete) {
            alert('User not found!');
            return;
        }
        
        if (userToDelete.isAdmin && currentUser.username !== profileUsername) {
            alert('You cannot delete another admin account!');
            return;
        }
        
        alert(`Account "${profileUsername}" has been deleted!`);
        loadProfiles();
        
        document.querySelectorAll('.nav-btn')[1].click();
    } catch (error) {
        alert('Failed to delete account');
    }
}

let viewingProfileUsername = null;

async function addComment() {
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
    
    try {
        await apiCall('/api/comments', {
            method: 'POST',
            body: JSON.stringify({
                profileUsername: viewingProfileUsername,
                commenter: currentUser.username,
                displayName: currentUser.displayName,
                pfp: currentUser.pfp,
                text: commentText
            })
        });
        
        document.getElementById('commentText').value = '';
        loadComments(viewingProfileUsername);
    } catch (error) {
        alert('Failed to add comment');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadIdiots() {
    try {
        const idiots = await apiCall('/api/idiots');
        const list = document.getElementById('idiotList');
        const counter = document.querySelector('.idiots-counter .count');
        
        list.innerHTML = '';
        idiots.forEach(idiot => {
            addIdiotToList(idiot, list);
        });
        
        counter.textContent = idiots.length;
    } catch (error) {
        document.querySelector('.idiots-counter .count').textContent = '0';
    }
}

async function loadProfiles() {
    try {
        const users = await apiCall('/api/users');
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
    } catch (error) {
        console.error('Failed to load profiles:', error);
    }
}

async function viewProfile(username) {
    try {
        const user = await apiCall(`/api/users/${username}`);
        
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
        
        const idiots = await apiCall('/api/idiots');
        const userIdiots = idiots.filter(i => i.postedBy === user.username);
        
        const list = document.getElementById('profileIdiotList');
        list.innerHTML = '';
        
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
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

function showProfile() {
    if (!currentUser) return;
    viewingProfileUsername = currentUser.username;
    viewProfile(currentUser.username);
}

async function loadComments(profileUsername) {
    viewingProfileUsername = profileUsername;
    try {
        const comments = await apiCall(`/api/comments/${profileUsername}`);
        const container = document.getElementById('commentsList');
        container.innerHTML = '';
        
        comments.forEach(comment => {
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
    } catch (error) {
        console.error('Failed to load comments:', error);
    }
}

function showEditProfile() {
    if (!currentUser) return;
    
    document.getElementById('editDisplayName').value = currentUser.displayName;
    document.getElementById('editPfp').value = currentUser.pfp || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editProfileForm').classList.remove('hidden');
}

async function saveProfile() {
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
    
    try {
        const updatedUser = await apiCall(`/api/users/${currentUser.username}`, {
            method: 'PUT',
            body: JSON.stringify({ displayName, pfp, bio })
        });
        
        currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        document.getElementById('editProfileForm').classList.add('hidden');
        showProfile();
        loadProfiles();
        showLoggedInState();
    } catch (error) {
        alert('Failed to save profile');
    }
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