using Microsoft.AspNetCore.Mvc;
using PhotoPacking_Backend.Data;
using PhotoPacking_Backend.Entities;

namespace PhotoPacking_Backend.ApiController
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        /// <summary>
        /// Lấy toàn bộ danh sách người dùng hoặc tìm kiếm theo vai trò (Role), phân xưởng (Group), hoặc UserId
        /// GET: /api/user hoặc /api/users
        /// </summary>
        [HttpGet]
        public IActionResult GetUsers([FromQuery] int? userId, [FromQuery] string? role, [FromQuery] string? group)
        {
            if (userId.HasValue)
            {
                return GetUserById(userId.Value);
            }

            var query = Data.Data.UserList.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.Role.Equals(role.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(group))
            {
                query = query.Where(u => u.Group.Equals(group.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            return Ok(query.ToList());
        }

        /// <summary>
        /// API lấy thông tin người dùng theo UserId, phục vụ đăng nhập / xác thực hệ thống
        /// Hỗ trợ các endpoint:
        /// - GET: /api/user/{userId}
        /// - GET: /api/users/{userId}
        /// - GET: /api/user/login/{userId}
        /// </summary>
        /// <param name="userId">Mã định danh UserId của người dùng</param>
        /// <returns>Đối tượng User tương ứng nếu tìm thấy, hoặc 404 NotFound</returns>
        [HttpGet("{userId:int}")]
        [HttpGet("login/{userId:int}")]
        public IActionResult GetUserById(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "UserId không hợp lệ. Vui lòng cung cấp mã người dùng lớn hơn 0."
                });
            }

            var user = Data.Data.UserList.FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Không tìm thấy người dùng với UserId: {userId}"
                });
            }

            return Ok(user);
        }

        /// <summary>
        /// API đăng nhập bằng UserId thông qua HTTP POST (payload JSON: { "userId": 14081 })
        /// Hỗ trợ các endpoint:
        /// - POST: /api/user/login
        /// - POST: /api/users/login
        /// </summary>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || request.UserId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Tham số UserId không hợp lệ. Vui lòng truyền mã người dùng hợp lệ."
                });
            }

            var user = Data.Data.UserList.FirstOrDefault(u => u.Id == request.UserId);
            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Đăng nhập thất bại: Không tìm thấy người dùng có mã UserId {request.UserId}"
                });
            }

            return Ok(user);
        }
    }

    /// <summary>
    /// Model DTO yêu cầu đăng nhập bằng UserId
    /// </summary>
    public class LoginRequest
    {
        public int UserId { get; set; }
    }
}
