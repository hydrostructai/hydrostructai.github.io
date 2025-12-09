source "https://rubygems.org"

# --- Core ---
gem "jekyll", "~> 4.3.4"

# --- Theme (Dùng Gem thay vì Remote Theme) ---
gem "minimal-mistakes-jekyll"

# --- Plugins ---
group :jekyll_plugins do
  gem "jekyll-include-cache"
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-paginate"
  gem "jekyll-seo-tag"
  gem "jekyll-gist"
  gem "jemoji"
  gem "jekyll-archives" # Bắt buộc vì bạn dùng plugin này trong _config.yml
end

# --- Dependencies & Utilities ---
gem "kramdown-parser-gfm"
gem "webrick"         # Cần thiết cho Jekyll 4.x chạy trên Ruby 3.0+
gem "faraday-retry"   # Hỗ trợ kết nối mạng ổn định hơn

# --- Timezone Support ---
# Quan trọng để xử lý timezone: "Asia/Ho_Chi_Minh" không bị lỗi
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]