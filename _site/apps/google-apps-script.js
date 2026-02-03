// Google Apps Script - Web App để nhận dữ liệu từ Landing Page
// Deploy: Extensions > Apps Script > Deploy > New deployment > Web app

function doPost(e) {
  try {
    // Mở Google Sheet bằng ID
    var sheet = SpreadsheetApp.openById('1gko2bPuKFBp4wvoYv1lVAhdixoty5bIHMHS0dYeLLss').getActiveSheet();
    
    // Kiểm tra nếu sheet trống, thêm header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Họ và Tên',
        'Email',
        'Số điện thoại',
        'Nghề nghiệp',
        'ShortCol 2D',
        'ShortCol 3D',
        'Pile Group',
        'Lateral Pile',
        'Sheet Pile FEM',
        'Hydraulic Spillway',
        'Nhận thông báo Free',
        'Quan tâm bản Pro'
      ]);
      
      // Format header
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1e3a8a');
      headerRange.setFontColor('#ffffff');
    }
    
    // Parse dữ liệu từ form
    var params = e.parameter;
    
    // Tạo timestamp
    var timestamp = new Date();
    
    // Chuẩn bị dữ liệu để ghi
    var rowData = [
      timestamp,
      params.name || '',
      params.email || '',
      params.phone || '',
      params.role || '',
      params.app_shortcol2D === 'yes' ? 'Có' : 'Không',
      params.app_shortcol3D === 'yes' ? 'Có' : 'Không',
      params.app_pilegroup === 'yes' ? 'Có' : 'Không',
      params.app_lateralpile === 'yes' ? 'Có' : 'Không',
      params.app_sheetpilefem === 'yes' ? 'Có' : 'Không',
      params.app_hydraulicspillway === 'yes' ? 'Có' : 'Không',
      params.tier_free === 'yes' ? 'Có' : 'Không',
      params.tier_pro === 'yes' ? 'Có' : 'Không'
    ];
    
    // Ghi dữ liệu vào sheet
    sheet.appendRow(rowData);
    
    // Format timestamp column
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
    
    // Tự động điều chỉnh độ rộng cột (chỉ chạy lần đầu)
    if (sheet.getLastRow() === 2) {
      sheet.autoResizeColumns(1, 13);
    }
    
    // Gửi email thông báo (tùy chọn)
    try {
      MailApp.sendEmail({
        to: 'ha.nguyen@hydrostructai.com',
        subject: '🎯 Đăng ký mới từ HydrostructAI Landing Page',
        htmlBody: `
          <h2>Thông tin đăng ký mới</h2>
          <p><strong>Họ và Tên:</strong> ${params.name}</p>
          <p><strong>Email:</strong> ${params.email}</p>
          <p><strong>Số điện thoại:</strong> ${params.phone}</p>
          <p><strong>Nghề nghiệp:</strong> ${params.role}</p>
          <p><strong>Ứng dụng quan tâm:</strong></p>
          <ul>
            ${params.app_shortcol2D === 'yes' ? '<li>ShortCol 2D</li>' : ''}
            ${params.app_shortcol3D === 'yes' ? '<li>ShortCol 3D</li>' : ''}
            ${params.app_pilegroup === 'yes' ? '<li>Pile Group</li>' : ''}
            ${params.app_lateralpile === 'yes' ? '<li>Lateral Pile</li>' : ''}
            ${params.app_sheetpilefem === 'yes' ? '<li>Sheet Pile FEM</li>' : ''}
            ${params.app_hydraulicspillway === 'yes' ? '<li>Hydraulic Spillway</li>' : ''}
          </ul>
          <p><a href="https://docs.google.com/spreadsheets/d/1gko2bPuKFBp4wvoYv1lVAhdixoty5bIHMHS0dYeLLss">Xem Google Sheet</a></p>
        `
      });
    } catch (mailError) {
      // Bỏ qua lỗi email nếu có
      console.log('Email error:', mailError);
    }
    
    // Trả về response thành công
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đăng ký thành công!'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Xử lý lỗi
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm test (chạy để kiểm tra quyền truy cập)
function testFunction() {
  var sheet = SpreadsheetApp.openById('1gko2bPuKFBp4wvoYv1lVAhdixoty5bIHMHS0dYeLLss').getActiveSheet();
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
}
