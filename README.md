# 🚀 MCP Google Drive Server

<div align="center">

![MCP Google Drive](https://img.shields.io/badge/MCP-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Kết nối AI Assistant với Google Drive của bạn thông qua Model Context Protocol (MCP)**

*Connect your AI Assistant to Google Drive via Model Context Protocol (MCP)*

[Tiếng Việt](#-hướng-dẫn-tiếng-việt) • [English](#-english-guide)

</div>

---

## 📖 Hướng dẫn Tiếng Việt

### MCP Google Drive là gì?

**MCP Google Drive** là một server tuân theo chuẩn **Model Context Protocol (MCP)** — giao thức cho phép các AI Assistant (như Antigravity IDE, Claude Code, Claude Desktop) **đọc, ghi, tìm kiếm và quản lý file** trên Google Drive của bạn trực tiếp qua chat.

Sau khi cài đặt, bạn có thể nói chuyện với AI như:
> _"Hãy tạo file tóm tắt cuộc họp hôm nay và lưu vào thư mục 'Work' trên Drive của tôi"_
> _"Đọc nội dung file report.txt trong Drive và phân tích giúp tôi"_
> _"Tìm tất cả file Excel trong Drive có tên chứa 'báo cáo'"_

### ✨ Tính năng

| Tool | Mô tả |
|------|-------|
| `gdrive_list` | Liệt kê file/folder trong thư mục bất kỳ |
| `gdrive_create_folder` | Tạo thư mục mới |
| `gdrive_read_file` | Đọc nội dung file (hỗ trợ Google Docs, Sheets, CSV, text) |
| `gdrive_write_file` | Tạo file mới với nội dung |
| `gdrive_update_file` | Cập nhật nội dung file có sẵn |
| `gdrive_delete_file` | Xóa file/folder (chuyển vào thùng rác hoặc xóa vĩnh viễn) |
| `gdrive_search` | Tìm kiếm file theo tên, loại, v.v. |

---

### 📋 Yêu cầu trước khi cài đặt

- [Node.js](https://nodejs.org/) **v18 trở lên**
- Tài khoản Google
- Đã cài **Antigravity IDE** hoặc **Claude Code** / **Claude Desktop**

---

### 🔧 Bước 1: Lấy Google OAuth Credentials

Đây là bước quan trọng nhất. Bạn cần tạo thông tin xác thực OAuth 2.0 từ Google Cloud Console.

#### 1.1. Vào Google Cloud Console

1. Truy cập [https://console.cloud.google.com](https://console.cloud.google.com)
2. Đăng nhập bằng tài khoản Google của bạn
3. Tạo Project mới hoặc chọn project hiện có

#### 1.2. Bật Google Drive API

1. Trong menu bên trái, chọn **"APIs & Services"** → **"Library"**
2. Tìm kiếm **"Google Drive API"**
3. Click vào kết quả và nhấn **"Enable"** (Bật)

#### 1.3. Tạo OAuth 2.0 Credentials

1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Nếu được yêu cầu cấu hình **OAuth consent screen**:
   - Chọn **"External"** → **"Create"**
   - Điền tên app (bất kỳ, ví dụ: "My MCP Drive")
   - Thêm email của bạn vào **"Test users"**
   - Lưu lại
4. Quay lại tạo credentials:
   - **Application type**: chọn **"Desktop app"**
   - **Name**: đặt tên bất kỳ (ví dụ: "MCP Drive Desktop")
   - Click **"Create"**
5. Nhấn **"Download JSON"** để tải file credentials

#### 1.4. Lưu file credentials

Đặt file vừa tải về vào thư mục dự án và đổi tên thành **`credentials.json`**

> ⚠️ **Quan trọng**: KHÔNG chia sẻ file `credentials.json` và `token.json` với bất kỳ ai!

---

### 📥 Bước 2: Cài đặt MCP Google Drive

```bash
# Clone repository
git clone https://github.com/mrbit-dev/mcp-google-driver.git
cd mcp-google-driver

# Cài đặt dependencies
npm install

# Build TypeScript
npm run build
```

---

### 🔑 Bước 3: Xác thực Google Drive (Lần đầu tiên)

```bash
npm run auth
```

Chương trình sẽ:
1. Hiển thị một đường link Google OAuth
2. Mở link đó trong trình duyệt, đăng nhập và cấp quyền
3. Sau khi xác nhận, bạn sẽ được chuyển hướng (trang có thể báo lỗi kết nối — điều đó bình thường)
4. **Copy toàn bộ URL** trên thanh địa chỉ trình duyệt và dán vào terminal
5. File `token.json` sẽ được tạo tự động — xác thực thành công!

---

### ⚙️ Bước 4: Cài đặt vào AI Assistant

#### 🤖 Antigravity IDE

1. Mở Antigravity IDE
2. Vào **Settings** → **MCP Servers**
3. Thêm cấu hình sau:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "node",
      "args": ["C:/ĐƯỜNG_DẪN_ĐẾN_THƯ_MỤC/mcp-google-driver/dist/index.js"],
      "env": {
        "CREDENTIALS_PATH": "C:/ĐƯỜNG_DẪN_ĐẾN_THƯ_MỤC/mcp-google-driver/credentials.json",
        "TOKEN_PATH": "C:/ĐƯỜNG_DẪN_ĐẾN_THƯ_MỤC/mcp-google-driver/token.json"
      }
    }
  }
}
```

> 💡 **Thay** `C:/ĐƯỜNG_DẪN_ĐẾN_THƯ_MỤC` bằng đường dẫn thực tế trên máy bạn.
> 
> **Ví dụ Windows**: `C:/Users/TenUser/Documents/mcp-google-driver`
> **Ví dụ macOS/Linux**: `/home/user/mcp-google-driver`

4. Restart Antigravity IDE
5. Kiểm tra: Chat với AI và hỏi _"Liệt kê file trong Google Drive của tôi"_

---

#### 🖥️ Claude Code (CLI)

Thêm vào file cấu hình MCP của Claude Code:

```bash
# Mở file cấu hình (tạo nếu chưa có)
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Linux: ~/.config/Claude/claude_desktop_config.json
```

Nội dung file cấu hình:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "node",
      "args": ["/ĐƯỜNG_DẪN_THỰC_TẾ/mcp-google-driver/dist/index.js"],
      "env": {
        "CREDENTIALS_PATH": "/ĐƯỜNG_DẪN_THỰC_TẾ/mcp-google-driver/credentials.json",
        "TOKEN_PATH": "/ĐƯỜNG_DẪN_THỰC_TẾ/mcp-google-driver/token.json"
      }
    }
  }
}
```

---

#### 🖥️ Claude Desktop

1. Mở Claude Desktop
2. Vào **Settings** → **Developer** → **Edit Config**
3. Thêm cấu hình tương tự như Claude Code ở trên
4. Restart Claude Desktop

---

### 🎯 Ví dụ sử dụng

Sau khi cài xong, bạn có thể ra lệnh cho AI bằng ngôn ngữ tự nhiên:

```
📂 "Liệt kê tất cả file trong thư mục gốc Drive của tôi"
📖 "Đọc nội dung của file có ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
✍️  "Tạo file text tên 'notes.txt' với nội dung 'Ghi chú quan trọng hôm nay'"
📁 "Tạo thư mục tên 'Dự án 2025' trong Drive"
🔍 "Tìm tất cả file PDF trong Drive"
🗑️  "Chuyển file ID abc123 vào thùng rác"
```

---

### ❓ Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `credentials.json not found` | Chưa đặt file credentials | Đặt `credentials.json` vào thư mục dự án |
| `token.json not found` | Chưa xác thực | Chạy `npm run auth` |
| `Token expired` | Token hết hạn | Chạy lại `npm run auth` |
| `Access denied` | Chưa bật Drive API | Bật Google Drive API trong Google Cloud Console |

---

## 📖 English Guide

### What is MCP Google Drive?

**MCP Google Drive** is a server implementing the **Model Context Protocol (MCP)** — a standard that allows AI Assistants (Antigravity IDE, Claude Code, Claude Desktop) to **read, write, search and manage files** on your Google Drive directly through chat.

### ✨ Features

| Tool | Description |
|------|-------------|
| `gdrive_list` | List files/folders in any directory |
| `gdrive_create_folder` | Create a new folder |
| `gdrive_read_file` | Read file content (supports Google Docs, Sheets, CSV, text) |
| `gdrive_write_file` | Create a new file with content |
| `gdrive_update_file` | Update existing file content |
| `gdrive_delete_file` | Delete file/folder (trash or permanent) |
| `gdrive_search` | Search files by name, type, etc. |

---

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- A Google Account
- **Antigravity IDE**, **Claude Code**, or **Claude Desktop** installed

---

### 🔧 Step 1: Get Google OAuth Credentials

#### 1.1. Go to Google Cloud Console

1. Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select an existing one

#### 1.2. Enable Google Drive API

1. Navigate to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click the result and press **"Enable"**

#### 1.3. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted to configure OAuth consent screen:
   - Choose **"External"** → **"Create"**
   - Fill in app name (any name, e.g., "My MCP Drive")
   - Add your email to **"Test users"**
   - Save
4. Back to creating credentials:
   - **Application type**: select **"Desktop app"**
   - **Name**: any name (e.g., "MCP Drive Desktop")
   - Click **"Create"**
5. Click **"Download JSON"** to download credentials

#### 1.4. Save credentials file

Place the downloaded file in your project directory and rename it to **`credentials.json`**

> ⚠️ **Important**: NEVER share `credentials.json` or `token.json` with anyone!

---

### 📥 Step 2: Install MCP Google Drive

```bash
# Clone repository
git clone https://github.com/mrbit-dev/mcp-google-driver.git
cd mcp-google-driver

# Install dependencies
npm install

# Build TypeScript
npm run build
```

---

### 🔑 Step 3: Authenticate with Google Drive (First time only)

```bash
npm run auth
```

The program will:
1. Display a Google OAuth link
2. Open that link in your browser, sign in and grant permissions
3. After confirmation, you'll be redirected (the page may show a connection error — that's normal)
4. **Copy the full URL** from the browser address bar and paste it into the terminal
5. `token.json` will be created automatically — authentication successful!

---

### ⚙️ Step 4: Configure your AI Assistant

#### 🤖 Antigravity IDE

1. Open Antigravity IDE
2. Go to **Settings** → **MCP Servers**
3. Add the following configuration:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "node",
      "args": ["C:/PATH_TO_FOLDER/mcp-google-driver/dist/index.js"],
      "env": {
        "CREDENTIALS_PATH": "C:/PATH_TO_FOLDER/mcp-google-driver/credentials.json",
        "TOKEN_PATH": "C:/PATH_TO_FOLDER/mcp-google-driver/token.json"
      }
    }
  }
}
```

> 💡 **Replace** `C:/PATH_TO_FOLDER` with the actual path on your machine.
>
> **Windows example**: `C:/Users/YourName/Documents/mcp-google-driver`
> **macOS/Linux example**: `/home/user/mcp-google-driver`

4. Restart Antigravity IDE
5. Test: Chat with AI and ask _"List files in my Google Drive"_

---

#### 🖥️ Claude Code (CLI)

Add to your Claude Code MCP configuration file:

```bash
# Config file location:
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# macOS:   ~/Library/Application Support/Claude/claude_desktop_config.json
# Linux:   ~/.config/Claude/claude_desktop_config.json
```

Config content:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "node",
      "args": ["/ACTUAL_PATH/mcp-google-driver/dist/index.js"],
      "env": {
        "CREDENTIALS_PATH": "/ACTUAL_PATH/mcp-google-driver/credentials.json",
        "TOKEN_PATH": "/ACTUAL_PATH/mcp-google-driver/token.json"
      }
    }
  }
}
```

---

#### 🖥️ Claude Desktop

1. Open Claude Desktop
2. Go to **Settings** → **Developer** → **Edit Config**
3. Add the same configuration as Claude Code above
4. Restart Claude Desktop

---

### ❓ Common Error Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `credentials.json not found` | Credentials file missing | Place `credentials.json` in the project folder |
| `token.json not found` | Not authenticated yet | Run `npm run auth` |
| `Token expired` | Token has expired | Run `npm run auth` again |
| `Access denied` | Drive API not enabled | Enable Google Drive API in Google Cloud Console |

---

## 🛡️ Security / Bảo mật

- `credentials.json` và `token.json` **không được** commit lên Git (đã có trong `.gitignore`)
- Chỉ cấp quyền tối thiểu cần thiết cho Google Drive API
- Token được tự động làm mới khi hết hạn

---

## 📄 License

MIT License — Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/mrbit-dev">mrbit-dev</a>
</div>
