# Admin Gallery - Local Manager 📸

Aplikasi admin lokal sederhana untuk mengelola gallery website GitHub Pages Anda. Tidak perlu upload ke hosting, tidak perlu database, langsung terhubung ke GitHub API.

## Fitur Utama

✅ **Drag & Drop** - Drag gambar ke area upload atau klik untuk memilih  
✅ **Preview** - Lihat preview gambar sebelum upload  
✅ **Kategori** - Pilih dari 5 kategori (minimalis, klasik, blinds, wallpaper, jasa)  
✅ **Upload Otomatis** - Gambar diupload dengan nama unik ke GitHub  
✅ **Auto Update** - gallery.json otomatis diperbarui dan di-commit  
✅ **Manage Gallery** - Edit judul & kategori, hapus item, search, filter  
✅ **Validasi File** - Hanya JPG, PNG, WEBP, maksimal 5MB  
✅ **Progress Bar** - Visual upload progress  
✅ **Notifications** - Toast untuk sukses/gagal  
✅ **Dark Mode** - UI modern dark theme  
✅ **Responsive** - Mobile-friendly design  

## Cara Menggunakan

### 1. Setup Awal

Buka aplikasi di browser:
```
file:///path/to/admin-local/index.html
```

Atau gunakan local server (disarankan):
```bash
# Dengan Python 3
python -m http.server 8000

# Atau dengan Node.js (http-server)
npx http-server
```

### 2. Konfigurasi GitHub

1. Klik tombol **⚙️ Pengaturan** di kanan atas
2. Isi form dengan data berikut:

#### Personal Access Token
- Buka: https://github.com/settings/tokens
- Klik "Generate new token"
- Pilih "Personal access tokens (classic)"
- Beri nama: "Admin Gallery"
- Centang permissions:
  - ✅ repo (akses penuh ke repository)
  - ✅ workflow (untuk commit)
- Generate dan copy token
- Paste ke field "Personal Access Token"

#### GitHub Username
- Username GitHub Anda (contoh: `githubusername`)

#### Nama Repository
- Nama repository GitHub Pages Anda
- Contoh: `username.github.io` atau `my-website`

#### Path file gallery.json
- Path relatif dari root repository
- Contoh: `assets/gallery_metadata.json`
- **Sesuaikan dengan struktur project Anda!**

#### Path folder gambar
- Path folder dimana gambar disimpan
- Contoh: `assets/gallery`
- **Folder ini harus sudah ada di GitHub repository!**

Klik **💾 Simpan**

### 3. Upload Gambar

1. **Pilih Gambar**
   - Drag & drop ke area atau klik untuk browse
   - Format: JPG, PNG, WEBP
   - Max: 5MB

2. **Masukkan Data**
   - Judul Produk: "Gorden Minimalis Abu Abu"
   - Kategori: Pilih dari dropdown

3. **Upload**
   - Klik tombol 🚀 Upload
   - Tunggu sampai selesai (progress bar akan penuh)

**Apa yang terjadi otomatis:**
- Gambar di-upload ke folder `/assets/gallery` di GitHub
- Nama file direname otomatis menjadi unik
- File `gallery_metadata.json` otomatis diupdate
- Commit otomatis ke GitHub dengan message

### 4. Kelola Gallery

#### Sinkronisasi
- Klik tombol 🔄 **Sync** untuk reload data terbaru dari GitHub
- Berguna jika ada perubahan dari perangkat lain

#### Cari Gambar
- Gunakan search box di sidebar
- Cari berdasarkan judul atau kategori

#### Filter Kategori
- Pilih kategori di sidebar untuk filter
- Atau klik "Semua" untuk lihat semua

#### Edit Item
- Klik tombol ✏️ **Edit** pada gambar
- Ubah judul atau kategori
- Klik 💾 **Simpan**

#### Hapus Item
- Klik tombol 🗑️ **Hapus** pada gambar
- Konfirmasi penghapusan
- Item dihapus dari gallery.json dan GitHub otomatis di-commit

### 5. Format Data gallery.json

Aplikasi ini membuat file dengan struktur:

```json
[
  {
    "img": "assets/gallery/gorden-minimalis-abu-abu-20260604-001.jpg",
    "title": "Gorden Minimalis Abu Abu",
    "tag": "minimalis"
  },
  {
    "img": "assets/gallery/gorden-klasik-20260604-002.jpg",
    "title": "Gorden Klasik Premium",
    "tag": "klasik"
  }
]
```

**Catatan:**
- Path `img` selalu relative dari root repository
- `tag` harus salah satu dari: minimalis, klasik, blinds, wallpaper, jasa
- Nama file otomatis unik dengan format: `{judul}-{date}-{nomor}.{ext}`

## Struktur Folder

```
/admin-local
├── index.html          (halaman utama)
├── style.css           (styling dark mode)
├── app.js              (logika aplikasi)
└── README.md           (dokumentasi ini)
```

## Teknologi

- **HTML5** - Struktur markup
- **CSS3** - Dark mode, responsive, modern UI
- **Vanilla JavaScript** - Logic tanpa framework
- **GitHub REST API** - Direct GitHub integration

## Persyaratan

- ✅ Browser modern (Chrome, Firefox, Safari, Edge)
- ✅ Personal Access Token GitHub
- ✅ Repository GitHub dengan folder `assets/gallery`
- ✅ File `gallery_metadata.json` di repository
- ✅ Internet connection (untuk GitHub API)

## Troubleshooting

### ❌ Error: "GitHub config missing"
**Solusi:** Klik ⚙️ Pengaturan dan lengkapi semua field

### ❌ Error: "401 Unauthorized"
**Solusi:** 
- Token GitHub sudah expired/invalid
- Generate token baru di https://github.com/settings/tokens
- Update token di Pengaturan

### ❌ Error: "Repository not found"
**Solusi:**
- Pastikan username dan nama repository sudah benar
- Repository harus public atau token memiliki akses

### ❌ Folder gambar tidak ditemukan
**Solusi:**
- Buat folder `assets/gallery` di repository jika belum ada
- Pastikan path di Pengaturan sudah benar
- Push folder ke GitHub (buat file `.gitkeep` di folder jika kosong)

### ❌ File gallery.json tidak ditemukan
**Solusi:**
- Buat file `assets/gallery_metadata.json` dengan konten: `[]`
- Commit dan push ke GitHub
- Update path di Pengaturan jika berbeda

### ❌ Upload berhasil tapi tidak muncul di website
**Solusi:**
- Tunggu beberapa detik, GitHub Pages perlu time untuk update
- Hard refresh website Anda (Ctrl+Shift+R atau Cmd+Shift+R)
- Pastikan website Anda membaca file gallery.json dengan benar

## Tips & Trik

### 1. Backup Lokal
Sebelum setup, download `gallery_metadata.json` dari repository sebagai backup

### 2. Batch Import
- Jika ingin import banyak gambar, lakukan satu per satu
- Atau edit `gallery_metadata.json` langsung di GitHub

### 3. Custom Landing Page
- Aplikasi admin ini independent, tidak perlu ubah landing page
- Landing page tetap membaca dari file `gallery_metadata.json` yang sama
- Sinkronisasi otomatis!

### 4. Multiple Admin
- Bisa digunakan dari multiple device
- Pastikan menggunakan token yang sama
- Klik 🔄 Sync sebelum upload untuk mencegah conflict

### 5. Kategori Custom (Advanced)
- Edit kategori di `index.html` (baris select options)
- Pastikan update di array filter buttons juga
- Requirement: hanya 1 kata, lowercase

## Security Notes

⚠️ **PENTING:**
- Token disimpan di localStorage browser Anda
- Jangan bagikan Personal Access Token dengan orang lain
- Gunakan di laptop pribadi saja
- Revoke token di GitHub jika ada security concern

## FAQ

**Q: Bisa upload dari server hosting?**  
A: Tidak disarankan. Aplikasi ini hanya untuk use lokal. Jika ingin dari mana saja, ubah untuk backend authentication.

**Q: Berapa gambar yang bisa disimpan?**  
A: GitHub memiliki limit size per file (~100MB) dan per repository. Untuk gallery biasanya tidak masalah, tapi hati-hati dengan ukuran gambar.

**Q: Bisa pakai format lain (AVIF, BMP)?**  
A: Bisa ditambahkan di `validateFile()` function di app.js

**Q: Gimana kalau lupa pengaturan?**  
A: Buka browser DevTools (F12) → Application → Local Storage, lihat localStorage data

**Q: Bisa pakai private token untuk security?**  
A: Bisa, API akan tetap bekerja dengan private repository jika token memiliki akses

## Lisensi

Bebas digunakan untuk personal dan commercial projects.

---

Made with ❤️ for GitHub Pages users
