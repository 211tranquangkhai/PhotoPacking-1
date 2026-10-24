namespace PhotoPacking_Backend.Entities
{
    public class PhotoPackingItem
    {
        public int Id { get; set; } = 0;
        public string PONumber { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public int StepNo { get; set; } = 0;
        public int SyncNasStatusId { get; set; } = 1;
        public string ImagePath { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string SampleUrl { get; set; } = string.Empty;
        public bool ReCapture { get; set; } = false;
        public string ProductKey { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public int Creator { get; set; } = 0;
        public DateTime? CreateTime { get; set; }
        public int Updater { get; set; } = 0;
        public DateTime? UpdatedTime { get; set; }
        public bool DelFlg { get; set; } = false;               // Không tạo dữ liệu test cho trường này
    }
}
