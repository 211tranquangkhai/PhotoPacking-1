namespace PhotoPacking_Backend.Entities
{
    public class PhotoPackingMasterNavigation
    {
        public int Id { get; set; }
        public string ProductKey { get; set; } = string.Empty;
        public int StepNo { get; set; }
        public string Group { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string TemplatePath { get; set; } = string.Empty;
        public int Creator { get; set; }
        public DateTime? CreateTime { get; set; }
        public int Updater { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool DelFlg { get; set; }                // Không tạo dữ liệu test cho trường này
    }
}
