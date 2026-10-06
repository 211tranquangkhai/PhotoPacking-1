using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.Data
{
    public static class Data
    {
        public static List<PhotoPackingSummary> photoPackingSummaries = new List<PhotoPackingSummary>
        {
            // 1. Đã hoàn thành (statusId = 3, NextStep = 0, Recapture = false)
            // Đã có sẵn 2 ảnh trong Image/Save: 101008468010_1.jpg, 101008468010_2.jpg
            new PhotoPackingSummary
            {
                Id = 1,
                PO = "101008468010",
                ProductCode = "H0090924",
                ProductName = "HF-KXG-0630-C-PT-HN",
                Group = "OSA",
                Creator = "NV-QUANG",
                CreateTime = new DateTime(2026, 9, 20, 8, 30, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 20, 9, 15, 0),
                Type = "Tray",
                ProductKey = "TRAY",
                TotalStep = 2,
                CurrentStep = 2,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn tất đóng gói 2 bước khay định hình linh kiện"
            },
            // 2. Đang chụp bước 2 (statusId = 1, NextStep = 2, Recapture = false)
            // Đã có sẵn 1 ảnh trong Image/Save: 101008467994_1.jpg
            new PhotoPackingSummary
            {
                Id = 2,
                PO = "101008467994",
                ProductCode = "H0168277",
                ProductName = "HF-KXL06-C-HNC-SUS",
                Group = "OSA",
                Creator = "NV-HAI",
                CreateTime = new DateTime(2026, 9, 21, 10, 0, 0),
                Updator = "12653",
                UpdateTime = new DateTime(2026, 9, 21, 10, 30, 0),
                Type = "Gift",
                ProductKey = "GIFT",
                TotalStep = 2,
                CurrentStep = 1,
                NextStep = 2,
                Recapture = false,
                Notes = "Đã chụp bước 1 ảnh tổng thể, chuẩn bị bước 2 chụp tem niêm phong"
            },
            // 3. Chờ chụp (statusId = 0, CurrentStep = 0, NextStep = 1, Recapture = false)
            new PhotoPackingSummary
            {
                Id = 3,
                PO = "101008468015",
                ProductCode = "H0168278",
                ProductName = "HF-KXL06-F-HNC-SUS",
                Group = "OSA",
                Creator = "NV-QUANG",
                CreateTime = new DateTime(2026, 9, 22, 7, 15, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 22, 7, 15, 0),
                Type = "Box",
                ProductKey = "BOX",
                TotalStep = 3,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chờ chụp bước 1: kiểm tra quy chuẩn thùng carton"
            },
            // 4. Đang chụp bước 2 (statusId = 1)
            new PhotoPackingSummary
            {
                Id = 4,
                PO = "101008468022",
                ProductCode = "H0056352",
                ProductName = "KXL06075-ORGOP4-HNB",
                Group = "OSA",
                Creator = "NV-LINH",
                CreateTime = new DateTime(2026, 9, 22, 8, 0, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 22, 8, 45, 0),
                Type = "Tray",
                ProductKey = "TRAY",
                TotalStep = 3,
                CurrentStep = 1,
                NextStep = 2,
                Recapture = false,
                Notes = "Đã xong bước 1, chuẩn bị chụp bước 2 khay linh kiện"
            },
            // 5. Yêu cầu chụp lại (statusId = 2, Recapture = true)
            new PhotoPackingSummary
            {
                Id = 5,
                PO = "101008468033",
                ProductCode = "H0057444",
                ProductName = "HF-KXL06100-CW-HNB",
                Group = "OSA",
                Creator = "NV-MINH",
                CreateTime = new DateTime(2026, 9, 22, 8, 30, 0),
                Updator = "12653",
                UpdateTime = new DateTime(2026, 9, 22, 9, 10, 0),
                Type = "Gift",
                ProductKey = "GIFT",
                TotalStep = 2,
                CurrentStep = 1,
                NextStep = 1,
                Recapture = true,
                Notes = "Ảnh bước 1 bị mờ góc tem nhãn, yêu cầu chụp lại góc thẳng"
            },
            // 6. Chờ chụp 1 ảnh duy nhất (statusId = 0, TotalStep = 1)
            new PhotoPackingSummary
            {
                Id = 6,
                PO = "101008468045",
                ProductCode = "H0057443",
                ProductName = "HF-KXL06075-CW-HNB",
                Group = "OSA",
                Creator = "NV-HA",
                CreateTime = new DateTime(2026, 9, 22, 9, 0, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 22, 9, 0, 0),
                Type = "Box",
                ProductKey = "BOX",
                TotalStep = 1,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chụp 1 ảnh xác nhận quy chuẩn thùng đóng gói duy nhất"
            },
            // 7. Đã hoàn thành (statusId = 3, TotalStep = 2, CurrentStep = 2)
            new PhotoPackingSummary
            {
                Id = 7,
                PO = "101008468058",
                ProductCode = "KGW06100T-RC",
                ProductName = "Linh kiện cơ khí KGW",
                Group = "OSA",
                Creator = "NV-HAI",
                CreateTime = new DateTime(2026, 9, 19, 14, 0, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 19, 14, 50, 0),
                Type = "Tray",
                ProductKey = "TRAY",
                TotalStep = 2,
                CurrentStep = 2,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn thành kiểm tra đóng gói khay Tray đạt chuẩn"
            },
            // 8. Đã hoàn thành (statusId = 3, TotalStep = 3, CurrentStep = 3)
            new PhotoPackingSummary
            {
                Id = 8,
                PO = "101008468069",
                ProductCode = "US-EKS3-10R-V",
                ProductName = "Cụm linh kiện SI tiêu chuẩn",
                Group = "OSA",
                Creator = "NV-LINH",
                CreateTime = new DateTime(2026, 9, 18, 11, 20, 0),
                Updator = "12653",
                UpdateTime = new DateTime(2026, 9, 18, 12, 10, 0),
                Type = "Box",
                ProductKey = "BOX",
                TotalStep = 3,
                CurrentStep = 3,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn thành 3 bước đóng gói xuất xưởng"
            },
            // 9. Chờ chụp (statusId = 0)
            new PhotoPackingSummary
            {
                Id = 9,
                PO = "101008468077",
                ProductCode = "GF-LUX-9900",
                ProductName = "Hộp đóng gói đặc biệt",
                Group = "OSA",
                Creator = "NV-MINH",
                CreateTime = new DateTime(2026, 9, 22, 10, 0, 0),
                Updator = "10321",
                UpdateTime = new DateTime(2026, 9, 22, 10, 0, 0),
                Type = "Gift",
                ProductKey = "GIFT",
                TotalStep = 2,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chờ chụp bước 1 đối chiếu hộp quà tặng"
            },
            // 10. Yêu cầu chụp lại bước 2 (statusId = 2)
            new PhotoPackingSummary
            {
                Id = 10,
                PO = "101008468088",
                ProductCode = "TR-MED-7710",
                ProductName = "Khay phụ tùng y tế",
                Group = "OSA",
                Creator = "NV-QUANG",
                CreateTime = new DateTime(2026, 9, 22, 9, 30, 0),
                Updator = "12653",
                UpdateTime = new DateTime(2026, 9, 22, 10, 20, 0),
                Type = "Tray",
                ProductKey = "TRAY",
                TotalStep = 3,
                CurrentStep = 2,
                NextStep = 2,
                Recapture = true,
                Notes = "Tem nhãn bước 2 bị che khuất, yêu cầu chụp lại rõ thông tin"
            }
        };
    }
}
