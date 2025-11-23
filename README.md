# XKW - Imitasi dari X/Twitter

XKW adalah aplikasi web yang meniru fungsi utama dari X (sebelumnya dikenal sebagai Twitter). Dibangun menggunakan Next.js, aplikasi ini menyediakan platform bagi pengguna untuk memposting tweet, mengikuti pengguna lain, dan berinteraksi dengan konten melalui like, retweet, dan balasan.

## Fitur

- **Autentikasi Pengguna**: Daftar dan masuk ke akun Anda.
- **Tweeting**: Buat, edit, dan hapus tweet.
- **Retweet dan Like**: Berinteraksi dengan tweet melalui like dan retweet.
- **Sistem Mengikuti**: Ikuti pengguna lain dan lihat tweet mereka di feed Anda.
- **Tab untuk Feed**: Beralih antara tab "Untuk Anda" dan "Mengikuti" untuk menyesuaikan feed Anda.
- **Desain Responsif**: Dioptimalkan untuk perangkat desktop dan seluler.

## Teknologi yang Digunakan

- **Next.js**: Framework untuk membangun aplikasi.
- **MongoDB**: Database untuk menyimpan data pengguna dan tweet.
- **TypeScript**: Memastikan keamanan tipe di seluruh kode.
- **Tailwind CSS**: Untuk styling aplikasi.

## Struktur Database

Aplikasi ini menggunakan MongoDB sebagai database utama. Berikut adalah struktur koleksi utama:

1. **users**:
   - Menyimpan informasi pengguna seperti `username`, `email`, `password`, `bio`, dan statistik (jumlah pengikut, jumlah yang diikuti, jumlah tweet).
   - Contoh dokumen:
     ```json
     {
       "userId": "12345",
       "username": "johndoe",
       "email": "johndoe@example.com",
       "password": "hashed_password",
       "name": "John Doe",
       "bio": "Pengembang web",
       "media": {
         "profileImage": "profile.jpg",
         "bannerImage": "banner.jpg"
       },
       "stats": {
         "followers": 100,
         "following": 50,
         "tweetCount": 200
       },
       "createdAt": "2025-01-01T00:00:00Z"
     }
     ```

2. **tweets**:
   - Menyimpan informasi tentang tweet, termasuk konten, media, jenis tweet (original, reply, retweet, quote), dan statistik (jumlah balasan, retweet, like).
   - Contoh dokumen:
     ```json
     {
       "tweetId": "abc123",
       "author": {
         "userId": "12345",
         "username": "johndoe",
         "name": "John Doe",
         "avatar": "profile.jpg"
       },
       "content": "Ini adalah tweet pertama saya!",
       "media": [],
       "parentTweetId": null,
       "type": "Original",
       "stats": {
         "replies": 10,
         "retweets": 5,
         "likes": 20
       },
       "createdAt": "2025-01-01T12:00:00Z"
     }
     ```

3. **likes**, **retweets**, dan **bookmarks**:
   - Koleksi tambahan untuk menyimpan data interaksi pengguna dengan tweet (like, retweet, dan bookmark).

## Memulai

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1. Clone repositori:
   ```bash
   git clone https://github.com/your-username/xkw.git
   ```

2. Masuk ke direktori proyek:
   ```bash
   cd xkw
   ```

3. Instal dependensi:
   ```bash
   pnpm install
   ```

4. Atur variabel lingkungan:
   Buat file `.env.local` di direktori root dan tambahkan variabel lingkungan yang diperlukan (misalnya, string koneksi database).

5. Jalankan server pengembangan:
   ```bash
   pnpm dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

## Pelajari Lebih Lanjut

Untuk mempelajari lebih lanjut tentang teknologi yang digunakan dalam proyek ini, lihat sumber daya berikut:

- [Dokumentasi Next.js](https://nextjs.org/docs) - Pelajari fitur dan API Next.js.
- [Dokumentasi MongoDB](https://www.mongodb.com/docs/) - Pelajari tentang MongoDB untuk manajemen database.
- [Dokumentasi Tailwind CSS](https://tailwindcss.com/docs) - Pelajari tentang framework CSS berbasis utilitas.

## Berkontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi pada XKW, silakan fork repositori ini dan kirimkan pull request.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file LICENSE untuk detail lebih lanjut.

---

XKW adalah proyek yang terinspirasi oleh X/Twitter, dibangun untuk tujuan edukasi dan untuk mengeksplorasi teknologi pengembangan web modern.
