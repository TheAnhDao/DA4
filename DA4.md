# **>>>>>> Luồng hoạt động <<<<<<<<<<**



#### A. Luồng dành cho Khách truy cập (chưa đăng nhập)

###### Truy cập Trang chủ (/):



Thấy danh sách các sản phẩm có sẵn.



Có thể xem chi tiết từng sản phẩm.



Có thể xem giỏ hàng, nhưng sẽ được yêu cầu đăng nhập nếu muốn thêm sản phẩm hoặc thanh toán.



Có các liên kết đến trang Đăng nhập và Đăng ký.



###### Đăng ký (/register):



Điền thông tin (Tên, Email, Mật khẩu).



Gửi form để tạo tài khoản mới.



Sau khi đăng ký thành công, được chuyển hướng đến trang Đăng nhập.



###### Đăng nhập (/login):



Điền Email và Mật khẩu.



Gửi form để xác thực.



Nếu thành công: nhận được JWT token và thông tin người dùng, được lưu vào AuthContext và localStorage.



Được chuyển hướng đến Trang chủ (/).



#### B. Luồng dành cho Người dùng đã đăng nhập (User Role)

#### Trang chủ (/):



Thấy danh sách các sản phẩm.



Biểu tượng giỏ hàng có thể hiển thị số lượng sản phẩm.



Có thể có liên kết đến "Hồ sơ của tôi", "Đơn hàng của tôi", "Đăng xuất".



#### Xem chi tiết sản phẩm (/product/:id):



Xem thông tin chi tiết về sản phẩm.



Chọn số lượng và nhấn "Thêm vào giỏ hàng".



Sản phẩm được thêm vào giỏ hàng thông qua API.



#### Xem giỏ hàng (/cart):



Hiển thị danh sách các sản phẩm đã thêm vào giỏ hàng.



Có thể điều chỉnh số lượng từng sản phẩm.



Có thể xóa sản phẩm khỏi giỏ hàng.



Hiển thị tổng số tiền.



Nhấn "Thanh toán".



#### Thanh toán (từ /cart):



Khi nhấn "Thanh toán", API tạo đơn hàng được gọi.



Giỏ hàng của người dùng được chuyển thành một đơn hàng mới.



Giỏ hàng của người dùng được làm trống.



Người dùng được chuyển hướng đến trang "Đơn hàng của tôi" (/my-orders).



#### Đơn hàng của tôi (/my-orders):



Hiển thị danh sách tất cả các đơn hàng mà người dùng đã tạo.



Có thể nhấp vào một đơn hàng cụ thể để xem chi tiết.



#### Chi tiết đơn hàng (/order/:id):



Hiển thị thông tin chi tiết về một đơn hàng cụ thể: mã đơn hàng, ngày đặt, trạng thái, tổng tiền, danh sách sản phẩm.



Thông tin người dùng đặt hàng.



#### Hồ sơ của tôi (/me - chức năng này chúng ta chưa làm frontend, nhưng API đã có):



Xem và cập nhật thông tin cá nhân (tên, email, v.v.).



### C. Luồng dành cho Người dùng quản trị (Admin Role)

#### Đăng nhập với tài khoản Admin (/login):



Sau khi đăng nhập, nếu là admin, có thể có các liên kết bổ sung đến trang quản trị.



#### Trang quản trị / Dashboard Admin (/admin/dashboard):



Hiển thị các số liệu thống kê tổng quan: tổng số người dùng, tổng số sản phẩm đã bán, tổng doanh thu.



Có các liên kết đến các trang quản lý:



#### Quản lý người dùng (/admin/users): Xem, tìm kiếm, xóa người dùng.

#### 

#### Quản lý sản phẩm (/admin/products): Xem, thêm, chỉnh sửa, xóa sản phẩm.

#### 

#### Quản lý đơn hàng (/admin/orders): Xem tất cả đơn hàng, cập nhật trạng thái đơn hàng.

#### 

#### Quản lý sản phẩm (/admin/products):



Xem danh sách tất cả sản phẩm.



Tạo sản phẩm mới.



Chỉnh sửa thông tin sản phẩm hiện có.



Xóa sản phẩm.



#### Quản lý người dùng (/admin/users):



Xem danh sách tất cả người dùng.



Xóa người dùng.



Chức năng cập nhật vai trò người dùng có thể được thêm vào sau.



#### Quản lý đơn hàng (/admin/orders):



Xem danh sách tất cả các đơn hàng từ tất cả người dùng.



Xem chi tiết từng đơn hàng.



Cập nhật trạng thái của đơn hàng (pending, processing, shipped, delivered, cancelled).







# **>>>> CÁC CHỨC NĂNG CHÍNH <<<<<<**





Quản lý người dùng: Đăng ký, đăng nhập, quản lý hồ sơ cá nhân và quản lý người dùng bởi admin.



Quản lý sản phẩm: Xem, tạo, cập nhật, xóa sản phẩm.



Quản lý giỏ hàng: Thêm, cập nhật, xóa sản phẩm trong giỏ hàng cho từng người dùng.



Quản lý đơn hàng: Tạo đơn hàng từ giỏ hàng, xem chi tiết đơn hàng, xem tất cả đơn hàng (admin), cập nhật trạng thái đơn hàng (admin).



Thống kê/Báo cáo: Cung cấp các số liệu quan trọng như tổng người dùng, tổng sản phẩm đã bán và tổng doanh thu (dành cho admin).

