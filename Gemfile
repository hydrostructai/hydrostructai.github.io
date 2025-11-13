# Tệp: Gemfile
# XÓA toàn bộ nội dung Gemfile cũ và THAY THẾ bằng nội dung này.
# File này loại bỏ 'github-pages' và định nghĩa rõ ràng các dependency.

source "https://rubygems.org"

# 1. Lõi Jekyll
gem "jekyll", "~> 4.3.4"

# 2. Theme Minimal Mistakes (Cài đặt qua gem)
gem "minimal-mistakes-jekyll"

# 3. Các Phụ thuộc Bắt buộc và Khắc phục Lỗi
# Plugin bắt buộc cho Minimal Mistakes
gem "jekyll-include-cache", group: :jekyll_plugins

# Khắc phục lỗi "faraday-retry" từ bản ghi log
gem "faraday-retry"

# 4. Các Plugin Jekyll Tiêu chuẩn
gem "jekyll-feed", group: :jekyll_plugins
gem "jekyll-sitemap", group: :jekyll_plugins
gem "jekyll-paginate", group: :jekyll_plugins
gem "jekyll-seo-tag", group: :jekyll_plugins
gem "jekyll-gist"         # <-- Fix lỗi trước đó
gem "jemoji"              # <-- Fix lỗi trước đó
gem "jekyll-archives"     # <-- THÊM VÀO: Fix lỗi 'cannot load jekyll-archives'

# 5. Các phụ thuộc khác
gem "kramdown"
gem "kramdown-parser-gfm"
gem "rouge"
gem "webrick"
