using Microsoft.AspNetCore.Mvc;
using PhotoPacking_Backend.Data;
using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.ApiController
{
    [ApiController]
    [Route("api/photo-packing-summary")]
    [Route("api")] // Giữ tương thích ngược với các endpoint cũ của frontend (/api/orders, /api/photos, ...)
    public class PhotoPackingSummaryController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public PhotoPackingSummaryController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Lấy danh sách tổng quát đơn hàng PhotoPackingSummary
        /// Hỗ trợ lọc theo phân xưởng (group), số PO (poNumber) hoặc trạng thái (statusId)
        /// Phân loại thành 2 nhóm: Chờ chụp (pending) và Đã hoàn thành (completed)
        /// </summary>
        [HttpGet]
        [HttpGet("orders")]
        public IActionResult GetPhotoPackingSummaries([FromQuery] string? group, [FromQuery] string? poNumber, [FromQuery] int? statusId, [FromQuery] string? userGroup)
        {
            // Giả lập độ trễ phản hồi từ server để test hiệu ứng loading
            Thread.Sleep(800);

            var summaryQuery = Data.Data.photoPackingSummaries.AsQueryable();

            var effectiveGroup = !string.IsNullOrWhiteSpace(userGroup) ? userGroup : group;
            if (!string.IsNullOrWhiteSpace(effectiveGroup))
            {
                summaryQuery = summaryQuery.Where(x => x.Group.Equals(effectiveGroup.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(poNumber))
            {
                summaryQuery = summaryQuery.Where(x => x.PO.Contains(poNumber.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            if (statusId.HasValue)
            {
                summaryQuery = summaryQuery.Where(x => x.StatusId == statusId.Value);
            }

            var photoPackingSummaries = summaryQuery.ToList();

            var enrichedSummaries = photoPackingSummaries.Select(summaryItem =>
            {
                var savedPhotos = GetSavedPhotosForPO(summaryItem.PO);
                var currentStatusId = summaryItem.StatusId;

                return new
                {
                    id = summaryItem.Id,
                    pO = summaryItem.PO,
                    productCode = summaryItem.ProductCode,
                    productName = summaryItem.ProductName,
                    group = summaryItem.Group,
                    creator = summaryItem.Creator,
                    createTime = summaryItem.CreateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    updator = summaryItem.Updator,
                    updatedTime = summaryItem.UpdateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    type = summaryItem.Type,
                    productKey = summaryItem.ProductKey,
                    totalStep = summaryItem.TotalStep,
                    currentStep = summaryItem.CurrentStep,
                    nextStep = summaryItem.NextStep,
                    recapture = summaryItem.Recapture,
                    notes = summaryItem.Notes,
                    shipDate = summaryItem.ShipDate,
                    shipDateTime = summaryItem.ShipDateTime?.ToString("yyyy-MM-dd"),
                    isExpiringSoon = summaryItem.IsExpiringSoon,
                    statusId = currentStatusId,
                    samplePhotoUrl = $"/Image/Template/{summaryItem.Type}.jpg",
                    photoUrls = savedPhotos
                };
            }).ToList();

            var pendingSummaries = enrichedSummaries.Where(x => x.statusId == 0 || x.statusId == 1 || x.statusId == 2).ToList();
            var completedSummaries = enrichedSummaries.Where(x => x.statusId == 3).ToList();

            return Ok(new
            {
                pending = pendingSummaries,
                completed = completedSummaries,
                total = enrichedSummaries.Count,
                data = enrichedSummaries
            });
        }

        /// <summary>
        /// Lấy chi tiết thông tin tổng quát PhotoPackingSummary của một đơn hàng theo số PO
        /// </summary>
        [HttpGet("{poNumber}")]
        [HttpGet("orders/{poNumber}")]
        public IActionResult GetPhotoPackingSummaryByPO(string poNumber)
        {
            var cleanPO = (poNumber ?? string.Empty).Trim();
            var summaryItem = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(cleanPO, StringComparison.OrdinalIgnoreCase));
            if (summaryItem == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông tin đơn hàng PO: {cleanPO}" });
            }

            var savedPhotos = GetSavedPhotosForPO(summaryItem.PO);
            var currentStatusId = summaryItem.StatusId;

            return Ok(new
            {
                id = summaryItem.Id,
                pO = summaryItem.PO,
                productCode = summaryItem.ProductCode,
                productName = summaryItem.ProductName,
                group = summaryItem.Group,
                creator = summaryItem.Creator,
                createTime = summaryItem.CreateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                updator = summaryItem.Updator,
                updatedTime = summaryItem.UpdateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                type = summaryItem.Type,
                productKey = summaryItem.ProductKey,
                totalStep = summaryItem.TotalStep,
                currentStep = summaryItem.CurrentStep,
                nextStep = summaryItem.NextStep,
                recapture = summaryItem.Recapture,
                notes = summaryItem.Notes,
                shipDate = summaryItem.ShipDate,
                shipDateTime = summaryItem.ShipDateTime?.ToString("yyyy-MM-dd"),
                isExpiringSoon = summaryItem.IsExpiringSoon,
                statusId = currentStatusId,
                samplePhotoUrl = $"/Image/Template/{summaryItem.Type}.jpg",
                photoUrls = savedPhotos
            });
        }

        /// <summary>
        /// Lấy danh sách ảnh lưu (Image/Save) và ảnh mẫu (Image/Template) của đơn hàng theo số PO
        /// </summary>
        [HttpGet("{poNumber}/photos")]
        [HttpGet("photos/{poNumber}")]
        public IActionResult GetPhotosForPO(string poNumber)
        {
            var cleanPO = (poNumber ?? string.Empty).Trim();
            var summaryItem = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(cleanPO, StringComparison.OrdinalIgnoreCase));
            var savedPhotos = GetSavedPhotosForPO(cleanPO);
            var type = summaryItem?.Type ?? "Box";

            return Ok(new
            {
                pO = cleanPO,
                photoUrls = savedPhotos,
                samplePhotoUrl = $"/Image/Template/{type}.jpg"
            });
        }

        /// <summary>
        /// Nhận ảnh chụp từ Camera cho đơn hàng PO, lưu file vào thư mục Image/Save với tên PO_Step.jpg
        /// và cập nhật trạng thái bước chụp trong PhotoPackingSummary.
        /// </summary>
        [HttpPost("submit-photo")]
        [HttpPost("photo/submit")]
        public async Task<IActionResult> SubmitPhotoForSummary([FromBody] SubmitPhotoDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PO) || string.IsNullOrWhiteSpace(dto.ImageBase64))
            {
                return BadRequest(new { success = false, message = "Số PO và dữ liệu ảnh ImageBase64 không được để trống." });
            }

            try
            {
                var saveDir = Path.Combine(_env.ContentRootPath, "Image", "Save");
                if (!Directory.Exists(saveDir))
                {
                    Directory.CreateDirectory(saveDir);
                }

                var fileName = $"{dto.PO.Trim()}_{dto.StepNumber}.jpg";
                var filePath = Path.Combine(saveDir, fileName);

                var base64Data = dto.ImageBase64;
                var commaIndex = base64Data.IndexOf(',');
                if (commaIndex >= 0)
                {
                    base64Data = base64Data.Substring(commaIndex + 1);
                }

                var imageBytes = Convert.FromBase64String(base64Data);
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                // Đồng bộ ảnh sang thư mục public/Image/Save của React để hiển thị tức thời nếu có
                try
                {
                    var publicSaveDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "..", "..", "public", "Image", "Save"));
                    if (Directory.Exists(publicSaveDir))
                    {
                        await System.IO.File.WriteAllBytesAsync(Path.Combine(publicSaveDir, fileName), imageBytes);
                    }
                }
                catch { }

                // Cập nhật trạng thái trong PhotoPackingSummary
                var summaryItem = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(dto.PO.Trim(), StringComparison.OrdinalIgnoreCase));
                if (summaryItem != null)
                {
                    summaryItem.CurrentStep = Math.Max(summaryItem.CurrentStep, dto.StepNumber);
                    summaryItem.UpdateTime = DateTime.Now;
                    if (summaryItem.Recapture)
                    {
                        summaryItem.Recapture = false;
                    }

                    // =========================================================================
                    // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE CẬP NHẬT DATABASE THỰC TẾ]:
                    // -------------------------------------------------------------------------
                    // using (var db = new YourDbContext())
                    // {
                    //     db.PhotoPackingSummaries.Update(summaryItem);
                    //     await db.SaveChangesAsync();
                    // }
                    // =========================================================================
                }

                return Ok(new
                {
                    success = true,
                    message = $"Ảnh đóng gói bước {dto.StepNumber} cho PO {dto.PO} đã được lưu thành công vào Image/Save/{fileName}.",
                    fileName = fileName,
                    photoUrl = $"/Image/Save/{fileName}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi khi lưu ảnh: {ex.Message}" });
            }
        }

        /// <summary>
        /// Xác nhận hoàn tất bước chụp và chuyển bước trong PhotoPackingSummary
        /// </summary>
        [HttpPost("confirm-step")]
        [HttpPost("photo/confirm")]
        public IActionResult ConfirmStepForSummary([FromBody] ConfirmStepDto dto)
        {
            var cleanPO = (dto.PO ?? string.Empty).Trim();
            var summaryItem = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(cleanPO, StringComparison.OrdinalIgnoreCase));
            var totalStep = dto.TotalStep.HasValue && dto.TotalStep.Value > 0 ? dto.TotalStep.Value : (summaryItem?.TotalStep ?? 3);
            var isCompleted = dto.StepNumber >= totalStep;
            var hasNextStep = !isCompleted;
            var nextStepNumber = hasNextStep ? dto.StepNumber + 1 : 0;

            if (summaryItem != null)
            {
                summaryItem.CurrentStep = dto.StepNumber;
                summaryItem.NextStep = nextStepNumber;
                summaryItem.Recapture = false;
                summaryItem.UpdateTime = DateTime.Now;

                // =========================================================================
                // [VỊ TRÍ DÀNH CHO NGƯỜI DÙNG BỔ SUNG CODE CẬP NHẬT DATABASE THỰC TẾ]:
                // -------------------------------------------------------------------------
                // using (var db = new YourDbContext())
                // {
                //     db.PhotoPackingSummaries.Update(summaryItem);
                //     await db.SaveChangesAsync();
                // }
                // =========================================================================
            }

            return Ok(new
            {
                success = true,
                message = isCompleted
                    ? $"Đã hoàn tất toàn bộ quy trình đóng gói ({dto.StepNumber}/{totalStep} bước) cho PO {cleanPO}!"
                    : $"Bước {dto.StepNumber}/{totalStep} cho PO {cleanPO} đã được xác nhận hoàn tất thành công.",
                hasNextStep,
                nextStepNumber,
                totalStep,
                isCompleted
            });
        }

        // Quét danh sách ảnh trong Image/Save theo PO
        private List<string> GetSavedPhotosForPO(string poNumber)
        {
            var photos = new List<string>();
            var saveDir = Path.Combine(_env.ContentRootPath, "Image", "Save");
            if (Directory.Exists(saveDir))
            {
                var pattern = $"{poNumber}_*.jpg";
                var files = Directory.GetFiles(saveDir, pattern);
                foreach (var f in files.OrderBy(x => x))
                {
                    photos.Add($"/Image/Save/{Path.GetFileName(f)}");
                }
            }
            return photos;
        }
    }

    public class SubmitPhotoDto
    {
        public string PO { get; set; } = string.Empty;
        public int StepNumber { get; set; }
        public string ImageBase64 { get; set; } = string.Empty;
        public string? ProductName { get; set; }
    }

    public class ConfirmStepDto
    {
        public string PO { get; set; } = string.Empty;
        public int StepNumber { get; set; }
        public int? TotalStep { get; set; }
    }
}
