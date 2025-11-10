hydrostructai.github.io/
¦
+-- _config.yml               # [R?t quan tr?ng] C?u hình chính
+-- Gemfile                   # [Quan tr?ng] Khai báo plugins
¦
+-- index.md                  # Trang ch? (layout d?c bi?t)
+-- apps.md                   # Trang portfolio apps
+-- about.md                  # Trang gi?i thi?u
¦
+-- _data/                    # Thu m?c ch?a d? li?u
¦   +-- navigation.yml        # Ð?nh nghia thanh menu chính
¦
+-- _posts/                   # Thu m?c blog
¦   +-- 2025-10-28-sheet-pile-fem-wasm-intro.md
¦
+-- assets/                   # Thu m?c tài nguyên
¦   +-- images/               # (Ch?a ?nh logo, avatar, ?nh bài post)
¦   ¦   +-- logo.png
¦   ¦   +-- my-avatar.png
¦   +-- css/                  # (N?u b?n mu?n tùy bi?n sâu hon)
¦       +-- main.scss
¦
+-- apps/                     # Thu m?c ch?a các app (Jekyll b? qua)
    +-- sheetpilefem/
    ¦   +-- index.html
    +-- (các app khác...)
    
=====================================================
Chào b?n, dây là quy trình chính xác d? t?i code v? máy (clone), ch?nh s?a và d?y (push) lên l?i GitHub.

**Yêu c?u:** B?n c?n cài d?t [Git](https://www.google.com/search?q=https://git-scm.com/downloads) trên máy tính c?a mình.

-----

### Quy trình 5 Bu?c (Làm l?n d?u)

N?u b?n **chua t?ng** t?i code này v? máy, hãy làm theo các bu?c sau. M? Terminal (macOS/Linux) ho?c Git Bash (Windows).

**Bu?c 1: Clone (T?i toàn b? code v?)**

```bash
git clone https://github.com/hydrostructai/hydrostructai.github.io.git
```

*L?nh này t?o m?t thu m?c m?i tên là `hydrostructai.github.io` ch?a code c?a b?n.*

**Bu?c 2: Ði vào Thu m?c**

```bash
cd hydrostructai.github.io
```

**Bu?c 3: Ch?nh s?a Code**
M? thu m?c này b?ng trình so?n th?o code (nhu VS Code) và th?c hi?n m?i ch?nh s?a b?n mu?n (s?a `index.html`, `taylorseries.html`, v.v.).

**Bu?c 4: Luu Thay d?i (Add & Commit)**
Sau khi s?a xong, quay l?i c?a s? Terminal (ho?c Git Bash) và gõ hai l?nh sau:

```bash
# Thêm t?t c? các t?p dã s?a
git add .

# Ghi l?i thay d?i v?i m?t tin nh?n
git commit -m "C?p nh?t n?i dung website"
```

*(B?n có th? thay "C?p nh?t n?i dung website" b?ng tin nh?n c?a riêng b?n).*

**Bu?c 5: Ð?y (Push) lên GitHub**

```bash
git push origin main
```

*(N?u `main` không ho?t d?ng, hãy th? `master` - dây là tên nhánh chính c?a b?n).*

-----

### Quy trình (Làm t? l?n th? hai tr? di)

N?u b?n **dã có** thu m?c code trên máy t? tru?c, hãy b?t d?u t? dây:

1.  **Ði vào Thu m?c**
    ```bash
    cd hydrostructai.github.io
    ```
2.  **Pull (Ð?ng b? code m?i nh?t)**
    ```bash
    git pull origin main
    ```
3.  **Ch?nh s?a, Add, Commit, Push** (Làm l?i Bu?c 3, 4, 5 t? ph?n trên).
============================================================

B. Các Web App (S?n ph?m):

V? trí: Toàn b? app du?c d?t trong thu m?c /apps/ ? thu m?c g?c. Thu m?c này du?c Jekyll "b? qua" và sao chép nguyên tr?ng.

C?u trúc bên trong /apps/:

/apps/sheetpilefem/

index.html (Giao di?n SheetPileFEM b?n dã g?i)

app.js (Logic "Freemium" và di?u khi?n UI)

sheetpilefem.js (Code "keo" do Emscripten t?o ra)

sheetpilefem.wasm (Lõi C++ FEM dã du?c biên d?ch)

/apps/taylor-series/

index.html (N?i dung file taylorseries.html cu c?a b?n)

/apps/hypocycloid/

index.html (N?i dung file hypocycloid.html cu c?a b?n)

/apps/pep3/
index.html (N?i dung file PEP3 THANG DANH GIA PHAT TRIEN.html cu)

Lu?ng hoàn ch?nh: Ngu?i dùng (k? su, sinh viên) ? Google ? Tìm th?y bài vi?t trên blog c?a b?n (ví d?: _posts/.../sheet-pile-fem-wasm-intro.md) ? Ð?c lý thuy?t, th?y h?p d?n ? Nh?n vào link "Ch?y ?ng d?ng" ? Ðu?c chuy?n hu?ng d?n https://hydrostructai.github.io/apps/sheetpilefem/ ? Tr?i nghi?m app SheetPileFEM (? ch? d? "Trial Mode" 2 l?p d?t).

3. ?? C?u trúc Luu tr? D? li?u (Cho SheetPileFEM)
Ðây là ph?n quan tr?ng d? hi?u rõ. Vì hydrostructai.github.io là m?t trang Tinh (Static) trên GitHub Pages, nó không có co s? d? li?u (database) phía máy ch?.

V?y, "d? li?u" c?a SheetPileFEM du?c luu ? dâu?

A. D? li?u M?u (2 L?p d?t)
Luu ? dâu: D? li?u này du?c "hard-code" (mã hóa c?ng) tr?c ti?p bên trong file app.js.

Logic: Khi b?n s?a file app.js và thay d?i bi?n defaultData d? ch? còn 2 l?p d?t (nhu tôi dã hu?ng d?n):

JavaScript

const defaultData = {
    //...
    soil: [
        ['Lop 1 (Cat pha)', 1.5, 18.0, 19.0, 30, 2],
        ['Lop 2 (Set deo)', -8.0, 16.5, 17.5, 10, 15]
    ],
    anchor: []
};
Khi trang .../apps/sheetpilefem/index.html t?i xong, app.js s? ch?y, g?i hàm loadDataIntoUI(defaultData). Hàm này d?c 2 l?p d?t t? defaultData và t? d?ng di?n vào giao di?n.

B. D? li?u Ngu?i dùng (Khi dang nh?p li?u)
Luu ? dâu: T?m th?i trong b? nh? (RAM) c?a trình duy?t.

Logic: Khi ngu?i dùng thay d?i con s? (ví d?: d?i cao d? L?p 1 t? 1.5 thành 2.0), d? li?u này ch? t?n t?i trên các ô <input> c?a index.html.

C. D? li?u Chuy?n giao (Khi nh?n "RUN ANALYSIS")
Luu ? dâu: Ðây là m?t chu?i JSON du?c t?o ra t?c th?i.

Logic:

Ngu?i dùng nh?n "RUN ANALYSIS".

Hàm collectInputs() trong app.js du?c g?i.

Nó quét toàn b? form, d?c 2 l?p d?t và các thông s? tu?ng, t?o ra m?t d?i tu?ng JavaScript.

JSON.stringify(inputs) bi?n d?i tu?ng này thành m?t chu?i JSON.

Chu?i JSON này du?c g?i vào hàm C++ WASM_MODULE.runAnalysis(...).

Lõi C++ (sheetpilecore.cpp) dùng thu vi?n nlohmann/json d? "phân rã" (parse) chu?i JSON này, n?p vào các struct C++ (nhu AnalysisInput, SoilLayer dã d?nh nghia trong datastructs.h).

Lõi FEM (femsolver.cpp) tính toán d?a trên các struct này.

D. D? li?u "Luu tr?" (Khi ngu?i dùng mu?n luu l?i)
Luu ? dâu: Luu v? máy tính c?a ngu?i dùng du?i d?ng file .csv.

Logic:

Ngu?i dùng (n?u dã có license) nh?n nút "Save as CSV".

Hàm handleSaveInputCSV() trong app.js du?c g?i.

Nó l?p l?i bu?c collectInputs() d? l?y d? li?u hi?n t?i trên giao di?n.

Nó d?nh d?ng d? li?u này thành m?t chu?i van b?n theo chu?n CSV (gi?ng h?t file SAMPLE.CSV c?a b?n).

Nó t?o m?t file "?o" trong trình duy?t và kích ho?t l?nh "Download" (sheetpile_input.csv).
