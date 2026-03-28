# GoClaw Custom Patches

Thư mục này chứa các patches tùy chỉnh cho GoClaw.

## 📋 Danh sách Patches

### 001-zalo-unmarshal-fix.patch
**Mô tả:** Fix lỗi Zalo bot getUpdates unmarshal error  
**Vấn đề:** Zalo API trả về single object thay vì array, gây lỗi parse  
**Giải pháp:** Thêm fallback để parse single object nếu array fails  
**Ngày tạo:** 2026-03-27  
**Trạng thái:** ✅ Hoạt động  

### 002-zalo-typing-indicator.patch
**Mô tả:** Thêm typing indicator cho Zalo bot  
**Vấn đề:** User không thấy trạng thái "Đang nhắn tin..." khi bot đang xử lý  
**Giải pháp:** Gọi API sendChatAction với action="typing" khi nhận message  
**Ngày tạo:** 2026-03-27  
**Trạng thái:** ✅ Hoạt động  

### 003-fix-session-status-access-check.patch
**Mô tả:** Fix lỗi session_status tool không dùng được trong session  
**Vấn đề:** Agent check agentID bằng UUID nhưng sessionKey dùng agent name, gây access denied khi gọi tool trong chính session của mình  
**Giải pháp:** Skip validation khi sessionKey là current session (từ context)  
**Ngày tạo:** 2026-03-27  
**Trạng thái:** ✅ Hoạt động  

### 004-fix-sessions-list-agent-key.patch
**Mô tả:** Fix lỗi sessions_list trả về mảng rỗng  
**Vấn đề:** Tool dùng agent UUID để query nhưng session_key format dùng agent_key (name), gây không match → trả về rỗng  
**Giải pháp:** Parse agent_key từ current session_key thay vì dùng UUID  
**Ngày tạo:** 2026-03-28  
**Trạng thái:** ✅ Hoạt động  

---

## 🔧 Cách sử dụng

### Khi update GoClaw:

```bash
# Chạy script tự động (khuyến nghị)
update_goclaw.bat

# Hoặc thủ công:
git pull origin main
patches\apply-patches.bat
docker-compose build
docker-compose up -d
```

### Tạo patch mới:

```bash
# 1. Sửa code
# 2. Tạo patch file
git diff path/to/file.go > patches/00X-feature-name.patch

# 3. Test patch
git apply --check patches/00X-feature-name.patch

# 4. Document trong README.md
```

### Xóa patch:

```bash
# Revert changes
git checkout path/to/file.go

# Xóa patch file
del patches\00X-feature-name.patch
```

---

## ⚠️ Lưu ý

- **Patches được apply theo thứ tự số** (001, 002, 003...)
- **Kiểm tra conflicts** sau mỗi lần update upstream
- **Backup patches** trước khi update major version
- **Test kỹ** sau khi apply patches

---

## 🐛 Troubleshooting

### Patch không apply được:

```bash
# Kiểm tra conflicts
git apply --check patches/001-zalo-unmarshal-fix.patch

# Xem chi tiết lỗi
git apply --verbose patches/001-zalo-unmarshal-fix.patch

# Apply thủ công nếu cần
# Sau đó tạo lại patch:
git diff > patches/001-zalo-unmarshal-fix.patch
```

### Rollback patch:

```bash
# Revert file về trạng thái gốc
git checkout internal/channels/zalo/zalo.go

# Rebuild
docker-compose build
docker-compose up -d
```

---

## 📝 Template Patch

Khi tạo patch mới, thêm vào README:

```markdown
### 00X-feature-name.patch
**Mô tả:** [Mô tả ngắn gọn]  
**Vấn đề:** [Vấn đề cần fix]  
**Giải pháp:** [Cách giải quyết]  
**Ngày tạo:** YYYY-MM-DD  
**Trạng thái:** ✅ Hoạt động / ⚠️ Cần test / ❌ Deprecated  
```

---

## 🔗 Links

- [GoClaw GitHub](https://github.com/nextlevelbuilder/goclaw)
- [GoClaw Docs](https://goclaw.sh)
- [Git Patch Tutorial](https://git-scm.com/docs/git-apply)
