using Microsoft.AspNetCore.Mvc;
using PhotoPacking_Backend.Data;
using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.ApiController
{
    [ApiController]
    [Route("api/photo-packing-item")]
    [Route("api/items")]
    public class PhotoPackingItemController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public PhotoPackingItemController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách chi tiết các bước chụp (có thể lọc theo PO hoặc Group)
        /// </summary>
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? po, [FromQuery] string? group, [FromQuery] string? userGroup)
        {
            // Giả lập độ trễ phản hồi từ server để test hiệu ứng loading
            Thread.Sleep(800);

            var query = Data.Data.photoPackingItems.AsQueryable();

            if (!string.IsNullOrWhiteSpace(po))
            {
                query = query.Where(x => x.PONumber.Equals(po.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            var effectiveGroup = !string.IsNullOrWhiteSpace(userGroup) ? userGroup : group;
            if (!string.IsNullOrWhiteSpace(effectiveGroup))
            {
                query = query.Where(x => x.Group.Equals(effectiveGroup.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            var results = query.OrderBy(x => x.PONumber).ThenBy(x => x.StepNo).ToList();
            return Ok(results);
        }

        /// <summary>
        /// Lấy toàn bộ các bước chụp của một đơn hàng PO cụ thể
        /// </summary>
        [HttpGet("{po}")]
        public IActionResult GetByPO(string po)
        {
            // Giả lập độ trễ phản hồi từ server để test hiệu ứng loading
            Thread.Sleep(800);

            var items = Data.Data.photoPackingItems
                .Where(x => x.PONumber.Equals(po.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderBy(x => x.StepNo)
                .ToList();

            return Ok(items);
        }

        /// <summary>
        /// Lấy thông tin một bước chụp cụ thể theo số PO và số bước (StepNo)
        /// </summary>
        [HttpGet("{po}/step/{stepNo:int}")]
        public IActionResult GetByStep(string po, int stepNo)
        {
            var item = Data.Data.photoPackingItems.FirstOrDefault(x =>
                x.PONumber.Equals(po.Trim(), StringComparison.OrdinalIgnoreCase) &&
                x.StepNo == stepNo);

            if (item == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bước {stepNo} của PO {po}" });
            }

            return Ok(item);
        }

        /// <summary>
        /// Lưu hoặc cập nhật kết quả bước chụp ảnh thực tế của PO (PhotoPackingItem)
        /// - Nhận ảnh Base64 và lưu vào thư mục Image/Save/{PO}_{StepNo}.jpg
        /// - Cập nhật thông tin bước chụp
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SaveItem([FromBody] SavePhotoPackingItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PONumber) || dto.StepNo <= 0)
            {
                return BadRequest(new { success = false, message = "Số PO và số bước (StepNo) không hợp lệ." });
            }

            var cleanPO = dto.PONumber.Trim();
            var existing = Data.Data.photoPackingItems.FirstOrDefault(x =>
                x.PONumber.Equals(cleanPO, StringComparison.OrdinalIgnoreCase) &&
                x.StepNo == dto.StepNo);

            string imagePath = existing?.ImagePath ?? string.Empty;
            string imageName = existing?.Image ?? string.Empty;

            // Xử lý lưu ảnh vào thư mục Image/Save
            if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
            {
                try
                {
                    var saveDir = Path.Combine(_env.ContentRootPath, "Image", "Save");
                    if (!Directory.Exists(saveDir)) Directory.CreateDirectory(saveDir);

                    imageName = $"{cleanPO}_{dto.StepNo}.jpg";
                    var filePath = Path.Combine(saveDir, imageName);

                    var base64Data = dto.ImageBase64;
                    var commaIndex = base64Data.IndexOf(',');
                    if (commaIndex >= 0) base64Data = base64Data.Substring(commaIndex + 1);

                    var imageBytes = Convert.FromBase64String(base64Data);
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    imagePath = $"/Image/Save/{imageName}";
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = $"Lỗi khi lưu ảnh vào Image/Save: {ex.Message}" });
                }
            }

            if (existing != null)
            {
                // Cập nhật bước đã có
                existing.ImagePath = !string.IsNullOrWhiteSpace(imagePath) ? imagePath : existing.ImagePath;
                existing.Image = !string.IsNullOrWhiteSpace(imageName) ? imageName : existing.Image;
                if (!string.IsNullOrWhiteSpace(dto.ProductCode)) existing.ProductCode = dto.ProductCode.Trim();
                if (!string.IsNullOrWhiteSpace(dto.ProductName)) existing.ProductName = dto.ProductName.Trim();
                if (!string.IsNullOrWhiteSpace(dto.Group)) existing.Group = dto.Group.Trim();
                if (!string.IsNullOrWhiteSpace(dto.SampleUrl)) existing.SampleUrl = dto.SampleUrl.Trim();
                if (dto.ReCapture.HasValue) existing.ReCapture = dto.ReCapture.Value;
                if (dto.Notes != null) existing.Notes = dto.Notes.Trim();
                if (dto.Updater.HasValue && dto.Updater.Value > 0) existing.Updater = dto.Updater.Value;
                existing.UpdatedTime = DateTime.Now;

                // =========================================================================
                // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE CẬP NHẬT DATABASE THỰC TẾ]:
                // -------------------------------------------------------------------------
                // using (var db = new YourDbContext())
                // {
                //     db.PhotoPackingItems.Update(existing);
                //     await db.SaveChangesAsync();
                // }
                // =========================================================================

                return Ok(new
                {
                    success = true,
                    message = $"Cập nhật kết quả bước {dto.StepNo} cho PO {cleanPO} thành công.",
                    data = existing
                });
            }
            else
            {
                // Thêm mới bước chụp
                var nextId = Data.Data.photoPackingItems.Count > 0
                    ? Data.Data.photoPackingItems.Max(x => x.Id) + 1
                    : 1;

                var newItem = new PhotoPackingItem
                {
                    Id = nextId,
                    PONumber = cleanPO,
                    ProductCode = dto.ProductCode?.Trim() ?? string.Empty,
                    ProductName = dto.ProductName?.Trim() ?? string.Empty,
                    Group = dto.Group?.Trim() ?? "OSA",
                    StepNo = dto.StepNo,
                    ImagePath = imagePath,
                    Image = imageName,
                    SampleUrl = dto.SampleUrl?.Trim() ?? string.Empty,
                    ReCapture = dto.ReCapture ?? false,
                    ProductKey = dto.ProductKey?.Trim() ?? string.Empty,
                    Notes = dto.Notes?.Trim() ?? string.Empty,
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
                //     db.PhotoPackingItems.Add(newItem);
                //     await db.SaveChangesAsync();
                // }
                // =========================================================================

                Data.Data.photoPackingItems.Add(newItem);

                return Ok(new
                {
                    success = true,
                    message = $"Thêm mới kết quả bước {dto.StepNo} cho PO {cleanPO} thành công.",
                    data = newItem
                });
            }
        }
    }

    public class SavePhotoPackingItemDto
    {
        public string PONumber { get; set; } = string.Empty;
        public int StepNo { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? Group { get; set; }
        public string? ImageBase64 { get; set; }
        public string? SampleUrl { get; set; }
        public bool? ReCapture { get; set; }
        public string? ProductKey { get; set; }
        public string? Notes { get; set; }
        public int Creator { get; set; } = 10321;
        public int? Updater { get; set; }
    }
}
