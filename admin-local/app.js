// ==================== Configuration ==================== //
let config = {
    token: localStorage.getItem('github_token') || '',
    owner: localStorage.getItem('github_owner') || '',
    repo: localStorage.getItem('github_repo') || '',
    galleryPath: localStorage.getItem('gallery_path') || 'assets/gallery_metadata.json',
    imgFolder: localStorage.getItem('img_folder') || 'assets/gallery'
};

let currentGallery = [];
let currentFilter = 'all';
let selectedFile = null;
let editingIndex = null;
let deletingIndex = null;
let dataFormat = 'array'; // 'array' or 'object' depending on gallery_metadata.json

// ==================== DOM Elements ==================== //
const dragDropArea = document.getElementById('dragDropArea');
const fileInput = document.getElementById('fileInput');
const previewBox = document.getElementById('previewBox');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const titleInput = document.getElementById('title');
const categorySelect = document.getElementById('category');
const uploadBtn = document.getElementById('uploadBtn');
const clearPreviewBtn = document.getElementById('clearPreview');
const galleryList = document.getElementById('galleryList');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const syncBtn = document.getElementById('syncBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSetting = document.getElementById('saveSetting');
const toast = document.getElementById('toast');
const loadingOverlay = document.getElementById('loadingOverlay');
const totalImagesEl = document.getElementById('totalImages');
const progressBox = document.getElementById('progressBox');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeEdit = document.getElementById('closeEdit');
const cancelEdit = document.getElementById('cancelEdit');
const saveEdit = document.getElementById('saveEdit');
const closeDelete = document.getElementById('closeDelete');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const editTitle = document.getElementById('editTitle');
const editCategory = document.getElementById('editCategory');
const editPreviewImage = document.getElementById('editPreviewImage');
const deleteItemName = document.getElementById('deleteItemName');

// ==================== Utility Functions ==================== //

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

/**
 * Show loading overlay
 */
function showLoading(text = 'Memproses...') {
    loadingOverlay.classList.remove('hidden');
    document.getElementById('loadingText').textContent = text;
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file
 */
function validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        showToast('Format gambar hanya JPG, PNG, atau WEBP', 'error');
        return false;
    }

    if (file.size > maxSize) {
        showToast('Ukuran gambar tidak boleh lebih dari 5 MB', 'error');
        return false;
    }

    return true;
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(title, extension) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const count = String(currentGallery.length + 1).padStart(3, '0');
    return `${cleanTitle}-${timestamp}-${count}.${extension}`;
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

/**
 * Normalize GitHub content path by removing leading slashes or parent directory segments.
 */
function normalizeGitHubPath(path) {
    if (!path) return path;
    return path.toString().trim().replace(/^(\.\.\/|\/+)+/, '');
}

/**
 * GitHub API helper
 */
async function githubAPI(method, path, data = null) {
    if (!config.token || !config.owner || !config.repo) {
        showToast('Pengaturan GitHub belum dikonfigurasi', 'error');
        throw new Error('GitHub config missing');
    }

    const normalizedPath = normalizeGitHubPath(path);
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${normalizedPath}`;
    const options = {
        method: method,
        headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+raw',
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch {
        return await response.text();
    }
}

/**
 * Get SHA of existing file
 */
async function getFileSHA(path) {
    try {
        const normalizedPath = normalizeGitHubPath(path);
        const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${normalizedPath}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('getFileSHA error:', error);
        return null;
    }
}

/**
 * Upload file to GitHub
 */
async function uploadFileToGithub(file, filename) {
    const filePath = `${config.imgFolder}/${filename}`;
    const base64Content = await fileToBase64(file);
    const sha = await getFileSHA(filePath);
    console.debug('uploadFileToGithub', { filePath, normalizedPath: normalizeGitHubPath(filePath), sha });

    const data = {
        message: `Add image: ${filename}`,
        content: base64Content
    };

    if (sha) {
        data.sha = sha;
    }

    return await githubAPI('PUT', filePath, data);
}

/**
 * Load gallery data from GitHub
 */
async function loadGalleryData() {
    try {
        showLoading('Memuat data gallery...');
        const response = await githubAPI('GET', config.galleryPath);
        const content = typeof response === 'string' ? response : JSON.stringify(response);
        const parsed = JSON.parse(content);

        // Support two formats: array of items, or object mapping filename -> {category, alt}
        if (Array.isArray(parsed)) {
            dataFormat = 'array';
            currentGallery = parsed;
        } else if (parsed && typeof parsed === 'object') {
            dataFormat = 'object';
            // Convert object mapping to array of {img, title, tag}
            currentGallery = Object.keys(parsed).map(key => {
                const val = parsed[key] || {};
                const title = val.alt || key;
                const tag = val.category || '';
                // prefer config.imgFolder if filename has no path
                const imgPath = key.includes('/') ? key : `${config.imgFolder}/${key}`;
                return { img: imgPath, title, tag };
            });
        } else {
            dataFormat = 'array';
            currentGallery = [];
        }
        updateGalleryDisplay();
        showToast('Data gallery berhasil dimuat', 'success');
    } catch (error) {
        console.error('Error loading gallery:', error);
        showToast('Gagal memuat data gallery', 'error');
        currentGallery = [];
    } finally {
        hideLoading();
    }
}

/**
 * Save gallery data to GitHub
 */
async function saveGalleryData() {
    try {
        const sha = await getFileSHA(config.galleryPath);
        console.debug('saveGalleryData', { galleryPath: config.galleryPath, normalizedPath: normalizeGitHubPath(config.galleryPath), sha });
        let payloadContent = null;

        if (dataFormat === 'object') {
            // convert back to object mapping filename -> {category, alt}
            const obj = {};
            currentGallery.forEach(item => {
                const filename = item.img.split('/').pop();
                obj[filename] = {
                    category: item.tag || '',
                    alt: item.title || ''
                };
            });
            payloadContent = JSON.stringify(obj, null, 2);
        } else {
            payloadContent = JSON.stringify(currentGallery, null, 2);
        }

        const data = {
            message: `Update gallery - ${new Date().toLocaleString('id-ID')}`,
            content: btoa(payloadContent)
        };

        if (sha) data.sha = sha;

        await githubAPI('PUT', config.galleryPath, data);
        return true;
    } catch (error) {
        console.error('Error saving gallery:', error);
        throw error;
    }
}

/**
 * Update gallery display
 */
function updateGalleryDisplay() {
    totalImagesEl.textContent = currentGallery.length;

    let filteredGallery = currentGallery;

    // Apply filter
    if (currentFilter !== 'all') {
        filteredGallery = filteredGallery.filter(item => item.tag === currentFilter);
    }

    // Apply search
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredGallery = filteredGallery.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.tag.toLowerCase().includes(searchTerm)
        );
    }

    // Render
    if (filteredGallery.length === 0) {
        galleryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>Belum ada gambar di gallery</p>
            </div>
        `;
        return;
    }

    galleryList.innerHTML = filteredGallery.map((item, index) => {
        const originalIndex = currentGallery.indexOf(item);
        return `
            <div class="gallery-item">
                <img src="${displayPath(item.img)}" alt="${item.title}" class="gallery-item-image">
                <div class="gallery-item-content">
                    <p class="gallery-item-title">${escapeHtml(item.title)}</p>
                    <span class="gallery-item-tag">${item.tag}</span>
                    <div class="gallery-item-actions">
                        <button class="btn btn-secondary edit-btn" data-index="${originalIndex}">✏️ Edit</button>
                        <button class="btn btn-secondary delete-btn" data-index="${originalIndex}">🗑️ Hapus</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditModal(parseInt(e.target.dataset.index)));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openDeleteModal(parseInt(e.target.dataset.index)));
    });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert repository path to a displayable URL when running admin locally.
 * If the path already looks absolute (starts with http) return as-is.
 * Otherwise prefix with ../ so admin-local can resolve to repo root assets folder.
 */
function displayPath(path) {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('//')) return path;
    const clean = path.replace(/^\//, '');
    return `../${clean}`;
}

/**
 * Open edit modal
 */
function openEditModal(index) {
    editingIndex = index;
    const item = currentGallery[index];
    editTitle.value = item.title;
    editCategory.value = item.tag;
    editPreviewImage.src = displayPath(item.img);
    editModal.classList.remove('hidden');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    editModal.classList.add('hidden');
    editingIndex = null;
}

/**
 * Save edit
 */
async function saveEditItem() {
    if (!editTitle.value || !editCategory.value) {
        showToast('Judul dan kategori harus diisi', 'warning');
        return;
    }

    try {
        showLoading('Menyimpan perubahan...');
        currentGallery[editingIndex].title = editTitle.value;
        currentGallery[editingIndex].tag = editCategory.value;
        await saveGalleryData();
        updateGalleryDisplay();
        closeEditModal();
        showToast('Item berhasil diperbarui', 'success');
    } catch (error) {
        showToast('Gagal memperbarui item', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Open delete modal
 */
function openDeleteModal(index) {
    deletingIndex = index;
    deleteItemName.textContent = currentGallery[index].title;
    deleteModal.classList.remove('hidden');
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    deletingIndex = null;
}

/**
 * Confirm delete
 */
async function confirmDeleteItem() {
    try {
        showLoading('Menghapus item...');
        const item = currentGallery[deletingIndex];
        currentGallery.splice(deletingIndex, 1);
        await saveGalleryData();
        updateGalleryDisplay();
        closeDeleteModal();
        showToast('Item berhasil dihapus', 'success');
    } catch (error) {
        showToast('Gagal menghapus item', 'error');
    } finally {
        hideLoading();
    }
}

// ==================== Settings Management ==================== //

/**
 * Open settings modal
 */
function openSettings() {
    document.getElementById('token').value = config.token;
    document.getElementById('owner').value = config.owner;
    document.getElementById('repo').value = config.repo;
    document.getElementById('galleryPath').value = config.galleryPath;
    document.getElementById('imgFolder').value = config.imgFolder;
    settingsModal.classList.remove('hidden');
}

/**
 * Close settings modal
 */
function closeSettingsModal() {
    settingsModal.classList.add('hidden');
}

/**
 * Save settings
 */
function saveSettings() {
    const token = document.getElementById('token').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const repo = document.getElementById('repo').value.trim();
    const galleryPath = document.getElementById('galleryPath').value.trim();
    const imgFolder = document.getElementById('imgFolder').value.trim();

    if (!token || !owner || !repo || !galleryPath || !imgFolder) {
        showToast('Semua field harus diisi', 'warning');
        return;
    }

    config.token = token;
    config.owner = owner;
    config.repo = repo;
    config.galleryPath = galleryPath;
    config.imgFolder = imgFolder;

    localStorage.setItem('github_token', token);
    localStorage.setItem('github_owner', owner);
    localStorage.setItem('github_repo', repo);
    localStorage.setItem('gallery_path', galleryPath);
    localStorage.setItem('img_folder', imgFolder);

    showToast('Pengaturan berhasil disimpan', 'success');
    closeSettingsModal();
}

// ==================== File Upload Handling ==================== //

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    if (!validateFile(file)) {
        selectedFile = null;
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        previewBox.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Clear form
    titleInput.focus();
}

/**
 * Clear preview
 */
function clearPreview() {
    selectedFile = null;
    previewBox.classList.add('hidden');
    fileInput.value = '';
    titleInput.value = '';
    categorySelect.value = '';
}

/**
 * Upload file
 */
async function uploadFile() {
    if (!selectedFile) {
        showToast('Pilih gambar terlebih dahulu', 'warning');
        return;
    }

    if (!titleInput.value.trim()) {
        showToast('Masukkan judul produk', 'warning');
        return;
    }

    if (!categorySelect.value) {
        showToast('Pilih kategori', 'warning');
        return;
    }

    try {
        uploadBtn.disabled = true;
        progressBox.classList.remove('hidden');

        // Upload image
        progressText.textContent = 'Uploading gambar (25%)...';
        progressFill.style.width = '25%';

        const extension = selectedFile.type.split('/')[1];
        const filename = generateUniqueFilename(titleInput.value, extension);
        await uploadFileToGithub(selectedFile, filename);

        // Update gallery data
        progressText.textContent = 'Memperbarui gallery (75%)...';
        progressFill.style.width = '75%';

        const newItem = {
            img: `${config.imgFolder}/${filename}`,
            title: titleInput.value.trim(),
            tag: categorySelect.value
        };

        currentGallery.push(newItem);
        await saveGalleryData();

        // Finish
        progressText.textContent = 'Selesai! (100%)';
        progressFill.style.width = '100%';

        setTimeout(() => {
            progressBox.classList.add('hidden');
            clearPreview();
            updateGalleryDisplay();
            showToast('Gambar berhasil diupload', 'success');
        }, 500);
    } catch (error) {
        console.error('Upload error:', error);
        showToast(`Upload gagal: ${error.message}`, 'error');
        progressBox.classList.add('hidden');
    } finally {
        uploadBtn.disabled = false;
    }
}

// ==================== Event Listeners ==================== //

// Drag and Drop
dragDropArea.addEventListener('click', () => fileInput.click());

dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('dragover');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragover');
});

dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// Preview
clearPreviewBtn.addEventListener('click', clearPreview);

// Upload
uploadBtn.addEventListener('click', uploadFile);

// Settings
settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsModal);
saveSetting.addEventListener('click', saveSettings);

// Sync
syncBtn.addEventListener('click', () => {
    loadGalleryData();
});

// Search and Filter
searchInput.addEventListener('input', updateGalleryDisplay);

filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        updateGalleryDisplay();
    });
});

// Edit Modal
closeEdit.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);
saveEdit.addEventListener('click', saveEditItem);

// Delete Modal
closeDelete.addEventListener('click', closeDeleteModal);
cancelDelete.addEventListener('click', closeDeleteModal);
confirmDelete.addEventListener('click', confirmDeleteItem);

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettingsModal();
        closeEditModal();
        closeDeleteModal();
    }
});

// ==================== Initialize ==================== //

/**
 * Initialize app
 */
function initApp() {
    // Check if config is set
    if (config.token && config.owner && config.repo) {
        loadGalleryData();
    } else {
        showToast('⚠️ Pengaturan GitHub belum dikonfigurasi. Klik tombol ⚙️ untuk setup.', 'warning');
        settingsModal.classList.remove('hidden');
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
