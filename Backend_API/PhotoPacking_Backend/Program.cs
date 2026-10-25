using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Thêm dịch vụ Controllers
builder.Services.AddControllers();

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS cho phép React frontend kết nối
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Bật Swagger trong môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Đảm bảo thư mục Image tồn tại và phục vụ file tĩnh
var imagePath = Path.Combine(builder.Environment.ContentRootPath, "Image");
if (!Directory.Exists(imagePath))
{
    Directory.CreateDirectory(imagePath);
}

var templatePath = Path.Combine(imagePath, "Template");
if (!Directory.Exists(templatePath))
{
    Directory.CreateDirectory(templatePath);
}

var savePath = Path.Combine(imagePath, "Save");
if (!Directory.Exists(savePath))
{
    Directory.CreateDirectory(savePath);
}

// Giả lập độ trễ phản hồi khi tải ảnh từ server để test hiệu ứng loading ảnh trên modal
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/Image"))
    {
        await Task.Delay(600);
    }
    await next();
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagePath),
    RequestPath = "/Image"
});

app.UseAuthorization();
app.MapControllers();

app.Run();
