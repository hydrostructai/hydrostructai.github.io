# Nguồn gem chính thức của Ruby
source "https://rubygems.org"

# Chỉ định phiên bản Ruby (tùy chọn nhưng được khuyến nghị)
# ruby "3.1.2"

# 1. Lõi Jekyll
# Sử dụng phiên bản Jekyll 4+ hiện đại. Bản log của bạn cho thấy 4.3.4
gem "jekyll", "~> 4.3.4"

# 2. Theme Minimal Mistakes
# CHỌN MỘT TRONG HAI PHƯƠNG ÁN SAU (A hoặc B):

# Phương án A: Cài đặt theme dưới dạng GEM (Khuyến nghị)
# Thêm gem cho theme [6, 18, 19]
gem "minimal-mistakes-jekyll"

# Phương án B: Cài đặt theme dưới dạng REMOTE THEME
# Điều này yêu cầu một gem khác để hoạt động [10]
# gem "jekyll-remote-theme"


# 3. Các Phụ thuộc Bắt buộc và Khắc phục Lỗi
# Plugin bắt buộc cho Minimal Mistakes
gem "jekyll-include-cache", group: :jekyll_plugins

# Khắc phục lỗi "faraday-retry" từ bản ghi log
gem "faraday-retry"

# 4. Các Plugin Jekyll Tiêu chuẩn (Thay thế cho 'github-pages')
# Đây là các plugin cơ bản mà 'github-pages' thường cung cấp [18]
gem "jekyll-feed", group: :jekyll_plugins
gem "jekyll-sitemap", group: :jekyll_plugins
gem "jekyll-paginate", group: :jekyll_plugins
gem "jekyll-seo-tag", group: :jekyll_plugins

# Các plugin khác có thể cần thiết cho Markdown và syntax highlighting
gem "kramdown"
gem "kramdown-parser-gfm"
gem "rouge"

# Thêm gem webrick cho Jekyll 4 trên Ruby 3+
gem "webrick"
