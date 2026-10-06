namespace PhotoPacking_Backend.Entities
{
    public class PhotoPackingSummary
    {
        public int Id { get; set; }                             
        public string PO { get; set; } = string.Empty;                          // Số PO
        public string ProductCode { get; set; } = string.Empty;                 // Mã Sản phẩm
        public string ProductName { get; set; } = string.Empty;                 // Tên Sản phẩm
        public string Group { get; set; } = string.Empty;                       // Nhóm xưởng
        public string Creator { get; set; } = string.Empty;                     // Tên người chụp
        public DateTime? CreateTime { get; set; }                               // Thời gian chụp
        public string Updator { get; set; } = string.Empty;                     // Người cập nhật
        public DateTime? UpdateTime { get; set; }                               // Thời gian cập nhật
        public string Type { get; set; } = string.Empty;                        // Loại hàng: Box, Tray, Gift..., dùng để lấy ảnh mẫu từ Image/Template
        public string ProductKey { get; set; } = string.Empty;                  // Từ khoá (tạm thời chưa dùng đến)
        public int TotalStep { get; set; }                                      // Tổng bước chụp
        public int CurrentStep { get; set; }                                    // Bước đã chụp gần nhất
        public int NextStep { get; set; }                                       // Bước kế tiếp, = 0 nếu đã chụp đủ
        public bool Recapture { get; set; }                                     // Cờ để yếu cầu chụp lại
        public string Notes { get; set; } = string.Empty;                       // Ghi chú nếu có 
    }
}
