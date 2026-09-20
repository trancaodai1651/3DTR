# 3DTR

Ứng dụng web responsive để xem và nhập dữ liệu vận hành xưởng 3D print vào Google Sheets. Repository đi kèm workbook Excel/Google Sheets với công thức tính COST, giá bán TikTok/Shopee, đơn hàng, khách hàng, kho nhựa, đầu tư và dashboard.

## Tính năng

- Đăng nhập bằng Google Identity Services.
- Phân quyền dựa trên quyền thật của file Google Sheet:
  - `Owner` / `Editor`: xem và thêm dữ liệu.
  - `Viewer` / `Commenter`: chỉ xem, API từ chối mọi yêu cầu ghi.
- Bảy biểu mẫu: đơn hàng, khách hàng, sản phẩm, mua vào, kho nhựa, đầu tư và rút tiền.
- Khi chọn `Nhựa in` trong biểu mẫu `Mua vào`, trường `Màu nhựa` bắt buộc và được ghi vào cột `L - Màu nhựa` để kiểm soát tồn kho theo màu.
- Dashboard doanh thu, lợi nhuận, số đơn, tồn kho và dữ liệu gần đây.
- Giao diện mobile-first, chạy trên GitHub Pages mà không cần máy chủ riêng.
- Apps Script xác minh Google ID token, kiểm tra quyền file và chỉ ghi vào các cột đầu vào; cột công thức không bị ghi đè.
- Người dùng có thể cấp quyền Drive/Sheets để chọn nhiều file Google Sheets; ứng dụng chỉ nhận file có đủ 15 sheet chuẩn.
- Nếu chưa có file, nút **Tạo bản Google Sheet riêng** sẽ copy template một lần vào My Drive của người dùng. Bản copy độc lập, không liên kết công thức với template.
- Mẫu Google Sheet công khai: `https://docs.google.com/spreadsheets/d/18kfPoZHh99cAADm0leUjzxeiWg2SmE_bW-ixNHoDleI/edit`. Người dùng cũng có thể tải Excel, upload/chuyển thành Google Sheet rồi dán link vào **Import file**.
- Sau khi đăng nhập và cấp quyền Drive/Sheets, danh sách gồm toàn bộ Google Sheet mà tài khoản đang được cấp quyền sẽ hiển thị. File A được chia sẻ cho tài khoản B sẽ xuất hiện ở B; quyền Editor được ghi, quyền Viewer chỉ xem. File đã import được ghi nhớ cục bộ theo email để hiện lại ở lần đăng nhập sau.

Template không xuất hiện trong danh sách file làm việc, chỉ các bản sao/file chuẩn của người dùng mới được chọn. Cập nhật template sau này không thay đổi các bản copy đã tạo hoặc dữ liệu file đã import.

Workbook hoàn chỉnh nằm tại `downloads/3DTR_Quan_Ly_Kinh_Doanh_Thong_Minh.xlsx`.

## Chạy giao diện demo

Không cần cài package:

```powershell
python -m http.server 4173
```

Mở `http://localhost:4173/?demo=1`. Dữ liệu demo chỉ lưu trong `localStorage` của trình duyệt.

Kiểm tra mã nguồn:

```powershell
npm run check
```

## Kết nối Google Sheets

### 1. Tạo Google Sheet

1. Mở mẫu Google Sheet công khai ở trên hoặc tải `downloads/3DTR_Quan_Ly_Kinh_Doanh_Thong_Minh.xlsx` lên Google Drive.
2. Nếu dùng Excel, chọn **Mở bằng Google Sheets** để chuyển thành file Google Sheets riêng.
3. Trong 3DTR, cấp quyền Drive/Sheets rồi chọn file trong danh sách hoặc dán link vào **Import file**.
4. Để người khác dùng cùng file, chia sẻ file đó trong Google Drive với quyền Viewer hoặc Editor. Không cần làm công khai file dữ liệu.

### 2. Tạo Apps Script API

1. Trong Google Sheet, mở **Extensions → Apps Script**.
2. Thay nội dung `Code.gs` bằng file `apps-script/Code.gs`.
3. Trong Project Settings, bật hiển thị manifest và dùng nội dung `apps-script/appsscript.json`.
4. Mở **Project Settings → Script Properties**, tạo:
   - `SPREADSHEET_ID`: ID của Google Sheet.
   - `GOOGLE_CLIENT_ID`: OAuth Web Client ID ở bước tiếp theo.
5. Chọn **Deploy → New deployment → Web app**:
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Authorize script và sao chép URL `/exec`.

`Anyone` chỉ làm endpoint có thể nhận request. API vẫn xác minh Google ID token và quyền của email trên file trước khi đọc/ghi.

### 3. Tạo Google OAuth Web Client

1. Mở Google Cloud Console, chọn hoặc tạo project.
2. Cấu hình OAuth consent screen.
3. Tạo **OAuth client ID → Web application**.
4. Thêm Authorized JavaScript origins:
   - `http://localhost:4173` để kiểm thử local.
   - `https://TEN_GITHUB.github.io` cho GitHub Pages project site.
5. Không tạo hoặc commit client secret. Frontend chỉ cần OAuth Client ID công khai.

### 3.1. Nếu gặp lỗi 403 `access_denied`

Google Auth Platform đang ở trạng thái **Testing** thì chỉ các tài khoản trong **Audience → Test users** mới được đăng nhập. Thêm từng email Google sẽ sử dụng 3DTR (tối đa 100 tài khoản trước khi xác minh). Muốn mở cho người dùng bất kỳ, cần hoàn thiện Branding và gửi ứng dụng Google xét duyệt vì quyền Drive/Sheets là nhóm quyền nhạy cảm.

### 4. Cấu hình frontend

Sửa `config.js`:

```js
window.APP_CONFIG = Object.freeze({
  googleClientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
  apiUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  templateSpreadsheetId: "SPREADSHEET_ID_CUA_TEMPLATE",
  driveScopes: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
  spreadsheetName: "3DTR",
});
```

OAuth Client ID và Apps Script Web App URL không phải mật khẩu. Không đưa client secret, access token hoặc thông tin đăng nhập vào repository.

## Triển khai GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` tự kiểm tra và triển khai khi push lên nhánh `main`.

1. Tạo repository tên `3DTR`.
2. Push nhánh `main`.
3. Trong **Settings → Pages**, chọn **Source: GitHub Actions**.
4. Chờ workflow **Deploy GitHub Pages** hoàn tất.
5. Với project site, URL thường là `https://TEN_GITHUB.github.io/3DTR/`.

Nếu repository là private, kiểm tra gói GitHub có hỗ trợ Pages private repository hay không. Nếu dữ liệu riêng tư, repository có thể public vì workbook thực tế nằm trên Google Drive và `config.js` không chứa secret; tuy vậy hãy tự đánh giá chính sách nội bộ trước khi công khai mã nguồn.

## Cấu trúc

```text
3DTR/
├─ index.html
├─ styles.css
├─ app.js
├─ config.js
├─ apps-script/
│  ├─ Code.gs
│  └─ appsscript.json
├─ downloads/
│  └─ 3DTR_Quan_Ly_Kinh_Doanh_Thong_Minh.xlsx
└─ .github/workflows/deploy-pages.yml
```

## Kiến trúc quyền

```text
Google Sign-In → ID token → Apps Script xác minh token
                              ↓
                    Kiểm tra quyền Google Sheet
                    ↙                       ↘
             Editor / Owner             Viewer / Commenter
             xem + được ghi             chỉ xem, cấm ghi
```

Không dùng việc ẩn nút ở frontend làm cơ chế bảo mật. Kiểm tra quyền ghi luôn diễn ra lại trong `doPost` của Apps Script.
