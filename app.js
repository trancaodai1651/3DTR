const config = window.APP_CONFIG || {};
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

const entities = {
  order: {
    label: "Đơn hàng",
    fields: [
      field("orderCode", "Mã đơn", "text", true, "VD: TTS-2026-001"),
      field("orderDate", "Ngày đơn", "date", true),
      select("salesChannel", "Kênh bán", ["Sàn TMĐT", "Facebook", "Zalo", "Website", "Khách quen", "Khác"], true),
      select("platform", "Sàn/Nền tảng", ["TikTok Shop", "Shopee", "Lazada", "Facebook", "Zalo", "Website", "Khác"], true),
      field("customerId", "Mã khách hàng", "text", false),
      field("platformFee", "Phí sàn", "number", false, "0", { min: 0, step: 100 }),
      field("otherPaymentFee", "Phí thanh toán khác", "number", false, "0", { min: 0, step: 100 }),
      field("customerShipping", "Ship khách trả", "number", false, "0", { min: 0, step: 1000 }),
      field("sellerShipping", "Ship mình trả", "number", false, "0", { min: 0, step: 1000 }),
      select("carrier", "Đơn vị vận chuyển", ["SPX", "GHN", "GHTK", "J&T Express", "Viettel Post", "VNPost", "Ninja Van", "Ahamove", "Grab", "Khác", "Tự giao"]),
      field("trackingCode", "Mã vận đơn", "text"),
      select("status", "Trạng thái đơn", ["Đang xử lý", "Đã giao", "Đã nhận tiền", "Đã hoàn", "Đã hủy"], true),
      textarea("note", "Ghi chú"),
    ],
  },
  customer: {
    label: "Khách hàng",
    fields: [
      field("customerId", "Mã khách hàng", "text", true, "VD: KH-0001"),
      field("name", "Tên khách hàng", "text", true),
      field("phone", "Số điện thoại", "tel"),
      field("email", "Email", "email"),
      field("address", "Địa chỉ", "text", false, "", { wide: true }),
      field("province", "Tỉnh/Thành phố", "text"),
      select("firstChannel", "Kênh đầu tiên", ["TikTok Shop", "Shopee", "Lazada", "Facebook", "Zalo", "Website", "Khách quen", "Khác"]),
      field("firstPurchaseDate", "Ngày đầu mua", "date"),
      textarea("note", "Ghi chú"),
    ],
  },
  product: {
    label: "Sản phẩm",
    fields: [
      field("sku", "Mã sản phẩm", "text", true, "VD: SP-LAMP-01"),
      field("productName", "Tên sản phẩm", "text", true),
      select("productType", "Loại sản phẩm", ["Đèn", "Đồ trang trí", "Móc khóa", "Flexi", "Đồ dùng", "Phụ kiện", "Khác"], true),
      textarea("description", "Mô tả sản phẩm"),
      field("listPrice", "Giá niêm yết", "number", false, "0", { min: 0, step: 1000 }),
      field("referenceCost", "COST tham chiếu", "number", false, "0", { min: 0, step: 100 }),
      field("shopeeImageUrl", "Link ảnh Shopee", "url", false, "https://", { wide: true }),
      field("tiktokImageUrl", "Link ảnh TikTok", "url", false, "https://", { wide: true }),
      field("documentUrl", "Link tài liệu", "url", false, "https://", { wide: true }),
      field("barcode", "SKU/Barcode", "text"),
      select("status", "Trạng thái", ["Đang bán", "Ngừng bán", "Sắp ra mắt", "Ẩn"], true),
      textarea("note", "Ghi chú"),
    ],
  },
  purchase: {
    label: "Mua vào",
    fields: [
      field("purchaseDate", "Ngày mua", "date", true),
      select("category", "Phân loại", ["Máy in", "Nhựa in", "Bàn in", "Đầu in", "Phụ kiện khác", "Dụng cụ", "Thiết bị / linh kiện"], true),
      field("itemName", "Tên sản phẩm/phụ kiện", "text", true),
      field("model", "Mô tả/Model", "text"),
      field("vendor", "Nhà cung cấp", "text"),
      field("quantity", "Số lượng", "number", true, "1", { min: 0, step: 1 }),
      field("unitCost", "Đơn giá mua", "number", true, "0", { min: 0, step: 1000 }),
      field("referenceSalePrice", "Giá bán tham chiếu", "number", false, "0", { min: 0, step: 1000 }),
      textarea("note", "Ghi chú"),
    ],
  },
  filament: {
    label: "Kho nhựa",
    fields: [
      field("rollId", "Mã cuộn", "text", true, "VD: PETG-BLK-001"),
      field("purchaseDate", "Ngày mua", "date", true),
      select("material", "Loại nhựa", ["PETG", "PETG-ECO", "PETG Technical", "PLA", "PLA+", "ABS", "ASA", "TPU", "Khác"], true),
      field("color", "Màu nhựa", "text", true),
      field("brand", "Hãng nhựa", "text", true),
      field("weightKg", "Khối lượng mua (kg)", "number", true, "1", { min: 0.01, step: 0.01 }),
      field("rollCost", "Giá mua/cuộn", "number", true, "0", { min: 0, step: 1000 }),
      field("usedGrams", "Đã dùng (g)", "number", false, "0", { min: 0, step: 1 }),
      field("purchaseUrl", "Link mua", "url", false, "https://", { wide: true }),
      field("vendor", "Nhà cung cấp", "text"),
      field("location", "Vị trí lưu kho", "text"),
      textarea("note", "Ghi chú"),
    ],
  },
  investment: {
    label: "Đầu tư",
    fields: [
      field("purchaseDate", "Ngày mua/đầu tư", "date", true),
      select("category", "Phân loại", ["Máy in", "Nhựa in", "Bàn in", "Đầu in", "Phụ kiện", "Dụng cụ", "Thiết bị / linh kiện", "Khác"], true),
      field("assetName", "Tài sản/hạng mục", "text", true),
      field("model", "Hãng/Model", "text"),
      field("quantity", "Số lượng", "number", true, "1", { min: 1, step: 1 }),
      field("amount", "Số tiền đầu tư", "number", true, "0", { min: 0, step: 1000 }),
      field("vendor", "Nhà cung cấp", "text"),
      field("invoiceUrl", "Link hóa đơn/Drive", "url", false, "https://", { wide: true }),
      field("depreciationMonths", "Tuổi khấu hao (tháng)", "number", false, "", { min: 1, step: 1 }),
      textarea("note", "Ghi chú"),
    ],
  },
  withdrawal: {
    label: "Rút tiền",
    fields: [
      field("withdrawDate", "Ngày rút", "date", true),
      select("platform", "Sàn/Kênh", ["TikTok Shop", "Shopee", "Lazada", "Facebook", "Zalo", "Website", "Khác"], true),
      field("referenceCode", "Mã giao dịch rút", "text", true),
      field("amount", "Số tiền rút", "number", true, "0", { min: 0, step: 1000 }),
      field("bank", "Ngân hàng nhận", "text", true),
      field("accountName", "Tên chủ tài khoản", "text"),
      field("processedDate", "Ngày tiền về", "date"),
      select("status", "Trạng thái", ["Đã về ngân hàng", "Đang xử lý", "Thất bại", "Đối soát"], true),
      textarea("note", "Ghi chú"),
    ],
  },
};

const state = {
  credential: "",
  accessToken: "",
  oauthClient: null,
  files: [],
  spreadsheetId: "",
  role: "none",
  user: null,
  entity: "order",
  demo: false,
  dashboard: null,
  orderLines: [newOrderLine()],
};

const el = Object.fromEntries([
  "welcomeView", "appView", "googleSignIn", "demoButton", "configHint", "connectionBadge", "logoutButton",
  "userAvatar", "userName", "userEmail", "roleBadge", "sheetName", "demoBanner", "viewerBanner", "entryPermission",
  "kpiGrid", "channelChart", "dashboardRecent", "refreshButton", "entityTabs", "entryForm", "formFields", "formMessage",
  "submitButton", "recordEntity", "recordsHead", "recordsBody", "recordsEmpty", "toast",
  "fileManager", "fileManagerMessage", "fileManagerRole", "sheetSelector", "authorizeDriveButton", "createSheetButton", "downloadTemplateButton", "sheetLinkInput", "importSheetButton",
].map((id) => [id, document.getElementById(id)]));

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderEntityControls();
  renderForm();
  bindEvents();
  if (new URLSearchParams(location.search).get("demo") === "1") return enterDemo();
  const ready = Boolean(config.googleClientId && config.apiUrl);
  el.configHint.textContent = ready
    ? "Đăng nhập bằng tài khoản đã được cấp quyền trên Google Sheet 3DTR."
    : "Chưa cấu hình Google OAuth/API. Bạn vẫn có thể xem demo giao diện.";
  if (!ready) return;
  waitForGoogleIdentity();
}

function waitForGoogleIdentity(attempt = 0) {
  if (window.google?.accounts?.id) {
    google.accounts.id.initialize({ client_id: config.googleClientId, callback: handleCredential });
    google.accounts.id.renderButton(el.googleSignIn, { theme: "outline", size: "large", shape: "pill", text: "signin_with", locale: "vi", width: 250 });
    return;
  }
  if (attempt < 50) setTimeout(() => waitForGoogleIdentity(attempt + 1), 120);
  else el.configHint.textContent = "Không tải được Google Identity Services. Hãy kiểm tra kết nối mạng.";
}

function bindEvents() {
  el.demoButton.addEventListener("click", enterDemo);
  el.logoutButton.addEventListener("click", logout);
  el.refreshButton.addEventListener("click", refreshAll);
  el.sheetSelector.addEventListener("change", () => selectSpreadsheet(el.sheetSelector.value));
  el.authorizeDriveButton.addEventListener("click", requestDriveAccessAndLoad);
  el.createSheetButton.addEventListener("click", createPersonalSheet);
  el.importSheetButton.addEventListener("click", importSheet);
  el.entryForm.addEventListener("submit", submitEntry);
  el.recordEntity.addEventListener("change", loadRecords);
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.view)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.go)));
}

function decodeCredential(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(decodeURIComponent(atob(payload).split("").map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join("")));
    return { name: claims.name || claims.email || "Người dùng Google", email: claims.email || "", picture: claims.picture || "" };
  } catch (error) {
    return { name: "Người dùng Google", email: "", picture: "" };
  }
}

function requestGoogleDriveAccess({ prompt = "consent" } = {}) {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) return reject(new Error("Google OAuth chưa sẵn sàng. Hãy tải lại trang."));
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Cửa sổ cấp quyền Google chưa hoàn tất. Hãy cho phép cửa sổ bật lên rồi bấm Cấp quyền Drive/Sheets để thử lại."));
    }, 15000);
    state.oauthClient = google.accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: config.driveScopes || "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
      callback: (response) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (response.error) return reject(new Error(response.error === "access_denied" ? "Bạn chưa cấp quyền Google Drive/Sheets cho 3DTR." : "Không thể cấp quyền Google Drive/Sheets cho 3DTR."));
        state.accessToken = response.access_token;
        resolve(response);
      },
    });
    state.oauthClient.requestAccessToken({ prompt });
  });
}

function importedFilesKey() {
  return `3dtr-imported-files-${String(state.user?.email || "anonymous").toLowerCase()}`;
}

function rememberedFileIds() {
  try { return JSON.parse(localStorage.getItem(importedFilesKey()) || "[]").filter((id) => /^[a-zA-Z0-9_-]{20,}$/.test(id)); } catch (error) { return []; }
}

function rememberFileId(id) {
  if (!id) return;
  const ids = [id, ...rememberedFileIds().filter((item) => item !== id)].slice(0, 30);
  localStorage.setItem(importedFilesKey(), JSON.stringify(ids));
}

async function loadFiles() {
  const files = await api("files");
  state.files = (Array.isArray(files) ? files : []).filter((file) => file.id !== config.templateSpreadsheetId);
  const known = new Set(state.files.map((file) => file.id));
  rememberedFileIds().filter((id) => !known.has(id)).forEach((id) => state.files.push({ id, name: "File đã import — chọn để kiểm tra", canEdit: false, remembered: true }));
  renderFileManager();
  if (!state.files.length) el.fileManagerMessage.textContent = "Chưa có Google Sheet nào được cấp quyền. Hãy tải mẫu công khai, chuyển thành Google Sheet rồi dán link để import, hoặc bấm Tạo bản Google Sheet riêng.";
}

function renderFileManager() {
  if (!el.sheetSelector) return;
  el.sheetSelector.innerHTML = state.files.length
    ? state.files.map((file) => `<option value="${escapeHtml(file.id)}">${escapeHtml(file.name)}${file.remembered ? " · cần kiểm tra quyền" : file.canEdit ? " · Editor" : " · Viewer"}</option>`).join("")
    : "<option value=\"\">Chưa có file Google Sheet chuẩn</option>";
  el.sheetSelector.value = state.spreadsheetId || state.files[0]?.id || "";
  el.fileManagerRole.textContent = state.role === "editor" ? "Editor" : state.role === "viewer" ? "Viewer" : "Chưa chọn";
  el.fileManagerRole.className = `badge${state.role === "none" ? " badge-muted" : ""}`;
  el.createSheetButton.disabled = !state.accessToken;
  el.authorizeDriveButton.disabled = !state.credential;
  el.importSheetButton.disabled = !state.accessToken;
}

async function selectSpreadsheet(spreadsheetId) {
  if (!spreadsheetId) return;
  try {
    const session = await api("session", { spreadsheetId });
    if (!session.standard) throw new Error("File không đúng cấu trúc chuẩn 3DTR.");
    state.spreadsheetId = spreadsheetId;
    rememberFileId(spreadsheetId);
    state.role = session.role;
    el.sheetName.textContent = session.spreadsheetName || state.files.find((file) => file.id === spreadsheetId)?.name || "Google Sheet 3DTR";
    el.viewerBanner.classList.toggle("hidden", state.role !== "viewer");
    el.roleBadge.textContent = state.role === "editor" ? "Editor" : "Viewer";
    el.entryPermission.textContent = state.role === "editor" ? "Có quyền chỉnh sửa" : "Chỉ xem";
    el.submitButton.disabled = state.role !== "editor";
    renderForm();
    setConnection(state.role === "editor" ? "Đã kết nối · Editor" : "Đã kết nối · Viewer", state.role);
    renderFileManager();
    await refreshAll();
    return true;
  } catch (error) {
    state.role = "none";
    renderFileManager();
    toast(error.message, true);
    el.fileManagerMessage.textContent = `${error.message} Chỉ file có đủ 15 sheet chuẩn mới được sử dụng.`;
    return false;
  }
}

function extractSpreadsheetId(value) {
  const input = String(value || "").trim();
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/) || input.match(/^([a-zA-Z0-9_-]{20,})$/);
  return match ? match[1] : "";
}

async function importSheet() {
  const id = extractSpreadsheetId(el.sheetLinkInput.value);
  if (!id) return toast("Hãy dán link Google Sheet hoặc ID file hợp lệ.", true);
  if (!state.accessToken) return toast("Hãy bấm Cấp quyền Drive/Sheets trước khi import.", true);
  el.importSheetButton.disabled = true;
  const selected = await selectSpreadsheet(id);
  el.importSheetButton.disabled = !state.accessToken;
  if (selected) {
    if (!state.files.some((file) => file.id === id)) state.files.unshift({ id, name: el.sheetName.textContent || "Google Sheet đã import", canEdit: state.role === "editor" });
    renderFileManager();
    el.sheetLinkInput.value = "";
    toast("Đã import file Google Sheet và ghi nhớ cho lần đăng nhập sau.");
  }
}

async function requestDriveAccessAndLoad() {
  if (!state.credential) return toast("Hãy đăng nhập Google trước.", true);
  el.authorizeDriveButton.disabled = true;
  setConnection("Đang xin quyền Drive…", "muted");
  try {
    await requestGoogleDriveAccess({ prompt: "consent" });
    await loadFiles();
    setConnection(state.spreadsheetId ? (state.role === "editor" ? "Đã kết nối · Editor" : "Đã kết nối · Viewer") : "Đã đăng nhập · chọn file", "muted");
    if (!state.spreadsheetId && state.files[0]) await selectSpreadsheet(state.files[0].id);
  } catch (error) {
    setConnection("Đã đăng nhập · cần quyền Drive", "muted");
    el.fileManagerMessage.textContent = `${error.message} Bạn vẫn có thể dùng nút này để cấp quyền lại.`;
    toast(error.message, true);
  } finally {
    el.authorizeDriveButton.disabled = !state.credential;
  }
}

async function createPersonalSheet() {
  if (!state.accessToken) return toast("Hãy đăng nhập và cấp quyền Google Drive trước.", true);
  el.createSheetButton.disabled = true;
  try {
    const name = `3DTR - ${state.user?.name || "Bản riêng"} - ${new Date().toISOString().slice(0, 10)}`;
    const created = await api("createCopy", { templateId: config.templateSpreadsheetId, name });
    await loadFiles();
    await selectSpreadsheet(created.id);
    toast("Đã tạo bản Google Sheet riêng trong Drive của bạn.");
  } catch (error) {
    toast(error.message, true);
  } finally {
    el.createSheetButton.disabled = !state.accessToken;
  }
}

async function handleCredential(response) {
  state.credential = response.credential;
  setConnection("Đang xác thực…", "muted");
  try {
    state.user = decodeCredential(response.credential);
    state.demo = false;
    enterApp("Chưa chọn file 3DTR");
    el.fileManagerMessage.textContent = "Đăng nhập thành công. Bấm Cấp quyền Drive/Sheets để tải danh sách file bạn được chia sẻ.";
    await requestDriveAccessAndLoad();
  } catch (error) {
    setConnection("Không có quyền", "muted");
    toast(error.message, true);
  }
}

function enterDemo() {
  state.demo = true;
  state.role = "editor";
  state.user = { name: "Người dùng Demo", email: "demo@3dtr.local", picture: "" };
  enterApp("3DTR Demo");
  el.fileManager.classList.add("hidden");
  state.dashboard = demoDashboard();
  renderDashboard(state.dashboard);
  loadRecords();
}

function enterApp(sheetName) {
  el.welcomeView.classList.add("hidden");
  el.appView.classList.remove("hidden");
  el.logoutButton.classList.remove("hidden");
  el.demoBanner.classList.toggle("hidden", !state.demo);
  el.viewerBanner.classList.toggle("hidden", state.role !== "viewer");
  el.userName.textContent = state.user?.name || "Người dùng Google";
  el.userEmail.textContent = state.user?.email || "";
  el.userAvatar.textContent = initials(state.user?.name || "3DTR");
  el.roleBadge.textContent = state.role === "editor" ? "Editor" : "Viewer";
  el.sheetName.textContent = sheetName || "Google Sheet 3DTR";
  el.entryPermission.textContent = state.role === "editor" ? "Có quyền chỉnh sửa" : "Chỉ xem";
  el.submitButton.disabled = state.role !== "editor";
  el.submitButton.textContent = state.demo ? "Lưu bản demo" : "Thêm vào Google Sheets";
  setConnection(state.demo ? "Chế độ demo" : state.role === "editor" ? "Đã kết nối · Editor" : "Đã kết nối · Viewer", state.role);
  renderForm();
  el.fileManager.classList.remove("hidden");
  renderFileManager();
}

function logout() {
  state.credential = "";
  state.accessToken = "";
  state.files = [];
  state.spreadsheetId = "";
  state.role = "none";
  state.user = null;
  state.demo = false;
  window.google?.accounts?.id?.disableAutoSelect();
  el.appView.classList.add("hidden");
  el.welcomeView.classList.remove("hidden");
  el.logoutButton.classList.add("hidden");
  el.fileManager.classList.add("hidden");
  setConnection("Chưa kết nối", "muted");
  showPanel("dashboard");
}

function renderEntityControls() {
  el.entityTabs.innerHTML = "";
  el.recordEntity.innerHTML = "";
  Object.entries(entities).forEach(([key, entity]) => {
    const tab = document.createElement("button");
    tab.className = `entity-tab${key === state.entity ? " active" : ""}`;
    tab.type = "button";
    tab.textContent = entity.label;
    tab.addEventListener("click", () => {
      state.entity = key;
      renderEntityControls();
      renderForm();
    });
    el.entityTabs.append(tab);
    const option = document.createElement("option");
    option.value = key;
    option.textContent = entity.label;
    el.recordEntity.append(option);
  });
  el.recordEntity.value = state.entity;
}

function renderForm() {
  if (state.entity === "order") return renderOrderForm();
  el.formFields.innerHTML = "";
  entities[state.entity].fields.forEach((definition) => {
    const wrapper = document.createElement("div");
    wrapper.className = `field${definition.full ? " full" : definition.wide ? " wide" : ""}`;
    const label = document.createElement("label");
    label.htmlFor = `field-${definition.key}`;
    label.innerHTML = `${escapeHtml(definition.label)}${definition.required ? "<i>*</i>" : ""}`;
    let input;
    if (definition.kind === "select") {
      input = document.createElement("select");
      input.innerHTML = `<option value="">Chọn…</option>${definition.options.map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
    } else if (definition.kind === "textarea") {
      input = document.createElement("textarea");
      input.placeholder = "Nhập ghi chú nếu có";
    } else {
      input = document.createElement("input");
      input.type = definition.type;
      input.placeholder = definition.placeholder || "";
      if (definition.min !== undefined) input.min = definition.min;
      if (definition.step !== undefined) input.step = definition.step;
    }
    input.id = `field-${definition.key}`;
    input.name = definition.key;
    input.required = Boolean(definition.required);
    input.autocomplete = "off";
    wrapper.append(label, input);
    el.formFields.append(wrapper);
  });
  el.formMessage.className = "form-message";
  el.formMessage.textContent = state.role === "viewer" ? "Tài khoản Viewer không thể gửi biểu mẫu." : "Các trường có dấu * là bắt buộc.";
}

function newOrderLine() {
  return { itemType: "Sản phẩm", sku: "", productName: "", quantity: "1", unitPrice: "0", note: "" };
}

function renderOrderForm() {
  el.formFields.innerHTML = "";
  entities.order.fields.forEach((definition) => appendField(el.formFields, definition));
  const heading = document.createElement("div");
  heading.className = "order-lines-heading full";
  heading.innerHTML = `<div><strong>Chi tiết đơn hàng</strong><small>Mỗi dòng là một sản phẩm, loại nhựa hoặc phụ kiện. Tất cả dùng chung mã đơn.</small></div><button type="button" class="button button-ghost" id="addOrderLine">+ Thêm dòng</button>`;
  el.formFields.append(heading);
  const lines = document.createElement("div");
  lines.id = "orderLines";
  lines.className = "order-lines full";
  el.formFields.append(lines);
  state.orderLines.forEach((line, index) => appendOrderLine(lines, line, index));
  document.getElementById("addOrderLine").addEventListener("click", () => {
    state.orderLines.push(newOrderLine());
    renderOrderForm();
  });
  el.formMessage.className = "form-message";
  el.formMessage.textContent = state.role === "viewer"
    ? "Tài khoản Viewer không thể gửi biểu mẫu."
    : "Ngày chỉ chọn bằng lịch. Phí sàn và phí vận chuyển chỉ ghi một lần ở dòng đầu tiên.";
}

function appendOrderLine(container, line, index) {
  const card = document.createElement("div");
  card.className = "order-line-card";
  card.innerHTML = `<div class="order-line-title"><strong>Dòng ${index + 1}</strong>${index ? `<button type="button" class="text-button remove-order-line" data-index="${index}">Xóa</button>` : "<span>Dòng chính</span>"}</div>`;
  const grid = document.createElement("div");
  grid.className = "order-line-grid";
  const definitions = [
    select("itemType", "Loại dòng", ["Sản phẩm", "Nhựa", "Phụ kiện máy in"], true),
    field("sku", "Mã SP / mã vật tư", "text", false, "VD: SP-LAMP-01"),
    field("productName", "Tên sản phẩm / loại nhựa / phụ kiện", "text", true),
    field("quantity", "Số lượng", "number", true, "1", { min: 1, step: 1 }),
    field("unitPrice", "Giá bán dòng", "number", true, "0", { min: 0, step: 1000 }),
    field("note", "Ghi chú dòng", "text", false, "Màu, size, yêu cầu riêng"),
  ];
  definitions.forEach((definition) => {
    const wrapper = document.createElement("div");
    wrapper.className = `field${definition.key === "productName" || definition.key === "note" ? " wide" : ""}`;
    const label = document.createElement("label");
    label.htmlFor = `order-line-${definition.key}-${index}`;
    label.innerHTML = `${escapeHtml(definition.label)}${definition.required ? "<i>*</i>" : ""}`;
    let input;
    if (definition.kind === "select") {
      input = document.createElement("select");
      input.innerHTML = `<option value="">Chọn…</option>${definition.options.map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
    } else {
      input = document.createElement("input");
      input.type = definition.type;
      input.placeholder = definition.placeholder || "";
      if (definition.min !== undefined) input.min = definition.min;
      if (definition.step !== undefined) input.step = definition.step;
    }
    input.id = `order-line-${definition.key}-${index}`;
    input.dataset.lineKey = definition.key;
    input.dataset.lineIndex = String(index);
    input.value = line[definition.key] ?? "";
    input.required = Boolean(definition.required);
    input.autocomplete = "off";
    wrapper.append(label, input);
    grid.append(wrapper);
  });
  card.append(grid);
  container.append(card);
  card.querySelectorAll("[data-line-key]").forEach((input) => input.addEventListener("input", () => {
    state.orderLines[index][input.dataset.lineKey] = input.value;
  }));
  const remove = card.querySelector(".remove-order-line");
  if (remove) remove.addEventListener("click", () => {
    state.orderLines.splice(index, 1);
    renderOrderForm();
  });
}

function appendField(parent, definition) {
  const wrapper = document.createElement("div");
  wrapper.className = `field${definition.full ? " full" : definition.wide ? " wide" : ""}`;
  const label = document.createElement("label");
  label.htmlFor = `field-${definition.key}`;
  label.innerHTML = `${escapeHtml(definition.label)}${definition.required ? "<i>*</i>" : ""}`;
  let input;
  if (definition.kind === "select") {
    input = document.createElement("select");
    input.innerHTML = `<option value="">Chọn…</option>${definition.options.map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
  } else if (definition.kind === "textarea") {
    input = document.createElement("textarea");
    input.placeholder = "Nhập ghi chú nếu có";
  } else {
    input = document.createElement("input");
    input.type = definition.type;
    input.placeholder = definition.placeholder || "";
    if (definition.min !== undefined) input.min = definition.min;
    if (definition.step !== undefined) input.step = definition.step;
  }
  input.id = `field-${definition.key}`;
  input.name = definition.key;
  input.required = Boolean(definition.required);
  input.autocomplete = "off";
  wrapper.append(label, input);
  parent.append(wrapper);
}

async function submitEntry(event) {
  event.preventDefault();
  if (state.role !== "editor") return showFormMessage("Tài khoản của bạn chỉ có quyền xem.", true);
  if (!el.entryForm.reportValidity()) return;
  const invalidDate = [...el.entryForm.querySelectorAll('input[type="date"]')].some((input) => input.value && !/^\d{4}-\d{2}-\d{2}$/.test(input.value));
  if (invalidDate) return showFormMessage("Ngày không hợp lệ. Hãy chọn ngày bằng lịch.", true);
  const data = state.entity === "order" ? buildOrderPayload() : Object.fromEntries(new FormData(el.entryForm).entries());
  if (!data) return;
  const numberKeys = entities[state.entity].fields.filter((item) => item.type === "number").map((item) => item.key);
  numberKeys.forEach((key) => { if (data[key] !== "") data[key] = Number(data[key]); });
  el.submitButton.disabled = true;
  showFormMessage("Đang lưu dữ liệu…");
  try {
    const result = state.demo ? saveDemoRecord(state.entity, data) : await api("submit", { entity: state.entity, data });
    showFormMessage(`Đã lưu ${entities[state.entity].label.toLowerCase()} tại ${result.count || 1} dòng dữ liệu.`, false, true);
    el.entryForm.reset();
    if (state.entity === "order") state.orderLines = [newOrderLine()];
    toast("Đã thêm dữ liệu thành công.");
    await refreshAll();
  } catch (error) {
    showFormMessage(error.message, true);
    toast(error.message, true);
  } finally {
    el.submitButton.disabled = state.role !== "editor";
  }
}

function buildOrderPayload() {
  const shared = Object.fromEntries(new FormData(el.entryForm).entries());
  const lines = state.orderLines.map((line) => ({ ...line }));
  if (!lines.length || lines.some((line) => !String(line.productName).trim() || Number(line.quantity) < 1 || Number(line.unitPrice) < 0)) {
    showFormMessage("Mỗi dòng đơn phải có tên, số lượng và giá bán hợp lệ.", true);
    return null;
  }
  ["platformFee", "otherPaymentFee", "customerShipping", "sellerShipping"].forEach((key) => {
    if (shared[key] !== "") shared[key] = Number(shared[key]);
  });
  lines.forEach((line) => {
    line.quantity = Number(line.quantity);
    line.unitPrice = Number(line.unitPrice);
  });
  return { ...shared, lineItems: lines };
}

async function refreshAll() {
  if (!state.demo && !state.spreadsheetId) {
    renderDashboard({ metrics: {}, channels: [], recentOrders: [] });
    return;
  }
  el.refreshButton.disabled = true;
  try {
    const result = state.demo ? demoDashboard() : await api("dashboard");
    state.dashboard = result;
    renderDashboard(result);
    await loadRecords();
  } catch (error) {
    toast(error.message, true);
  } finally {
    el.refreshButton.disabled = false;
  }
}

function renderDashboard(data) {
  const metrics = data.metrics || {};
  const cards = [
    ["Doanh thu", moneyValue(metrics.revenue), "Tổng doanh thu sản phẩm"],
    ["Lợi nhuận ròng", moneyValue(metrics.profit), "Sau phí, ship và COST"],
    ["Số đơn hàng", integer.format(number(metrics.orders)), "Bản ghi có mã đơn"],
    ["Cuộn sắp hết", integer.format(number(metrics.lowStock)), "Tồn dưới 500 g"],
  ];
  el.kpiGrid.innerHTML = cards.map(([label, value, note]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  const channels = data.channels || [];
  const max = Math.max(1, ...channels.map((item) => number(item.revenue)));
  el.channelChart.innerHTML = channels.length
    ? channels.map((item) => `<div class="bar-row"><span class="bar-label">${escapeHtml(item.channel)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(1.5, number(item.revenue) / max * 100)}%"></div></div><span class="bar-value">${compactMoney(item.revenue)}</span></div>`).join("")
    : `<div class="empty-compact">Chưa có dữ liệu theo kênh.</div>`;
  const recent = data.recentOrders || [];
  el.dashboardRecent.innerHTML = recent.length
    ? recent.slice(0, 6).map((row) => `<div class="compact-item"><div><strong>${escapeHtml(row.code || "Chưa có mã")}</strong><span>${escapeHtml(row.platform || "—")} · ${escapeHtml(row.product || "—")}</span></div><b>${moneyValue(row.revenue)}</b></div>`).join("")
    : `<div class="empty-compact">Chưa có đơn hàng.</div>`;
}

async function loadRecords() {
  const entity = el.recordEntity.value || state.entity;
  state.entity = entity;
  let result;
  try {
    result = state.demo ? demoRecords(entity) : await api("records", { entity, limit: 25 });
  } catch (error) {
    toast(error.message, true);
    return;
  }
  const headers = result.headers || [];
  const rows = result.rows || [];
  el.recordsHead.innerHTML = `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>`;
  el.recordsBody.innerHTML = rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(formatCell(value))}</td>`).join("")}</tr>`).join("");
  el.recordsEmpty.classList.toggle("hidden", rows.length > 0);
}

async function api(action, args = {}) {
  if (!config.apiUrl) throw new Error("Chưa cấu hình URL Apps Script trong config.js.");
  const body = new URLSearchParams({ payload: JSON.stringify({ action, token: state.credential, accessToken: state.accessToken, spreadsheetId: state.spreadsheetId, ...args }) });
  const response = await fetch(config.apiUrl, { method: "POST", body, redirect: "follow" });
  if (!response.ok) throw new Error(`API trả về HTTP ${response.status}.`);
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Không thể xử lý yêu cầu.");
  return result.data;
}

function showPanel(name) {
  const panels = { dashboard: "dashboardPanel", entry: "entryPanel", records: "recordsPanel", guide: "guidePanel" };
  Object.entries(panels).forEach(([key, id]) => document.getElementById(id).classList.toggle("hidden", key !== name));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  if (name === "records") loadRecords();
  scrollTo({ top: 0, behavior: "smooth" });
}

function setConnection(text, role) {
  el.connectionBadge.textContent = text;
  el.connectionBadge.className = `badge${role === "muted" ? " badge-muted" : ""}`;
}

function showFormMessage(message, isError = false, isSuccess = false) {
  el.formMessage.textContent = message;
  el.formMessage.className = `form-message${isError ? " error" : isSuccess ? " success" : ""}`;
}

let toastTimer;
function toast(message, isError = false) {
  clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.className = `toast show${isError ? " error" : ""}`;
  toastTimer = setTimeout(() => { el.toast.className = "toast"; }, 3600);
}

function saveDemoRecord(entity, data) {
  const key = `3dtr-demo-${entity}`;
  const records = JSON.parse(localStorage.getItem(key) || "[]");
  if (entity === "order" && Array.isArray(data.lineItems)) {
    data.lineItems.forEach((line, index) => records.push({ ...data, ...line, lineItems: undefined, platformFee: index === 0 ? data.platformFee : 0, otherPaymentFee: index === 0 ? data.otherPaymentFee : 0, customerShipping: index === 0 ? data.customerShipping : 0, sellerShipping: index === 0 ? data.sellerShipping : 0, _createdAt: new Date().toISOString() }));
  } else {
    records.push({ ...data, _createdAt: new Date().toISOString() });
  }
  localStorage.setItem(key, JSON.stringify(records.slice(-50)));
  return { row: records.length + 3, count: entity === "order" && Array.isArray(data.lineItems) ? data.lineItems.length : 1 };
}

function demoRecords(entity) {
  const records = JSON.parse(localStorage.getItem(`3dtr-demo-${entity}`) || "[]").reverse();
  const fields = entities[entity].fields.slice(0, 7);
  return { headers: fields.map((item) => item.label), rows: records.map((record) => fields.map((item) => record[item.key] ?? "")) };
}

function demoDashboard() {
  const demoOrders = JSON.parse(localStorage.getItem("3dtr-demo-order") || "[]");
  const base = demoOrders.length ? demoOrders : [
    { orderCode: "TTS-260920-01", platform: "TikTok Shop", productName: "Đèn ngủ Voronoi", quantity: 2, unitPrice: 189000, platformFee: 43000, sellerShipping: 18000 },
    { orderCode: "SHP-260919-04", platform: "Shopee", productName: "Móc khóa Flexi", quantity: 6, unitPrice: 49000, platformFee: 51000, sellerShipping: 12000 },
    { orderCode: "WEB-260918-02", platform: "Website", productName: "Kệ tay cầm", quantity: 1, unitPrice: 329000, platformFee: 0, sellerShipping: 25000 },
  ];
  const totals = demoOrders.map((item) => number(item.quantity) * number(item.unitPrice));
  const revenue = totals.reduce((a, b) => a + b, 0) || 1001000;
  const profit = demoOrders.length ? Math.round(revenue * .42) : 426000;
  const channelMap = new Map();
  base.forEach((item) => channelMap.set(item.platform || "Khác", (channelMap.get(item.platform || "Khác") || 0) + number(item.quantity) * number(item.unitPrice)));
  return {
    metrics: { revenue, profit, orders: base.length, lowStock: 2 },
    channels: ["TikTok Shop", "Shopee", "Website", "Facebook", "Zalo"].map((channel) => ({ channel, revenue: channelMap.get(channel) || 0, profit: Math.round((channelMap.get(channel) || 0) * .42) })),
    recentOrders: base.slice().reverse().map((row) => ({ code: row.orderCode, platform: row.platform, product: row.productName, revenue: number(row.quantity) * number(row.unitPrice) })),
  };
}

function field(key, label, type = "text", required = false, placeholder = "", options = {}) { return { key, label, type, kind: "input", required, placeholder, ...options }; }
function select(key, label, options, required = false) { return { key, label, kind: "select", options, required }; }
function textarea(key, label) { return { key, label, kind: "textarea", full: true }; }
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function moneyValue(value) { return money.format(number(value)); }
function compactMoney(value) { return `${integer.format(number(value) / 1000)}k`; }
function initials(value) { return value.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase() || "").join(""); }
function formatCell(value) { if (value === null || value === undefined) return ""; if (typeof value === "number") return integer.format(value); return String(value); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
