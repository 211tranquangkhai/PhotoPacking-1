// Tài liệu để người dùng ghi chú những thông tin cần chỉnh sửa. AI không được xem đây là yêu cầu từ người dùng rồi tự ý thực hiện.

Data:
OK- Tạo lại toàn bộ dữ liệu test dựa theo các class trong Entities.
OK- Tạo các Api Controller tương ứng.
OK- Lên kế hoạch dọn dẹp dữ liệu + code dư thừa
OK- Thực thi kế hoạch trên.
OK- Với Api thêm master navi, ảnh sẽ lưu vào folder, dữ liệu sẽ lưu vào DB (comment nơi cần thêm code để người dùng tự thêm)

OK- Phía front end tạo/sửa interface/class tương ứng, dữ liệu từ lúc này chỉ nhận qua api back end trả về. 
OK- Lên kế hoạch dọn dẹp dữ liệu và code dư thừa. Thực thi kế hoạch.

Header:
OK- Loại bỏ nút Refresh trên thanh header, bổ sung nút đăng xuất (chỉ icon) bên trong thẻ Profile
OK- Tách riêng các trang, để khi người dùng F5 (reload) chỉ load lại trang hiện tại

Tools bar:
OK- Trang Photo: Thu gọn kích thước search input do chỉ nhập và tìm kiếm số PO.
OK- Trang Photo: Dropdown trạng thái thêm bo góc (hoặc căn chỉnh lại cho đẹp).
OK- Trang photo: Datepicker có thể chuyển sang dùng shadcn ui + tailwind.
OK- Trang photo: Thêm nút xem tất cả ảnh.
OK- Trang Photo: Thêm nút reload để tải lại dữ liệu trang.

Chỉnh sửa khác:
OK- Cân nhắc thử đưa các thẻ tổng quát bên dashboard sang Photo.

Table: 
OK- Bỏ tổng quát ở footer table, thay vào đó là phân trang.

Modal xem ảnh:
OK- Modal navi: Bổ sung các nút zoom, rotate bên phần xem ảnh. Đồng thời xoá bỏ phần đường dẫn và nút mở ảnh gốc ở góc dưới 2 bên. 
- Modal Photo Detail + Summary: Bố cục tương tự như Modal Navi.
- Modal Photo Summary: Cần phương án phù hợp để lấy nhiều ảnh và thông tin từ backend. Xem ảnh theo kiểu carousel (chỉ tham khảo cách hiển thị), khi chuyển ảnh sẽ nhảy thông tin tương ứng với ảnh. Do nhận dữ liệu qua api nên cần tìm cách nén dữ liệu nhẹ nhất có thể (cả backend lẫn front end).
      + 1 phương pháp, chỉ lấy thông tin ảnh, khi người dùng chuyển thông tin mới gọi api để lấy ảnh (Xem tới đâu lấy ảnh tới đó). Tạo một api chỉ trả về ảnh, thông tin trong danh sách trả về sẽ bao gồm đường dẫn api, vd: sampleUrl = 'api/image/{id}'.

Sửa modal thêm/sửa master.
Cân nhắc sửa trang dashboard.

Kiểm tra bổ sung hiệu ứng loading. 
Kiểm tra đã có error ở những nơi gọi api (trường hợp api fail).
Mỗi thành phần gọi một API riêng, do đó cân nhắc khi làm loading toàn trang.
