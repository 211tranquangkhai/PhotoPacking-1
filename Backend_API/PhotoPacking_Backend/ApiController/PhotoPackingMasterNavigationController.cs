using Microsoft.AspNetCore.Mvc;
using PhotoPacking_Backend.Data;
using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.ApiController
{
    [ApiController]
    [Route("api/photo-packing-master-navigation")]
    [Route("api/master-navigation")]
    public class PhotoPackingMasterNavigationController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public PhotoPackingMasterNavigationController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách cấu hình bước chụp mẫu PhotoPackingMasterNavigation (hỗ trợ lọc theo phân xưởng OSA / LXA hoặc ProductKey)
        /// </summary>
        [HttpGet]
        public IActionResult GetAllMasterNavigations([FromQuery] string? group, [FromQuery] string? productKey, [FromQuery] string? userGroup)
        {
            var masterQuery = Data.Data.photoPackingMasterNavigations.AsQueryable();

            var effectiveGroup = !string.IsNullOrWhiteSpace(userGroup) ? userGroup : group;
            if (!string.IsNullOrWhiteSpace(effectiveGroup))
            {
                masterQuery = masterQuery.Where(x => x.Group.Equals(effectiveGroup.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(productKey))
            {
                masterQuery = masterQuery.Where(x => x.ProductKey.Equals(productKey.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            var masterNavigationList = masterQuery.OrderBy(x => x.ProductKey).ThenBy(x => x.StepNo).ToList();
            return Ok(masterNavigationList);
        }

        /// <summary>
        /// Lấy chi tiết một cấu hình bước chụp mẫu theo ID
        /// </summary>
        [HttpGet("{id:int}")]
        public IActionResult GetMasterNavigationById(int id)
        {
            var masterItem = Data.Data.photoPackingMasterNavigations.FirstOrDefault(x => x.Id == id);
            if (masterItem == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy cấu hình Master Navigation với ID: {id}" });
            }

            return Ok(masterItem);
        }

        /// <summary>
        /// Thêm mới một cấu hình bước chụp mẫu PhotoPackingMasterNavigation.
        /// - File ảnh mẫu (nếu gửi dạng Base64) được tự động lưu vào thư mục Image/Template trên server.
        /// - Dữ liệu được lưu vào bộ nhớ tạm thời và có vị trí comment để tích hợp Database.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateMasterNavigation([FromBody] CreateMasterNavigationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ProductKey))
            {
                return BadRequest(new { success = false, message = "ProductKey không được để trống." });
            }

            string templatePath = dto.TemplatePath ?? string.Empty;

            // Nếu người dùng tải lên ảnh mẫu dưới dạng Base64: Lưu ảnh vào thư mục Image/Template
            if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
            {
                try
                {
                    var templateDir = Path.Combine(_env.ContentRootPath, "Image", "Template");
                    if (!Directory.Exists(templateDir))
                    {
                        Directory.CreateDirectory(templateDir);
                    }

                    var fileName = string.IsNullOrWhiteSpace(dto.ImageFileName)
                        ? $"{dto.ProductKey.Trim()}_Step{dto.StepNo}.jpg"
                        : dto.ImageFileName.Trim();

                    var filePath = Path.Combine(templateDir, fileName);

                    var base64Data = dto.ImageBase64;
                    var commaIndex = base64Data.IndexOf(',');
                    if (commaIndex >= 0)
                    {
                        base64Data = base64Data.Substring(commaIndex + 1);
                    }

                    var imageBytes = Convert.FromBase64String(base64Data);
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    templatePath = $"/Image/Template/{fileName}";
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = $"Lỗi khi lưu ảnh mẫu: {ex.Message}" });
                }
            }

            var nextId = Data.Data.photoPackingMasterNavigations.Count > 0
                ? Data.Data.photoPackingMasterNavigations.Max(x => x.Id) + 1
                : 1;

            var newMasterItem = new PhotoPackingMasterNavigation
            {
                Id = nextId,
                ProductKey = dto.ProductKey.Trim(),
                StepNo = dto.StepNo > 0 ? dto.StepNo : 1,
                Group = string.IsNullOrWhiteSpace(dto.Group) ? "OSA" : dto.Group.Trim(),
                Notes = dto.Notes?.Trim() ?? string.Empty,
                TemplatePath = templatePath,
                Creator = dto.Creator > 0 ? dto.Creator : 10321,
                CreateTime = DateTime.Now,
                Updater = dto.Creator > 0 ? dto.Creator : 10321,
                UpdatedTime = DateTime.Now
            };

            // =========================================================================
            // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE LƯU VÀO DATABASE THỰC TẾ]:
            // -------------------------------------------------------------------------
            // using (var db = new YourDbContext())
            // {
            //     db.PhotoPackingMasterNavigations.Add(newMasterItem);
            //     await db.SaveChangesAsync();
            // }
            // =========================================================================

            Data.Data.photoPackingMasterNavigations.Add(newMasterItem);

            return CreatedAtAction(nameof(GetMasterNavigationById), new { id = newMasterItem.Id }, new
            {
                success = true,
                message = "Thêm cấu hình bước chụp Master Navigation thành công.",
                data = newMasterItem
            });
        }

        /// <summary>
        /// Cập nhật thông tin cấu hình bước chụp PhotoPackingMasterNavigation
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateMasterNavigation(int id, [FromBody] UpdateMasterNavigationDto dto)
        {
            var masterItem = Data.Data.photoPackingMasterNavigations.FirstOrDefault(x => x.Id == id);
            if (masterItem == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy cấu hình ID: {id}" });
            }

            if (!string.IsNullOrWhiteSpace(dto.ProductKey)) masterItem.ProductKey = dto.ProductKey.Trim();
            if (dto.StepNo.HasValue && dto.StepNo.Value > 0) masterItem.StepNo = dto.StepNo.Value;
            if (!string.IsNullOrWhiteSpace(dto.Group)) masterItem.Group = dto.Group.Trim();
            if (dto.Notes != null) masterItem.Notes = dto.Notes.Trim();
            if (dto.Updater.HasValue && dto.Updater.Value > 0) masterItem.Updater = dto.Updater.Value;
            masterItem.UpdatedTime = DateTime.Now;

            // Xử lý lưu ảnh mẫu mới nếu có gửi kèm Base64
            if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
            {
                try
                {
                    var templateDir = Path.Combine(_env.ContentRootPath, "Image", "Template");
                    if (!Directory.Exists(templateDir)) Directory.CreateDirectory(templateDir);

                    var fileName = string.IsNullOrWhiteSpace(dto.ImageFileName)
                        ? $"{masterItem.ProductKey}_Step{masterItem.StepNo}.jpg"
                        : dto.ImageFileName.Trim();

                    var filePath = Path.Combine(templateDir, fileName);
                    var base64Data = dto.ImageBase64;
                    var commaIndex = base64Data.IndexOf(',');
                    if (commaIndex >= 0) base64Data = base64Data.Substring(commaIndex + 1);

                    var imageBytes = Convert.FromBase64String(base64Data);
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    masterItem.TemplatePath = $"/Image/Template/{fileName}";
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = $"Lỗi khi lưu ảnh mẫu mới: {ex.Message}" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(dto.TemplatePath))
            {
                masterItem.TemplatePath = dto.TemplatePath.Trim();
            }

            // =========================================================================
            // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE CẬP NHẬT DATABASE THỰC TẾ]:
            // -------------------------------------------------------------------------
            // using (var db = new YourDbContext())
            // {
            //     db.PhotoPackingMasterNavigations.Update(masterItem);
            //     await db.SaveChangesAsync();
            // }
            // =========================================================================

            return Ok(new
            {
                success = true,
                message = "Cập nhật cấu hình bước chụp thành công.",
                data = masterItem
            });
        }

        /// <summary>
        /// Xóa một cấu hình bước chụp PhotoPackingMasterNavigation
        /// </summary>
        [HttpDelete("{id:int}")]
        public IActionResult DeleteMasterNavigation(int id)
        {
            var masterItem = Data.Data.photoPackingMasterNavigations.FirstOrDefault(x => x.Id == id);
            if (masterItem == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy cấu hình ID: {id}" });
            }

            // =========================================================================
            // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE XÓA KHỎI DATABASE THỰC TẾ]:
            // -------------------------------------------------------------------------
            // using (var db = new YourDbContext())
            // {
            //     db.PhotoPackingMasterNavigations.Remove(masterItem);
            //     await db.SaveChangesAsync();
            // }
            // =========================================================================

            Data.Data.photoPackingMasterNavigations.Remove(masterItem);

            return Ok(new
            {
                success = true,
                message = $"Đã xóa thành công cấu hình ID: {id}."
            });
        }
    }

    public class CreateMasterNavigationDto
    {
        public string ProductKey { get; set; } = string.Empty;
        public int StepNo { get; set; } = 1;
        public string Group { get; set; } = "OSA";
        public string? Notes { get; set; }
        public string? TemplatePath { get; set; }
        public string? ImageBase64 { get; set; }
        public string? ImageFileName { get; set; }
        public int Creator { get; set; } = 10321;
    }

    public class UpdateMasterNavigationDto
    {
        public string? ProductKey { get; set; }
        public int? StepNo { get; set; }
        public string? Group { get; set; }
        public string? Notes { get; set; }
        public string? TemplatePath { get; set; }
        public string? ImageBase64 { get; set; }
        public string? ImageFileName { get; set; }
        public int? Updater { get; set; }
    }
}
