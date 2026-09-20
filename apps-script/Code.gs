const ENTITY_CONFIG = Object.freeze({
  order: {
    sheet: "7_Đơn hàng", startRow: 4, keyColumn: 1,
    required: ["orderCode", "orderDate", "salesChannel", "platform", "status"],
    columns: [
      [1, "orderCode", "text"], [2, "orderDate", "date"], [3, "salesChannel", "text"], [4, "platform", "text"],
      [5, "sku", "text"], [6, "productName", "text"], [7, "customerId", "text"], [8, "quantity", "number"],
      [9, "unitPrice", "number"], [11, "platformFee", "number"], [12, "otherPaymentFee", "number"],
      [13, "customerShipping", "number"], [14, "sellerShipping", "number"], [15, "carrier", "text"],
      [16, "trackingCode", "text"], [21, "status", "text"], [22, "note", "text"],
    ],
  },
  customer: {
    sheet: "11_Khách hàng", startRow: 4, keyColumn: 1,
    required: ["customerId", "name"],
    columns: [[1,"customerId","text"],[2,"name","text"],[3,"phone","text"],[4,"email","text"],[5,"address","text"],[6,"province","text"],[7,"firstChannel","text"],[8,"firstPurchaseDate","date"],[12,"note","text"]],
  },
  product: {
    sheet: "9_Sản phẩm", startRow: 4, keyColumn: 1,
    required: ["sku", "productName", "productType", "status"],
    columns: [[1,"sku","text"],[2,"productName","text"],[3,"productType","text"],[4,"description","text"],[5,"listPrice","number"],[6,"referenceCost","number"],[7,"shopeeImageUrl","text"],[8,"tiktokImageUrl","text"],[9,"documentUrl","text"],[10,"barcode","text"],[11,"status","text"],[12,"note","text"]],
  },
  purchase: {
    sheet: "1_Mua vào", startRow: 5, keyColumn: 1,
    required: ["purchaseDate", "category", "itemName", "quantity", "unitCost"],
    columns: [[1,"purchaseDate","date"],[2,"category","text"],[3,"itemName","text"],[4,"model","text"],[5,"vendor","text"],[6,"quantity","number"],[7,"unitCost","number"],[9,"referenceSalePrice","number"],[10,"note","text"]],
  },
  filament: {
    sheet: "10_Kho nhựa", startRow: 4, keyColumn: 1,
    required: ["rollId", "purchaseDate", "material", "color", "brand", "weightKg", "rollCost"],
    columns: [[1,"rollId","text"],[2,"purchaseDate","date"],[3,"material","text"],[4,"color","text"],[5,"brand","text"],[6,"weightKg","number"],[7,"rollCost","number"],[10,"usedGrams","number"],[12,"purchaseUrl","text"],[13,"vendor","text"],[14,"location","text"],[15,"note","text"]],
  },
  investment: {
    sheet: "12_Đầu tư", startRow: 4, keyColumn: 1,
    required: ["purchaseDate", "category", "assetName", "quantity", "amount"],
    columns: [[1,"purchaseDate","date"],[2,"category","text"],[3,"assetName","text"],[4,"model","text"],[5,"quantity","number"],[6,"amount","number"],[7,"vendor","text"],[8,"invoiceUrl","text"],[9,"depreciationMonths","number"],[10,"note","text"]],
  },
  withdrawal: {
    sheet: "8_Rút tiền", startRow: 4, keyColumn: 1,
    required: ["withdrawDate", "platform", "referenceCode", "amount", "bank", "status"],
    columns: [[1,"withdrawDate","date"],[2,"platform","text"],[3,"referenceCode","text"],[4,"amount","number"],[5,"bank","text"],[6,"accountName","text"],[7,"processedDate","date"],[8,"status","text"],[10,"note","text"]],
  },
});

const STANDARD_SHEETS = Object.freeze([
  "1_Mua vào", "2_Tính giá", "3_Nhựa", "4_Phí sàn", "5_Danh mục", "6_Hướng dẫn",
  "7_Đơn hàng", "8_Rút tiền", "9_Sản phẩm", "10_Kho nhựa", "11_Khách hàng",
  "12_Đầu tư", "13_Tài khoản", "14_Dashboard", "15_Hãng nhựa",
]);

const DRIVE_SPREADSHEET_MIME = "application/vnd.google-apps.spreadsheet";
const OAUTH_SCOPES = "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets";

function doGet() {
  return json_({ ok: true, data: { service: "3DTR API", status: "ready" } });
}

function doPost(event) {
  try {
    const input = parseInput_(event);
    const user = verifyGoogleToken_(input.token);
    const accessToken = input.accessToken ? verifyAccessToken_(input.accessToken, user.email) : "";
    if (["files", "createCopy"].includes(input.action) && !accessToken) throw new Error("Cần cấp quyền Google Drive để chọn hoặc khởi tạo file.");
    if (["dashboard", "records", "submit", "session"].includes(input.action) && input.spreadsheetId && !accessToken) throw new Error("Cần cấp quyền Google Sheets cho file đã chọn.");
    if (input.spreadsheetId && accessToken && ["dashboard", "records", "submit", "session"].includes(input.action)) {
      const selected = spreadsheetMetadata_(accessToken, input.spreadsheetId);
      const role = selected.role;
      if (input.action === "session") return json_({ ok: true, data: { user, role, spreadsheetName: selected.name, spreadsheetId: selected.id, standard: selected.standard, missingSheets: selected.missingSheets } });
      if (role === "none") throw new Error("Tài khoản chưa được cấp quyền trên Google Sheet đã chọn.");
      let data;
      switch (input.action) {
        case "dashboard": data = dashboardApi_(accessToken, input.spreadsheetId); break;
        case "records": data = recordsApi_(accessToken, input.spreadsheetId, input.entity, input.limit); break;
        case "submit":
          if (role !== "editor") throw new Error("Tài khoản chỉ có quyền xem nên không thể thêm dữ liệu.");
          data = submitApi_(accessToken, input.spreadsheetId, input.entity, input.data, user);
          break;
        default: throw new Error("Hành động không hợp lệ.");
      }
      return json_({ ok: true, data });
    }
    if (input.action === "files") return json_({ ok: true, data: listSpreadsheets_(accessToken) });
    if (input.action === "createCopy") return json_({ ok: true, data: createTemplateCopy_(accessToken, input.templateId, input.name) });
    const role = getFileRole_(user.email);
    if (role === "none") throw new Error("Tài khoản chưa được cấp quyền trên Google Sheet 3DTR.");

    let data;
    switch (input.action) {
      case "session": data = { user, role, spreadsheetName: spreadsheet_().getName() }; break;
      case "dashboard": data = dashboard_(role); break;
      case "records": data = records_(input.entity, input.limit); break;
      case "submit":
        if (role !== "editor") throw new Error("Tài khoản chỉ có quyền xem nên không thể thêm dữ liệu.");
        data = submit_(input.entity, input.data, user);
        break;
      default: throw new Error("Hành động không hợp lệ.");
    }
    return json_({ ok: true, data });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parseInput_(event) {
  if (!event || !event.parameter || !event.parameter.payload) throw new Error("Thiếu payload.");
  const input = JSON.parse(event.parameter.payload);
  if (!input.token) throw new Error("Thiếu Google ID token.");
  return input;
}

function verifyAccessToken_(token, expectedEmail) {
  const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error("Quyền Google Drive/Sheets không hợp lệ hoặc đã hết hạn.");
  const claims = JSON.parse(response.getContentText());
  if (claims.email && String(claims.email).toLowerCase() !== String(expectedEmail).toLowerCase()) throw new Error("Tài khoản Google cấp quyền không khớp tài khoản đăng nhập.");
  if (claims.aud && claims.aud !== property_("GOOGLE_CLIENT_ID")) throw new Error("OAuth Client ID không khớp.");
  if (claims.scope && !String(claims.scope).includes("spreadsheets")) throw new Error("Thiếu quyền Google Sheets.");
  return token;
}

function googleApi_(accessToken, url, options) {
  const request = Object.assign({ muteHttpExceptions: true, headers: { Authorization: `Bearer ${accessToken}` } }, options || {});
  const response = UrlFetchApp.fetch(url, request);
  const body = response.getContentText();
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    let message = body;
    try { message = JSON.parse(body).error.message || message; } catch (error) {}
    throw new Error(`Google API: ${message}`);
  }
  return body ? JSON.parse(body) : {};
}

function listSpreadsheets_(accessToken) {
  const query = encodeURIComponent(`mimeType='${DRIVE_SPREADSHEET_MIME}' and trashed=false`);
  const fields = encodeURIComponent("files(id,name,modifiedTime,owners(displayName,emailAddress),capabilities(canEdit,canComment),webViewLink),nextPageToken");
  const result = googleApi_(accessToken, `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=100&orderBy=modifiedTime%20desc&fields=${fields}`);
  return (result.files || []).map((file) => ({
    id: file.id, name: file.name, modifiedTime: file.modifiedTime, webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
    canEdit: Boolean(file.capabilities && file.capabilities.canEdit), owner: file.owners && file.owners[0] ? file.owners[0].emailAddress : "",
  }));
}

function createTemplateCopy_(accessToken, templateId, requestedName) {
  const allowedTemplate = property_("TEMPLATE_SPREADSHEET_ID");
  if (!templateId || templateId !== allowedTemplate) throw new Error("Mẫu 3DTR không hợp lệ.");
  const name = String(requestedName || "").trim() || `3DTR - Bản riêng - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmm")}`;
  return googleApi_(accessToken, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(templateId)}/copy?supportsAllDrives=true`, {
    method: "post", contentType: "application/json", payload: JSON.stringify({ name, appProperties: { threeDtrTemplateId: templateId, threeDtrTemplateVersion: new Date().toISOString() } }),
  });
}

function spreadsheetMetadata_(accessToken, spreadsheetId) {
  const fields = encodeURIComponent("spreadsheetId,properties(title),sheets(properties(title)),spreadsheetUrl");
  const sheet = googleApi_(accessToken, `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?includeGridData=false&fields=${fields}`);
  const names = (sheet.sheets || []).map((item) => item.properties && item.properties.title).filter(Boolean);
  const missingSheets = STANDARD_SHEETS.filter((name) => !names.includes(name));
  const driveFields = encodeURIComponent("id,name,capabilities(canEdit,canComment),owners(emailAddress),permissions(emailAddress,role,type)");
  const file = googleApi_(accessToken, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(spreadsheetId)}?fields=${driveFields}`);
  const owner = file.owners && file.owners[0] ? file.owners[0].emailAddress : "";
  const me = String(verifyAccessTokenEmail_(accessToken) || "").toLowerCase();
  const direct = (file.permissions || []).find((permission) => String(permission.emailAddress || "").toLowerCase() === me);
  const role = owner.toLowerCase() === me || (file.capabilities && file.capabilities.canEdit) || (direct && ["owner", "writer"].includes(direct.role)) ? "editor" : (file.capabilities && file.capabilities.canComment) || direct ? "viewer" : "none";
  if (missingSheets.length) throw new Error(`File không đúng mẫu 3DTR. Thiếu sheet: ${missingSheets.join(", ")}.`);
  return { id: spreadsheetId, name: sheet.properties && sheet.properties.title, role, standard: true, missingSheets: [] };
}

function verifyAccessTokenEmail_(token) {
  const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) return "";
  const claims = JSON.parse(response.getContentText());
  return claims.email || "";
}

function sheetsValues_(accessToken, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
  return googleApi_(accessToken, url).values || [];
}

function dashboardApi_(accessToken, spreadsheetId) {
  const values = sheetsValues_(accessToken, spreadsheetId, "14_Dashboard!A3:I14");
  const metricMap = {};
  values.slice(1).forEach((row) => { if (row[0]) metricMap[String(row[0])] = row[1]; });
  const orderRows = sheetsValues_(accessToken, spreadsheetId, "7_Đơn hàng!A4:V").filter((row) => String(row[0] || "").trim()).slice(-6).reverse();
  return {
    metrics: {
      revenue: numeric_(metricMap["Tổng doanh thu sản phẩm (đ)"]), profit: numeric_(metricMap["Lợi nhuận ròng (đ)"]), orders: numeric_(metricMap["Số đơn hàng"]), customers: numeric_(metricMap["Số khách hàng"]), lowStock: numeric_(metricMap["Cuộn nhựa dưới 500 g"]), margin: numeric_(metricMap["Biên lợi nhuận ròng"]),
    },
    channels: values.slice(1, 8).filter((row) => row[3]).map((row) => ({ channel: row[3], revenue: numeric_(row[4]), profit: numeric_(row[5]) })),
    recentOrders: orderRows.map((row) => ({ code: row[0], platform: row[3], product: row[5], revenue: numeric_(row[9]), status: row[20] })),
  };
}

function recordsApi_(accessToken, spreadsheetId, entityKey, requestedLimit) {
  const cfg = entity_(entityKey);
  const width = entityWidth_(entityKey);
  const endColumn = columnName_(width);
  const rows = sheetsValues_(accessToken, spreadsheetId, `${cfg.sheet}!A${cfg.startRow - 1}:${endColumn}`);
  const headers = rows[0] || [];
  const data = rows.slice(1).filter((row) => String(row[0] || "").trim()).slice(-(Math.max(1, Math.min(Number(requestedLimit) || 25, 100)))).reverse();
  return { headers, rows: data };
}

function submitApi_(accessToken, spreadsheetId, entityKey, rawData, user) {
  if (entityKey === "order" && rawData && Array.isArray(rawData.lineItems)) return submitOrderApi_(accessToken, spreadsheetId, rawData, user);
  const cfg = entity_(entityKey);
  const data = rawData && typeof rawData === "object" ? rawData : {};
  cfg.required.forEach((key) => { if (data[key] === undefined || data[key] === null || String(data[key]).trim() === "") throw new Error(`Thiếu trường bắt buộc: ${key}.`); });
  const row = firstEmptyApiRow_(accessToken, spreadsheetId, cfg);
  const updates = cfg.columns.map(([column, key, type]) => ({ range: `${cfg.sheet}!${columnName_(column)}${row}`, values: [[coerce_(data[key], type)]] }));
  sheetsBatchUpdate_(accessToken, spreadsheetId, updates);
  return { row, sheet: cfg.sheet, id: String(data[cfg.columns[0][1]]), count: 1 };
}

function submitOrderApi_(accessToken, spreadsheetId, data, user) {
  const cfg = entity_("order");
  cfg.required.forEach((key) => { if (data[key] === undefined || data[key] === null || String(data[key]).trim() === "") throw new Error(`Thiếu trường bắt buộc: ${key}.`); });
  if (!data.lineItems.length || data.lineItems.length > 50) throw new Error("Đơn hàng phải có từ 1 đến 50 dòng chi tiết.");
  const updates = [];
  const rows = [];
  data.lineItems.forEach((line, index) => {
    if (!line || String(line.productName || "").trim() === "") throw new Error(`Thiếu tên ở dòng chi tiết ${index + 1}.`);
    if (!Number.isFinite(Number(line.quantity)) || Number(line.quantity) < 1) throw new Error(`Số lượng ở dòng ${index + 1} không hợp lệ.`);
    if (!Number.isFinite(Number(line.unitPrice)) || Number(line.unitPrice) < 0) throw new Error(`Giá bán ở dòng ${index + 1} không hợp lệ.`);
    const row = firstEmptyApiRow_(accessToken, spreadsheetId, cfg);
    rows.push(row);
    const rowData = { ...data, ...line, sku: line.sku || "", quantity: Number(line.quantity), unitPrice: Number(line.unitPrice), platformFee: index === 0 ? data.platformFee : 0, otherPaymentFee: index === 0 ? data.otherPaymentFee : 0, customerShipping: index === 0 ? data.customerShipping : 0, sellerShipping: index === 0 ? data.sellerShipping : 0, note: `[${line.itemType || "Sản phẩm"}] ${line.note || data.note || ""}`.trim() };
    cfg.columns.forEach(([column, key, type]) => updates.push({ range: `${cfg.sheet}!${columnName_(column)}${row}`, values: [[coerce_(rowData[key], type)]] }));
  });
  sheetsBatchUpdate_(accessToken, spreadsheetId, updates);
  return { row: rows[0], rows, count: rows.length, sheet: cfg.sheet, id: String(data.orderCode) };
}

function firstEmptyApiRow_(accessToken, spreadsheetId, cfg) {
  const values = sheetsValues_(accessToken, spreadsheetId, `${cfg.sheet}!A${cfg.startRow}:A2000`);
  const offset = values.findIndex((row) => !String(row[0] || "").trim());
  return cfg.startRow + (offset >= 0 ? offset : values.length);
}

function sheetsBatchUpdate_(accessToken, spreadsheetId, updates) {
  googleApi_(accessToken, `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`, { method: "post", contentType: "application/json", payload: JSON.stringify({ valueInputOption: "USER_ENTERED", data: updates }) });
}

function entityWidth_(key) { return key === "order" ? 22 : Math.max(...entity_(key).columns.map(([column]) => column)); }
function columnName_(column) { let name = ""; let current = Number(column); while (current > 0) { const remainder = (current - 1) % 26; name = String.fromCharCode(65 + remainder) + name; current = Math.floor((current - 1) / 26); } return name; }

function verifyGoogleToken_(token) {
  const clientId = property_("GOOGLE_CLIENT_ID");
  const cache = CacheService.getScriptCache();
  const cacheKey = `token:${Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).slice(0, 28)}`;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = UrlFetchApp.fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error("Google ID token không hợp lệ hoặc đã hết hạn.");
  const claims = JSON.parse(response.getContentText());
  if (claims.aud !== clientId) throw new Error("OAuth Client ID không khớp.");
  if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) throw new Error("Token issuer không hợp lệ.");
  if (String(claims.email_verified) !== "true") throw new Error("Email Google chưa được xác minh.");
  if (Number(claims.exp) * 1000 <= Date.now()) throw new Error("Phiên đăng nhập đã hết hạn.");
  const user = { email: String(claims.email || "").toLowerCase(), name: claims.name || claims.email, picture: claims.picture || "" };
  cache.put(cacheKey, JSON.stringify(user), 300);
  return user;
}

function getFileRole_(email) {
  const file = DriveApp.getFileById(property_("SPREADSHEET_ID"));
  try {
    const permission = file.getAccess(email);
    if (permission === DriveApp.Permission.OWNER || permission === DriveApp.Permission.EDIT) return "editor";
    if (permission === DriveApp.Permission.COMMENT || permission === DriveApp.Permission.VIEW) return "viewer";
  } catch (error) {
    // Fallback below covers files where direct permission lookup is unavailable.
  }
  const normalized = String(email).toLowerCase();
  try {
    if (String(file.getOwner().getEmail()).toLowerCase() === normalized) return "editor";
  } catch (error) {}
  if (file.getEditors().some((user) => String(user.getEmail()).toLowerCase() === normalized)) return "editor";
  if (file.getViewers().some((user) => String(user.getEmail()).toLowerCase() === normalized)) return "viewer";
  return "none";
}

function dashboard_() {
  const ss = spreadsheet_();
  const sheet = ss.getSheetByName("14_Dashboard");
  const values = sheet.getRange("A3:I14").getValues();
  const metricMap = {};
  values.slice(1).forEach((row) => { if (row[0]) metricMap[String(row[0])] = row[1]; });
  const channels = values.slice(1, 8).filter((row) => row[3]).map((row) => ({ channel: row[3], revenue: numeric_(row[4]), profit: numeric_(row[5]) }));
  return {
    metrics: {
      revenue: numeric_(metricMap["Tổng doanh thu sản phẩm (đ)"]),
      profit: numeric_(metricMap["Lợi nhuận ròng (đ)"]),
      orders: numeric_(metricMap["Số đơn hàng"]),
      customers: numeric_(metricMap["Số khách hàng"]),
      lowStock: numeric_(metricMap["Cuộn nhựa dưới 500 g"]),
      margin: numeric_(metricMap["Biên lợi nhuận ròng"]),
    },
    channels,
    recentOrders: recentOrders_(ss.getSheetByName("7_Đơn hàng"), 6),
  };
}

function recentOrders_(sheet, limit) {
  const rows = readRows_(sheet, 4, 22).slice(-limit).reverse();
  return rows.map((row) => ({ code: row[0], platform: row[3], product: row[5], revenue: numeric_(row[9]), status: row[20] }));
}

function records_(entityKey, requestedLimit) {
  const cfg = entity_(entityKey);
  const sheet = spreadsheet_().getSheetByName(cfg.sheet);
  const limit = Math.max(1, Math.min(Number(requestedLimit) || 25, 100));
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(cfg.startRow - 1, 1, 1, width).getDisplayValues()[0];
  const rows = readRows_(sheet, cfg.startRow, width).slice(-limit).reverse();
  return { headers, rows: rows.map((row) => row.map(displayValue_)) };
}

function submit_(entityKey, rawData, user) {
  if (entityKey === "order" && rawData && Array.isArray(rawData.lineItems)) return submitOrder_(rawData, user);
  const cfg = entity_(entityKey);
  const data = rawData && typeof rawData === "object" ? rawData : {};
  cfg.required.forEach((key) => {
    if (data[key] === undefined || data[key] === null || String(data[key]).trim() === "") throw new Error(`Thiếu trường bắt buộc: ${key}.`);
  });
  const sheet = spreadsheet_().getSheetByName(cfg.sheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const row = firstEmptyRow_(sheet, cfg.startRow, cfg.keyColumn);
    cfg.columns.forEach(([column, key, type]) => sheet.getRange(row, column).setValue(coerce_(data[key], type)));
    sheet.getRange(row, cfg.keyColumn).setNote(`Nhập từ web bởi ${user.email} lúc ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")}`);
    SpreadsheetApp.flush();
    return { row, sheet: cfg.sheet, id: String(data[cfg.columns[0][1]]) };
  } finally {
    lock.releaseLock();
  }
}

function submitOrder_(data, user) {
  const cfg = entity_("order");
  cfg.required.forEach((key) => {
    if (data[key] === undefined || data[key] === null || String(data[key]).trim() === "") throw new Error(`Thiếu trường bắt buộc: ${key}.`);
  });
  if (!data.lineItems.length || data.lineItems.length > 50) throw new Error("Đơn hàng phải có từ 1 đến 50 dòng chi tiết.");
  const sheet = spreadsheet_().getSheetByName(cfg.sheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rows = [];
    data.lineItems.forEach((line, index) => {
      if (!line || String(line.productName || "").trim() === "") throw new Error(`Thiếu tên ở dòng chi tiết ${index + 1}.`);
      if (!Number.isFinite(Number(line.quantity)) || Number(line.quantity) < 1) throw new Error(`Số lượng ở dòng ${index + 1} không hợp lệ.`);
      if (!Number.isFinite(Number(line.unitPrice)) || Number(line.unitPrice) < 0) throw new Error(`Giá bán ở dòng ${index + 1} không hợp lệ.`);
      const rowData = {
        ...data,
        ...line,
        sku: line.sku || "",
        productName: line.productName,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        platformFee: index === 0 ? data.platformFee : 0,
        otherPaymentFee: index === 0 ? data.otherPaymentFee : 0,
        customerShipping: index === 0 ? data.customerShipping : 0,
        sellerShipping: index === 0 ? data.sellerShipping : 0,
        note: `[${line.itemType || "Sản phẩm"}] ${line.note || data.note || ""}`.trim(),
      };
      const row = firstEmptyRow_(sheet, cfg.startRow, cfg.keyColumn);
      cfg.columns.forEach(([column, key, type]) => sheet.getRange(row, column).setValue(coerce_(rowData[key], type)));
      sheet.getRange(row, cfg.keyColumn).setNote(`Nhập từ web bởi ${user.email} lúc ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")}`);
      rows.push(row);
    });
    SpreadsheetApp.flush();
    return { row: rows[0], rows, count: rows.length, sheet: cfg.sheet, id: String(data.orderCode) };
  } finally {
    lock.releaseLock();
  }
}

function firstEmptyRow_(sheet, startRow, keyColumn) {
  const lastRow = Math.max(sheet.getLastRow(), startRow);
  const count = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, keyColumn, count, 1).getDisplayValues();
  const offset = values.findIndex((row) => !String(row[0]).trim());
  if (offset >= 0) return startRow + offset;
  const sourceRow = lastRow;
  sheet.insertRowAfter(lastRow);
  sheet.getRange(sourceRow, 1, 1, sheet.getLastColumn()).copyTo(sheet.getRange(sourceRow + 1, 1), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  ENTITY_CONFIG && Object.values(ENTITY_CONFIG).find((cfg) => cfg.sheet === sheet.getName()).columns.forEach(([column]) => sheet.getRange(sourceRow + 1, column).clearContent());
  return sourceRow + 1;
}

function readRows_(sheet, startRow, width) {
  const last = sheet.getLastRow();
  if (last < startRow) return [];
  return sheet.getRange(startRow, 1, last - startRow + 1, width).getValues().filter((row) => String(row[0]).trim() !== "");
}

function coerce_(value, type) {
  if (value === undefined || value === null || value === "") return "";
  if (type === "number") {
    const result = Number(value);
    if (!Number.isFinite(result)) throw new Error("Giá trị số không hợp lệ.");
    return result;
  }
  if (type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error("Ngày phải có định dạng YYYY-MM-DD và được chọn bằng lịch.");
    const result = new Date(`${String(value).slice(0, 10)}T00:00:00+07:00`);
    if (Number.isNaN(result.getTime())) throw new Error("Ngày không hợp lệ.");
    return result;
  }
  const text = String(value).trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function displayValue_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "dd/MM/yyyy");
  return value === null || value === undefined ? "" : value;
}
function numeric_(value) { const result = Number(value); return Number.isFinite(result) ? result : 0; }
function entity_(key) { const cfg = ENTITY_CONFIG[key]; if (!cfg) throw new Error("Loại dữ liệu không hợp lệ."); return cfg; }
function spreadsheet_() { return SpreadsheetApp.openById(property_("SPREADSHEET_ID")); }
function property_(key) { const value = PropertiesService.getScriptProperties().getProperty(key); if (!value) throw new Error(`Chưa cấu hình Script Property ${key}.`); return value; }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
