---
layout: post
title: "SheetPileFEM-WASM: Phân tích C? Ván b?ng Phuong pháp PTHH trên Web"
description: "Gi?i thi?u ?ng d?ng web SheetPileFEM, s? d?ng lõi WebAssembly (WASM) d? phân tích tu?ng c? ván theo phuong pháp ph?n t? h?u h?n (FEM) ngay trên trình duy?t."
date: 2025-10-28 10:00:00 +0700
categories: [Geotechnical, FEM, WebApp]
tags: [Sheet Pile, FEM, WASM, Civil Engineering, Phân tích K?t c?u]
image: /assets/images/posts/sheetpilefem-hero.png
---

### 1. Bài toán Ð?a k? thu?t C? di?n

Trong k? thu?t d?a k? thu?t và công trình ng?m, tu?ng c? ván (Sheet Pile Wall) là m?t trong nh?ng gi?i pháp móng sâu và tu?ng ch?n ph? bi?n nh?t. Chúng du?c s? d?ng d? thi công h? móng, b?o v? b? sông, xây d?ng b?n c?ng, và ?n d?nh mái d?c.

Tuy nhiên, vi?c phân tích và thi?t k? tu?ng c? ván không h? don gi?n. Nó dòi h?i s? hi?u bi?t sâu s?c v? tuong tác d?t-k?t c?u (Soil-Structure Interaction), áp l?c d?t ch? d?ng/b? d?ng, và áp l?c nu?c. Các phuong pháp truy?n th?ng nhu Cân b?ng Gi?i h?n (Limit Equilibrium Method - LEM) tuy don gi?n nhung có nhi?u h?n ch? khi mô hình hóa các di?u ki?n ph?c t?p nhu d?t nhi?u l?p, h? neo, hay t?i tr?ng d?ng.

### 2. S? tr?i d?y c?a Phuong pháp Ph?n t? H?u h?n (FEM)

Phuong pháp Ph?n t? H?u h?n (FEM) cung c?p m?t mô hình phân tích chính xác và linh ho?t hon nhi?u. Thay vì các gi? d?nh don gi?n hóa, FEM cho phép chúng ta:

* Mô hình hóa tu?ng c? nhu m?t c?u ki?n d?m-dàn h?i (beam-spring).
* Ð?nh nghia chính xác d?c tính c?a t?ng l?p d?t.
* Mô ph?ng chính xác s? làm vi?c c?a h? neo (anchors) ho?c ch?ng d? (struts).
* Tính toán và xu?t ra bi?u d? n?i l?c (Moment, Shear) và bi?n d?ng (Deflection) chi ti?t d?c theo thân c?.

V?n d? là, các ph?n m?m FEM chuyên d?ng (nhu Plaxis, GeoStudio, Midas) thu?ng r?t d?t d?, n?ng n? và dòi h?i c?u hình máy tính m?nh m?.

### 3. SheetPileFEM-WASM: Mang FEM lên Trình duy?t

V?i mong mu?n dân ch? hóa các công c? phân tích k? thu?t, chúng tôi dã phát tri?n **SheetPileFEM-WASM** — m?t ?ng d?ng web g?n nh? nhung m?nh m? d? phân tích tu?ng c? ván.



"WASM" là vi?t t?t c?a **WebAssembly**. Ðây là m?t công ngh? d?t phá cho phép ch?y các do?n mã du?c biên d?ch t? C++, Rust, hay Fortran (ngôn ng? c?a các lõi FEM truy?n th?ng) v?i t?c d? g?n-nhu-native ngay trên trình duy?t web c?a b?n.

**Ði?u này có nghia là gì?**
Chúng tôi dã gói g?n m?t lõi tính toán FEM d?a k? thu?t vào file `sheetpilefem.js` (thông qua WASM) và b?n có th? ch?y nó trên m?i thi?t b?, t? PC d?n di?n tho?i, mà **không c?n cài d?t b?t c? th? gì**.

### 4. Các tính nang chính (Phiên b?n Mi?n phí)

Phiên b?n mi?n phí du?c cung c?p ngay trên trang web này du?c thi?t k? cho m?c dích giáo d?c, tra c?u nhanh, và các bài toán don gi?n. Các tính nang bao g?m:

* **Ð?nh nghia Hình h?c:** Nh?p cao d? d?nh/chân c?, cao d? m?t d?t (tru?c/sau), và m?c nu?c (tru?c/sau).
* **Thông s? C?:** Nh?p mô-dun dàn h?i (E) và mô-men quán tính (I) c?a c?.
* **Qu?n lý Ð?t n?n:** Cho phép nh?p nhi?u l?p d?t v?i các thông s? co b?n (Gamma, Phi, Cohesion).
* **Xu?t K?t qu?:** T? d?ng v? các bi?u d? Bi?n d?ng (Deflection), Mô-men (Moment), và L?c c?t (Shear) sau khi ch?y phân tích.
* **Xu?t B?ng:** Cung c?p b?ng k?t qu? chi ti?t t?i t?ng di?m nút.

### 5. Mô hình Freemium: T? Giáo d?c d?n Chuyên nghi?p

**SheetPileFEM-WASM** du?c xây d?ng theo mô hình "Freemium" d? ph?c v? c? c?ng d?ng:

1.  **B?n Mi?n phí (Free):**
    * **Ð?i tu?ng:** Sinh viên, k? su m?i, ho?c các bài toán don gi?n.
    * **Tính nang:** Ð?y d? các tính nang co b?n nhu dã nêu.
    * **Gi?i h?n:** Có th? b? gi?i h?n s? l?p d?t (ví d?: t?i da 3 l?p), không h? tr? h? neo (Anchors) và t?i tr?ng ph?c t?p (Surcharge).
    * **Truy c?p:** Ngay t?i dây, trên `hydrostructai.github.io`.

2.  **B?n Chuyên nghi?p (Pro - D?ng SaaS):**
    * **Ð?i tu?ng:** K? su thi?t k?, công ty tu v?n chuyên nghi?p.
    * **Tính nang:** M? khóa toàn b? gi?i h?n: s? l?p d?t không gi?i h?n, tính toán h? neo dàn h?i, nh?p t?i tr?ng ph?c t?p, luu/t?i d? án, xu?t báo cáo chuyên nghi?p.
    * **Truy c?p:** S? du?c cung c?p du?i d?ng D?ch v? (SaaS) có tr? phí, yêu c?u License Key d? xác th?c.

### 6. Tr?i nghi?m ngay

Chúng tôi tin r?ng công c? này s? là m?t tài nguyên h?c t?p quý giá cho sinh viên và là m?t công c? h? tr? nhanh chóng, ti?n l?i cho các k? su.

Hãy t? mình tr?i nghi?m ngay bây gi?. M?i ph?n h?i và góp ý xin vui lòng d? l?i trong ph?n bình lu?n bên du?i ho?c liên h? tr?c ti?p v?i chúng tôi.

<a href="/apps/sheetpilefem/" class="button" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
    Ch?y SheetPileFEM-WASM (Mi?n phí)
</a>
