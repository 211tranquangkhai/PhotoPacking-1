using Microsoft.AspNetCore.Mvc;
using PhotoPacking_Backend.Data;
using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.ApiController
{
    [ApiController]
    [Route("api")]
    public class PhotoPackingController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public PhotoPackingController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Lấy danh sách PO trả về cho giao diện (chia thành tab Chờ chụp và Đã hoàn thành)
        /// </summary>
        [HttpGet("orders")]
        [HttpGet("photo-packing-summary")]
        public IActionResult GetOrders()
        {
            var summaries = Data.Data.photoPackingSummaries;

            var enriched = summaries.Select(item =>
            {
                var savedPhotos = GetSavedPhotos(item.PO);
                var statusId = CalculateStatusId(item);

                return new
                {
                    id = item.Id,
                    pO = item.PO,
                    productCode = item.ProductCode,
                    productName = item.ProductName,
                    group = item.Group,
                    creator = item.Creator,
                    createTime = item.CreateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    updator = item.Updator,
                    updatedTime = item.UpdateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    type = item.Type,
                    productKey = item.ProductKey,
                    totalStep = item.TotalStep,
                    currentStep = item.CurrentStep,
                    nextStep = item.NextStep,
                    recapture = item.Recapture,
                    notes = item.Notes,
                    statusId = statusId,
                    samplePhotoUrl = $"/Image/Template/{item.Type}.jpg",
                    photoUrls = savedPhotos
                };
            }).ToList();

            var pending = enriched.Where(x => x.statusId == 0 || x.statusId == 1 || x.statusId == 2).ToList();
            var completed = enriched.Where(x => x.statusId == 3).ToList();

            return Ok(new
            {
                pending,
                completed,
                total = enriched.Count
            });
        }

        /// <summary>
        /// Lấy chi tiết một đơn hàng theo PO
        /// </summary>
        [HttpGet("orders/{po}")]
        public IActionResult GetOrderByPO(string po)
        {
            var item = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(po, StringComparison.OrdinalIgnoreCase));
            if (item == null)
            {
                return NotFound(new { error = $"Không tìm thấy đơn hàng PO {po}" });
            }

            var savedPhotos = GetSavedPhotos(item.PO);
            var statusId = CalculateStatusId(item);

            return Ok(new
            {
                id = item.Id,
                pO = item.PO,
                productCode = item.ProductCode,
                productName = item.ProductName,
                group = item.Group,
                creator = item.Creator,
                createTime = item.CreateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                updator = item.Updator,
                updatedTime = item.UpdateTime?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                type = item.Type,
                productKey = item.ProductKey,
                totalStep = item.TotalStep,
                currentStep = item.CurrentStep,
                nextStep = item.NextStep,
                recapture = item.Recapture,
                notes = item.Notes,
                statusId = statusId,
                samplePhotoUrl = $"/Image/Template/{item.Type}.jpg",
                photoUrls = savedPhotos
            });
        }

        /// <summary>
        /// Lấy danh sách ảnh lưu (Image/Save) và ảnh mẫu (Image/Template) theo PO
        /// </summary>
        [HttpGet("photos/{po}")]
        public IActionResult GetPhotos(string po)
        {
            var item = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(po, StringComparison.OrdinalIgnoreCase));
            var savedPhotos = GetSavedPhotos(po);
            var type = item?.Type ?? "Box";

            return Ok(new
            {
                pO = po,
                photoUrls = savedPhotos,
                samplePhotoUrl = $"/Image/Template/{type}.jpg"
            });
        }

        /// <summary>
        /// Nhận ảnh chụp từ Camera, lưu file vào Image/Save với tên PO_Step.jpg
        /// </summary>
        [HttpPost("photo/submit")]
        public async Task<IActionResult> SubmitPhoto([FromBody] SubmitPhotoDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PO) || string.IsNullOrWhiteSpace(dto.ImageBase64))
            {
                return BadRequest(new { success = false, message = "PO và ImageBase64 không được để trống." });
            }

            try
            {
                // Thư mục lưu trữ: Image/Save
                var saveDir = Path.Combine(_env.ContentRootPath, "Image", "Save");
                if (!Directory.Exists(saveDir))
                {
                    Directory.CreateDirectory(saveDir);
                }

                // Tên file lưu bắt buộc: PO_Step.jpg
                var fileName = $"{dto.PO}_{dto.StepNumber}.jpg";
                var filePath = Path.Combine(saveDir, fileName);

                // Tách chuỗi Base64 nếu có tiền tố data:image/...;base64,
                var base64Data = dto.ImageBase64;
                var commaIndex = base64Data.IndexOf(',');
                if (commaIndex >= 0)
                {
                    base64Data = base64Data.Substring(commaIndex + 1);
                }

                var imageBytes = Convert.FromBase64String(base64Data);
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                // Đồng thời copy vào thư mục public/Image/Save của React nếu có để hiển thị tức thì
                try
                {
                    var publicSaveDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "..", "..", "public", "Image", "Save"));
                    if (Directory.Exists(publicSaveDir))
                    {
                        await System.IO.File.WriteAllBytesAsync(Path.Combine(publicSaveDir, fileName), imageBytes);
                    }
                }
                catch { }

                // Cập nhật trạng thái trong bộ nhớ Data
                var item = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(dto.PO, StringComparison.OrdinalIgnoreCase));
                if (item != null)
                {
                    item.CurrentStep = Math.Max(item.CurrentStep, dto.StepNumber);
                    item.UpdateTime = DateTime.Now;
                    if (item.Recapture)
                    {
                        item.Recapture = false;
                    }
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
        /// Xác nhận hoàn tất bước chụp và chuyển bước
        /// </summary>
        [HttpPost("photo/confirm")]
        public IActionResult ConfirmStep([FromBody] ConfirmStepDto dto)
        {
            var item = Data.Data.photoPackingSummaries.FirstOrDefault(x => x.PO.Equals(dto.PO, StringComparison.OrdinalIgnoreCase));
            var totalStep = dto.TotalStep.HasValue && dto.TotalStep.Value > 0 ? dto.TotalStep.Value : (item?.TotalStep ?? 3);
            var isCompleted = dto.StepNumber >= totalStep;
            var hasNextStep = !isCompleted;
            var nextStepNumber = hasNextStep ? dto.StepNumber + 1 : 0;

            if (item != null)
            {
                item.CurrentStep = dto.StepNumber;
                item.NextStep = nextStepNumber;
                item.Recapture = false;
                item.UpdateTime = DateTime.Now;
            }

            return Ok(new
            {
                success = true,
                message = isCompleted
                    ? $"Đã hoàn tất toàn bộ quy trình đóng gói ({dto.StepNumber}/{totalStep} bước) cho PO {dto.PO}!"
                    : $"Bước {dto.StepNumber}/{totalStep} cho PO {dto.PO} đã được xác nhận hoàn tất thành công.",
                hasNextStep,
                nextStepNumber,
                totalStep,
                isCompleted
            });
        }

        // Tính statusId cho client
        private static int CalculateStatusId(PhotoPackingSummary item)
        {
            if (item.Recapture) return 2; // Chụp lại
            if (item.NextStep == 0 || item.CurrentStep >= item.TotalStep) return 3; // Hoàn thành
            if (item.CurrentStep > 0) return 1; // Đang chụp
            return 0; // Chờ chụp
        }

        // Quét danh sách ảnh trong Image/Save
        private List<string> GetSavedPhotos(string po)
        {
            var photos = new List<string>();
            var saveDir = Path.Combine(_env.ContentRootPath, "Image", "Save");
            if (Directory.Exists(saveDir))
            {
                var pattern = $"{po}_*.jpg";
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
