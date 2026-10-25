using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.Data
{
    public static class Data
    {
        // =========================================================================
        // 1. DỮ LIỆU TEST: CẤU HÌNH BƯỚC CHỤP MẪU (PhotoPackingMasterNavigation)
        // Áp dụng cho từng sản phẩm của các phân xưởng OSA và LXA.
        // Ghi chú: Trường DelFlg giữ mặc định false (không gán dữ liệu test theo chú thích Entity).
        // =========================================================================
        public static List<PhotoPackingMasterNavigation> photoPackingMasterNavigations = new List<PhotoPackingMasterNavigation>
        {
            // --- XƯỞNG OSA ---
            // Sản phẩm H0090924 (Khay Tray, 2 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 1,
                ProductKey = "H0090924",
                StepNo = 1,
                Group = "OSA",
                Notes = "Kiểm tra khay xốp định hình và tem nhãn lô. Khay xốp nguyên vẹn, tem nhãn in sắc nét không bị nhòe góc.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 15, 8, 30, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 15, 14, 20, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 2,
                ProductKey = "H0090924",
                StepNo = 2,
                Group = "OSA",
                Notes = "Đặt linh kiện đúng chiều và niêm phong túi hút ẩm. Đặt đúng 10 linh kiện/khay, gói hút ẩm đặt góc phải trên.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 15, 9, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 15, 14, 25, 0)
            },

            // Sản phẩm H0168277 (Hộp quà Gift, 2 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 3,
                ProductKey = "H0168277",
                StepNo = 1,
                Group = "OSA",
                Notes = "Chụp bao bì hộp quà cao cấp và nhãn phụ. Hộp không trầy xước mép, logo hướng thẳng đứng lên trên.",
                TemplatePath = "/Image/Template/Gift.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 16, 8, 15, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 16, 9, 30, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 4,
                ProductKey = "H0168277",
                StepNo = 2,
                Group = "OSA",
                Notes = "Chụp tem niêm phong hologram chống mở. Dán tem niêm phong chính giữa mép gập hộp, chụp rõ ánh quang.",
                TemplatePath = "/Image/Template/Gift.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 16, 8, 45, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 16, 9, 35, 0)
            },

            // Sản phẩm H0168278 (Thùng Carton Box, 3 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 5,
                ProductKey = "H0168278",
                StepNo = 1,
                Group = "OSA",
                Notes = "Kiểm tra kích thước và kết cấu thùng carton ngoài. Thùng carton 5 lớp không móp méo, dán băng keo chính giữa.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 17, 10, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 17, 11, 10, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 6,
                ProductKey = "H0168278",
                StepNo = 2,
                Group = "OSA",
                Notes = "Xếp lớp chống sốc bóng khí đáy thùng. Lót tối thiểu 2 lớp xốp hơi chống sốc độ dày > 10mm.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 17, 10, 30, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 17, 11, 15, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 7,
                ProductKey = "H0168278",
                StepNo = 3,
                Group = "OSA",
                Notes = "Dán tem vận chuyển và mã QR đơn hàng PO. Dán mặt hông bên phải, cách mép trên 5cm, quét thử đọc được.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 17, 11, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 17, 11, 20, 0)
            },

            // Sản phẩm H0056352 (Khay Tray, 3 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 8,
                ProductKey = "H0056352",
                StepNo = 1,
                Group = "OSA",
                Notes = "Kiểm tra khay định hình linh kiện vi mạch KXL06075. Không bụi bẩn, không trầy nứt mép khay.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 18, 8, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 9, 15, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 9,
                ProductKey = "H0056352",
                StepNo = 2,
                Group = "OSA",
                Notes = "Đặt khay linh kiện vào thùng chứa và chèn tấm xốp phân cách chống va đập.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 18, 8, 30, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 9, 20, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 10,
                ProductKey = "H0056352",
                StepNo = 3,
                Group = "OSA",
                Notes = "Niêm phong nhãn kiểm soát chất lượng và tem mã vạch đơn hàng.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 18, 9, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 9, 25, 0)
            },

            // Sản phẩm H0057444 (Hộp quà Gift, 2 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 11,
                ProductKey = "H0057444",
                StepNo = 1,
                Group = "OSA",
                Notes = "Đóng gói hộp quà tặng linh kiện HF-KXL06100. Đặt nắp khít, tem vỡ bảo hành dán mép góc hộp.",
                TemplatePath = "/Image/Template/Gift.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 18, 10, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 45, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 12,
                ProductKey = "H0057444",
                StepNo = 2,
                Group = "OSA",
                Notes = "Bọc màng co nhiệt bên ngoài hộp quà chống ẩm và trầy xước mép viền.",
                TemplatePath = "/Image/Template/Gift.jpg",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 18, 10, 30, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 50, 0)
            },

            // Sản phẩm H0057443 (Thùng Box, 1 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 13,
                ProductKey = "H0057443",
                StepNo = 1,
                Group = "OSA",
                Notes = "Chụp 1 ảnh xác nhận quy chuẩn thùng đóng gói carton và tem vận chuyển duy nhất.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 19, 9, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 9, 15, 0)
            },

            // --- XƯỞNG LXA ---
            // Sản phẩm LXA-MOD-204 (Mô-đun quang học, 4 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 14,
                ProductKey = "LXA-MOD-204",
                StepNo = 1,
                Group = "LXA",
                Notes = "Kiểm tra nắp chụp bảo vệ đầu quang LC. Đầu quang có nắp cao su chống bụi màu đen cài chặt.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 18, 10, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 0, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 15,
                ProductKey = "LXA-MOD-204",
                StepNo = 2,
                Group = "LXA",
                Notes = "Đóng gói túi nhôm chống tĩnh điện ESD Shielding. Túi nhôm ép nhiệt kín miệng, có nhãn cảnh báo ESD.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 18, 10, 5, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 5, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 16,
                ProductKey = "LXA-MOD-204",
                StepNo = 3,
                Group = "LXA",
                Notes = "Đặt khay định hình 20 chiếc và thẻ kiểm tra chất lượng. Xếp đủ 20 chiếc cùng chiều connector, kèm phiếu QC pass ký tên.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 18, 10, 10, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 10, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 17,
                ProductKey = "LXA-MOD-204",
                StepNo = 4,
                Group = "LXA",
                Notes = "Dán tem niêm phong bảo đảm xưởng LXA tại mép gập hộp thùng carton.",
                TemplatePath = "/Image/Template/Box.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 18, 10, 15, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 18, 10, 15, 0)
            },

            // Sản phẩm LXA-CIR-550 (Bo mạch điều khiển, 3 bước)
            new PhotoPackingMasterNavigation
            {
                Id = 18,
                ProductKey = "LXA-CIR-550",
                StepNo = 1,
                Group = "LXA",
                Notes = "Kiểm tra ngoại quan bo mạch và chân cắm mạ vàng. Không trầy xước đường mạch, không cong vênh chân cắm PIN.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 19, 13, 0, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 13, 0, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 19,
                ProductKey = "LXA-CIR-550",
                StepNo = 2,
                Group = "LXA",
                Notes = "Đặt bo mạch vào khay xốp dẫn hướng chống va đập.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 19, 13, 10, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 13, 10, 0)
            },
            new PhotoPackingMasterNavigation
            {
                Id = 20,
                ProductKey = "LXA-CIR-550",
                StepNo = 3,
                Group = "LXA",
                Notes = "Dán tem QA Pass và quét kiểm tra mã vạch trước khi đóng thùng.",
                TemplatePath = "/Image/Template/Tray.jpg",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 19, 13, 20, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 13, 20, 0)
            }
        };

        // =========================================================================
        // 2. DỮ LIỆU TEST: CHI TIẾT TỪNG BƯỚC CHỤP CỦA ĐƠN HÀNG (PhotoPackingItem)
        // Ánh xạ chi tiết lịch sử chụp của từng bước trong mỗi đơn hàng PO.
        // Ghi chú: Trường DelFlg giữ mặc định false (không gán dữ liệu test theo chú thích Entity).
        // =========================================================================
        public static List<PhotoPackingItem> photoPackingItems = new List<PhotoPackingItem>
        {
            // Đơn PO 101008468010 (Đã hoàn thành 2/2 bước)
            new PhotoPackingItem
            {
                Id = 1,
                PONumber = "101008468010",
                ProductCode = "H0090924",
                ProductName = "HF-KXG-0630-C-PT-HN",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008468010_1.jpg",
                Image = "101008468010_1.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "H0090924",
                Notes = "Khay xốp nguyên vẹn, tem nhãn rõ nét",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 20, 8, 45, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 20, 9, 0, 0)
            },
            new PhotoPackingItem
            {
                Id = 2,
                PONumber = "101008468010",
                ProductCode = "H0090924",
                ProductName = "HF-KXG-0630-C-PT-HN",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "/Image/Save/101008468010_2.jpg",
                Image = "101008468010_2.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "H0090924",
                Notes = "Đã xếp đủ 10 linh kiện và túi hút ẩm",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 20, 9, 10, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 20, 9, 15, 0)
            },

            // Đơn PO 101008467994 (Đang chụp bước 2/2)
            new PhotoPackingItem
            {
                Id = 3,
                PONumber = "101008467994",
                ProductCode = "H0168277",
                ProductName = "HF-KXL06-C-HNC-SUS",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008467994_1.jpg",
                Image = "101008467994_1.jpg",
                SampleUrl = "/Image/Template/Gift.jpg",
                ReCapture = false,
                ProductKey = "H0168277",
                Notes = "Đã chụp bao bì hộp quà cao cấp",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 21, 10, 15, 0),
                Updater = 12653,
                UpdatedTime = new DateTime(2026, 9, 21, 10, 30, 0)
            },
            new PhotoPackingItem
            {
                Id = 4,
                PONumber = "101008467994",
                ProductCode = "H0168277",
                ProductName = "HF-KXL06-C-HNC-SUS",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Gift.jpg",
                ReCapture = false,
                ProductKey = "H0168277",
                Notes = "Chờ chụp tem niêm phong hologram"
            },

            // Đơn PO 101008468015 (Chờ chụp 0/3)
            new PhotoPackingItem
            {
                Id = 5,
                PONumber = "101008468015",
                ProductCode = "H0168278",
                ProductName = "HF-KXL06-F-HNC-SUS",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "H0168278",
                Notes = "Chờ kiểm tra kích thước thùng carton"
            },
            new PhotoPackingItem
            {
                Id = 6,
                PONumber = "101008468015",
                ProductCode = "H0168278",
                ProductName = "HF-KXL06-F-HNC-SUS",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "H0168278",
                Notes = "Chờ xếp lớp chống sốc bóng khí"
            },
            new PhotoPackingItem
            {
                Id = 7,
                PONumber = "101008468015",
                ProductCode = "H0168278",
                ProductName = "HF-KXL06-F-HNC-SUS",
                Group = "OSA",
                StepNo = 3,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "H0168278",
                Notes = "Chờ dán tem vận chuyển và mã QR"
            },

            // Đơn PO 101008468022 (Đang chụp bước 2/3)
            new PhotoPackingItem
            {
                Id = 8,
                PONumber = "101008468022",
                ProductCode = "H0056352",
                ProductName = "KXL06075-ORGOP4-HNB",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008468022_1.jpg",
                Image = "101008468022_1.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "H0056352",
                Notes = "Khay vi mạch sạch, không nứt mép",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 22, 8, 30, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 8, 45, 0)
            },
            new PhotoPackingItem
            {
                Id = 9,
                PONumber = "101008468022",
                ProductCode = "H0056352",
                ProductName = "KXL06075-ORGOP4-HNB",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "H0056352",
                Notes = "Chuẩn bị chụp xếp xốp ngăn tĩnh điện"
            },
            new PhotoPackingItem
            {
                Id = 10,
                PONumber = "101008468022",
                ProductCode = "H0056352",
                ProductName = "KXL06075-ORGOP4-HNB",
                Group = "OSA",
                StepNo = 3,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "H0056352",
                Notes = "Chờ niêm phong nắp khay"
            },

            // Đơn PO 101008468033 (Yêu cầu chụp lại bước 1/2)
            new PhotoPackingItem
            {
                Id = 11,
                PONumber = "101008468033",
                ProductCode = "H0057444",
                ProductName = "HF-KXL06100-CW-HNB",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008468033_1.jpg",
                Image = "101008468033_1.jpg",
                SampleUrl = "/Image/Template/Gift.jpg",
                ReCapture = true,
                ProductKey = "H0057444",
                Notes = "Ảnh bước 1 bị mờ góc tem nhãn, yêu cầu chụp lại góc thẳng",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 22, 8, 50, 0),
                Updater = 12653,
                UpdatedTime = new DateTime(2026, 9, 22, 9, 10, 0)
            },
            new PhotoPackingItem
            {
                Id = 12,
                PONumber = "101008468033",
                ProductCode = "H0057444",
                ProductName = "HF-KXL06100-CW-HNB",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Gift.jpg",
                ReCapture = false,
                ProductKey = "H0057444",
                Notes = "Chờ hoàn thành chụp lại bước 1"
            },

            // Đơn PO 101008468045 (Chờ chụp 1 bước)
            new PhotoPackingItem
            {
                Id = 13,
                PONumber = "101008468045",
                ProductCode = "H0057443",
                ProductName = "HF-KXL06075-CW-HNB",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "H0057443",
                Notes = "Chờ chụp 1 ảnh xác nhận quy chuẩn thùng"
            },

            // Đơn PO 101008468058 (Đã hoàn thành 2/2 bước)
            new PhotoPackingItem
            {
                Id = 14,
                PONumber = "101008468058",
                ProductCode = "KGW06100T-RC",
                ProductName = "Linh kiện cơ khí KGW",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008468058_1.jpg",
                Image = "101008468058_1.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "KGW06100T-RC",
                Notes = "Khay Tray cơ khí đạt tiêu chuẩn",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 19, 14, 20, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 14, 50, 0)
            },
            new PhotoPackingItem
            {
                Id = 15,
                PONumber = "101008468058",
                ProductCode = "KGW06100T-RC",
                ProductName = "Linh kiện cơ khí KGW",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "/Image/Save/101008468058_2.jpg",
                Image = "101008468058_2.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "KGW06100T-RC",
                Notes = "Đã hoàn thành niêm phong nắp khay",
                Creator = 14081,
                CreateTime = new DateTime(2026, 9, 19, 14, 40, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 19, 14, 50, 0)
            },

            // Đơn PO 101008468088 (Yêu cầu chụp lại bước 2/3)
            new PhotoPackingItem
            {
                Id = 16,
                PONumber = "101008468088",
                ProductCode = "TR-MED-7710",
                ProductName = "Khay phụ tùng y tế",
                Group = "OSA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008468088_1.jpg",
                Image = "101008468088_1.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "TR-MED-7710",
                Notes = "Khay y tế vô trùng nguyên vẹn",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 22, 9, 45, 0),
                Updater = 12653,
                UpdatedTime = new DateTime(2026, 9, 22, 10, 0, 0)
            },
            new PhotoPackingItem
            {
                Id = 17,
                PONumber = "101008468088",
                ProductCode = "TR-MED-7710",
                ProductName = "Khay phụ tùng y tế",
                Group = "OSA",
                StepNo = 2,
                ImagePath = "/Image/Save/101008468088_2.jpg",
                Image = "101008468088_2.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = true,
                Notes = "Tem nhãn bước 2 bị che khuất mã QR, yêu cầu chụp lại rõ thông tin",
                Creator = 14082,
                CreateTime = new DateTime(2026, 9, 22, 10, 10, 0),
                Updater = 12653,
                UpdatedTime = new DateTime(2026, 9, 22, 10, 20, 0)
            },
            new PhotoPackingItem
            {
                Id = 18,
                PONumber = "101008468088",
                ProductCode = "TR-MED-7710",
                ProductName = "Khay phụ tùng y tế",
                Group = "OSA",
                StepNo = 3,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "TR-MED-7710",
                Notes = "Chờ bước 3 sau khi chụp lại bước 2"
            },

            // Đơn PO LXA 101008348773 (Đã hoàn thành 4/4 bước)
            new PhotoPackingItem
            {
                Id = 19,
                PONumber = "101008348773",
                ProductCode = "LXA-MOD-204",
                ProductName = "Mô-đun quang học LXA Optical Transceiver",
                Group = "LXA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008348773_1.jpg",
                Image = "101008348773_1.jpg",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "LXA-MOD-204",
                Notes = "Đầu quang có nắp cài chặt",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 22, 8, 20, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 9, 40, 0)
            },
            new PhotoPackingItem
            {
                Id = 20,
                PONumber = "101008348773",
                ProductCode = "LXA-MOD-204",
                ProductName = "Mô-đun quang học LXA Optical Transceiver",
                Group = "LXA",
                StepNo = 2,
                ImagePath = "/Image/Save/101008348773_2.jpg",
                Image = "101008348773_2.jpg",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "LXA-MOD-204",
                Notes = "Túi nhôm ép nhiệt kín",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 22, 8, 45, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 9, 40, 0)
            },
            new PhotoPackingItem
            {
                Id = 21,
                PONumber = "101008348773",
                ProductCode = "LXA-MOD-204",
                ProductName = "Mô-đun quang học LXA Optical Transceiver",
                Group = "LXA",
                StepNo = 3,
                ImagePath = "/Image/Save/101008348773_3.jpg",
                Image = "101008348773_3.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "LXA-MOD-204",
                Notes = "Khay 20 chiếc kèm phiếu QC pass",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 22, 9, 15, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 9, 40, 0)
            },
            new PhotoPackingItem
            {
                Id = 22,
                PONumber = "101008348773",
                ProductCode = "LXA-MOD-204",
                ProductName = "Mô-đun quang học LXA Optical Transceiver",
                Group = "LXA",
                StepNo = 4,
                ImagePath = "/Image/Save/101008348773_4.jpg",
                Image = "101008348773_4.jpg",
                SampleUrl = "/Image/Template/Box.jpg",
                ReCapture = false,
                ProductKey = "LXA-MOD-204",
                Notes = "Dán tem niêm phong LXA Security seal",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 22, 9, 35, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 9, 40, 0)
            },

            // Đơn PO LXA 101008277127 (Đang chụp bước 2/3)
            new PhotoPackingItem
            {
                Id = 23,
                PONumber = "101008277127",
                ProductCode = "LXA-CIR-550",
                ProductName = "Bảng mạch điều khiển LXA High-Speed Controller",
                Group = "LXA",
                StepNo = 1,
                ImagePath = "/Image/Save/101008277127_1.jpg",
                Image = "101008277127_1.jpg",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "LXA-CIR-550",
                Notes = "Ngoại quan bo mạch đạt chuẩn",
                Creator = 30090,
                CreateTime = new DateTime(2026, 9, 22, 9, 20, 0),
                Updater = 10321,
                UpdatedTime = new DateTime(2026, 9, 22, 10, 15, 0)
            },
            new PhotoPackingItem
            {
                Id = 24,
                PONumber = "101008277127",
                ProductCode = "LXA-CIR-550",
                ProductName = "Bảng mạch điều khiển LXA High-Speed Controller",
                Group = "LXA",
                StepNo = 2,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "LXA-CIR-550",
                Notes = "Chờ bước 2 xếp khay xốp cách điện"
            },
            new PhotoPackingItem
            {
                Id = 25,
                PONumber = "101008277127",
                ProductCode = "LXA-CIR-550",
                ProductName = "Bảng mạch điều khiển LXA High-Speed Controller",
                Group = "LXA",
                StepNo = 3,
                ImagePath = "",
                Image = "",
                SampleUrl = "/Image/Template/Tray.jpg",
                ReCapture = false,
                ProductKey = "LXA-CIR-550",
                Notes = "Chờ bước 3 dán tem QA Pass"
            }
        };

        // =========================================================================
        // 3. DỮ LIỆU TEST: THÔNG TIN TỔNG QUÁT ĐƠN HÀNG (PhotoPackingSummary)
        // Dùng trả về cho danh sách đơn hàng PO, kiểm tra tiến độ và Dashboard.
        // Ghi chú tuân thủ Entity & UserList:
        // - Trường Creator chỉ lấy các User có Role là "User" từ danh sách UserList (14081, 14082, 30090).
        // - Bổ sung đầy đủ ShipDate (int yyyyMMdd) để tính ShipDateTime và IsExpiringSoon.
        // - StatusId tự động tính dựa trên Recapture, TotalStep, CurrentStep, NextStep.
        // =========================================================================
        public static List<PhotoPackingSummary> photoPackingSummaries = new List<PhotoPackingSummary>
        {
            // 1. Đã hoàn thành (StatusId = 3, NextStep = 0, Recapture = false)
            new PhotoPackingSummary
            {
                Id = 1,
                PO = "101008468010",
                ProductCode = "H0090924",
                ProductName = "HF-KXG-0630-C-PT-HN",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 20, 8, 45, 0),
                Type = "Tray",
                ProductKey = "H0090924",
                TotalStep = 2,
                CurrentStep = 2,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn tất đóng gói 2 bước khay định hình linh kiện",
                ShipDate = 20261025
            },

            // 2. Đang chụp bước 2 (StatusId = 1, NextStep = 2, Recapture = false)
            new PhotoPackingSummary
            {
                Id = 2,
                PO = "101008467994",
                ProductCode = "H0168277",
                ProductName = "HF-KXL06-C-HNC-SUS",
                Group = "OSA",
                Creator = "14082",
                CreateTime = new DateTime(2026, 9, 21, 10, 15, 0),
                Type = "Gift",
                ProductKey = "H0168277",
                TotalStep = 2,
                CurrentStep = 1,
                NextStep = 2,
                Recapture = false,
                Notes = "Đã chụp bước 1 ảnh tổng thể, chuẩn bị bước 2 chụp tem niêm phong",
                ShipDate = 20261026
            },

            // 3. Chờ chụp (StatusId = 0, CurrentStep = 0, NextStep = 1, Recapture = false)
            new PhotoPackingSummary
            {
                Id = 3,
                PO = "101008468015",
                ProductCode = "H0168278",
                ProductName = "HF-KXL06-F-HNC-SUS",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 22, 7, 15, 0),
                Type = "Box",
                ProductKey = "H0168278",
                TotalStep = 3,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chờ chụp bước 1: kiểm tra quy chuẩn thùng carton",
                ShipDate = 20261028
            },

            // 4. Đang chụp bước 2 (StatusId = 1, NextStep = 2, Recapture = false)
            new PhotoPackingSummary
            {
                Id = 4,
                PO = "101008468022",
                ProductCode = "H0056352",
                ProductName = "KXL06075-ORGOP4-HNB",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 22, 8, 30, 0),
                Type = "Tray",
                ProductKey = "H0056352",
                TotalStep = 3,
                CurrentStep = 1,
                NextStep = 2,
                Recapture = false,
                Notes = "Đã xong bước 1, chuẩn bị chụp bước 2 khay linh kiện",
                ShipDate = 20261027
            },

            // 5. Yêu cầu chụp lại (StatusId = 2, Recapture = true)
            new PhotoPackingSummary
            {
                Id = 5,
                PO = "101008468033",
                ProductCode = "H0057444",
                ProductName = "HF-KXL06100-CW-HNB",
                Group = "OSA",
                Creator = "14082",
                CreateTime = new DateTime(2026, 9, 22, 8, 50, 0),
                Type = "Gift",
                ProductKey = "H0057444",
                TotalStep = 2,
                CurrentStep = 1,
                NextStep = 1,
                Recapture = true,
                Notes = "Ảnh bước 1 bị mờ góc tem nhãn, yêu cầu chụp lại góc thẳng",
                ShipDate = 20261025
            },

            // 6. Chờ chụp 1 ảnh duy nhất (StatusId = 0, TotalStep = 1)
            new PhotoPackingSummary
            {
                Id = 6,
                PO = "101008468045",
                ProductCode = "H0057443",
                ProductName = "HF-KXL06075-CW-HNB",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 22, 9, 0, 0),
                Type = "Box",
                ProductKey = "H0057443",
                TotalStep = 1,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chụp 1 ảnh xác nhận quy chuẩn thùng đóng gói duy nhất",
                ShipDate = 20261030
            },

            // 7. Đã hoàn thành (StatusId = 3, TotalStep = 2, CurrentStep = 2, NextStep = 0)
            new PhotoPackingSummary
            {
                Id = 7,
                PO = "101008468058",
                ProductCode = "KGW06100T-RC",
                ProductName = "Linh kiện cơ khí KGW",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 19, 14, 20, 0),
                Type = "Tray",
                ProductKey = "KGW06100T-RC",
                TotalStep = 2,
                CurrentStep = 2,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn thành kiểm tra đóng gói khay Tray đạt chuẩn",
                ShipDate = 20261024
            },

            // 8. Đã hoàn thành (StatusId = 3, TotalStep = 3, CurrentStep = 3, NextStep = 0)
            new PhotoPackingSummary
            {
                Id = 8,
                PO = "101008468069",
                ProductCode = "US-EKS3-10R-V",
                ProductName = "Cụm linh kiện SI tiêu chuẩn",
                Group = "OSA",
                Creator = "14082",
                CreateTime = new DateTime(2026, 9, 18, 11, 20, 0),
                Type = "Box",
                ProductKey = "US-EKS3-10R-V",
                TotalStep = 3,
                CurrentStep = 3,
                NextStep = 0,
                Recapture = false,
                Notes = "Đã hoàn thành 3 bước đóng gói xuất xưởng",
                ShipDate = 20261023
            },

            // 9. Chờ chụp (StatusId = 0, CurrentStep = 0, NextStep = 1)
            new PhotoPackingSummary
            {
                Id = 9,
                PO = "101008468077",
                ProductCode = "GF-LUX-9900",
                ProductName = "Hộp đóng gói đặc biệt",
                Group = "OSA",
                Creator = "14081",
                CreateTime = new DateTime(2026, 9, 22, 10, 0, 0),
                Type = "Gift",
                ProductKey = "GF-LUX-9900",
                TotalStep = 2,
                CurrentStep = 0,
                NextStep = 1,
                Recapture = false,
                Notes = "Chờ chụp bước 1 đối chiếu hộp quà tặng",
                ShipDate = 20261029
            },

            // 10. Yêu cầu chụp lại bước 2 (StatusId = 2, Recapture = true)
            new PhotoPackingSummary
            {
                Id = 10,
                PO = "101008468088",
                ProductCode = "TR-MED-7710",
                ProductName = "Khay phụ tùng y tế",
                Group = "OSA",
                Creator = "14082",
                CreateTime = new DateTime(2026, 9, 22, 9, 45, 0),
                Type = "Tray",
                ProductKey = "TR-MED-7710",
                TotalStep = 3,
                CurrentStep = 2,
                NextStep = 2,
                Recapture = true,
                Notes = "Tem nhãn bước 2 bị che khuất, yêu cầu chụp lại rõ thông tin",
                ShipDate = 20261025
            },

            // 11. Đơn hàng Xưởng LXA - Đã hoàn thành (StatusId = 3, TotalStep = 4, CurrentStep = 4)
            new PhotoPackingSummary
            {
                Id = 11,
                PO = "101008348773",
                ProductCode = "LXA-MOD-204",
                ProductName = "Mô-đun quang học LXA Optical Transceiver",
                Group = "LXA",
                Creator = "30090",
                CreateTime = new DateTime(2026, 9, 22, 8, 20, 0),
                Type = "Box",
                ProductKey = "LXA-MOD-204",
                TotalStep = 4,
                CurrentStep = 4,
                NextStep = 0,
                Recapture = false,
                Notes = "Hoàn tất 4 bước kiểm tra đóng gói túi ESD và tem niêm phong LXA",
                ShipDate = 20261026
            },

            // 12. Đơn hàng Xưởng LXA - Đang chụp (StatusId = 1, CurrentStep = 1, NextStep = 2)
            new PhotoPackingSummary
            {
                Id = 12,
                PO = "101008277127",
                ProductCode = "LXA-CIR-550",
                ProductName = "Bảng mạch điều khiển LXA High-Speed Controller",
                Group = "LXA",
                Creator = "30090",
                CreateTime = new DateTime(2026, 9, 22, 9, 20, 0),
                Type = "Tray",
                ProductKey = "LXA-CIR-550",
                TotalStep = 3,
                CurrentStep = 1,
                NextStep = 2,
                Recapture = false,
                Notes = "Đã xong bước 1, chuẩn bị chụp bước 2 khay xốp cách điện",
                ShipDate = 20261027
            }
        };

        public static List<User> Users = new List<User> 
        {
            new User
            {
                Id = 14081,
                UserName = "Trần Quang Khải",
                Role = "User",
                Group = "OSA"
            },
            new User
            {
                Id = 14082,
                UserName = "Nguyễn Xuân Thu",
                Role = "User",
                Group = "OSA"
            },
            new User 
            {
                Id = 1221,
                UserName = "Lý Thị Huyền Châu",
                Role = "Leader",
                Group = "OSA",
            },
            new User
            {
                Id = 1241,
                UserName = "Lê Hoàng Thuận",
                Role = "SubLeader",
                Group = "OSA"
            },
            new User
            {
                Id = 30090,
                UserName = "Vương Thuý Kiều",
                Group = "LXA",
                Role = "User",
            },
            new User
            {
                Id = 30123,
                UserName = "Mã Giám Sinh",
                Group = "LXA",
                Role = "SubLeader"
            },
            new User
            {
                Id = 1840,
                UserName = "Đỗ Hải",
                Group = "LXA",
                Role = "Leader"
            }

        };

        // Danh sách UserList (alias tham chiếu đến Users để hỗ trợ cả hai tên gọi)
        public static List<User> UserList => Users;
    }
}
