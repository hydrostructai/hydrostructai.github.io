kiểm tra /github-guide/hydrostructai.github.io xem có dùng Google Analytics + JavaScript

check nhúng code GA vào layout 

<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
Từ dữ liệu truy cập thu thập bạn triển khai hiển thị trực tiếp số truy cập lên website dùng API hoặc GA Dashboard để xem, đặt ở menu bên trái trên cùng